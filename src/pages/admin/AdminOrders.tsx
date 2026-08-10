import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Package, Eye, FileText, Link2, RefreshCw, Image as ImageIcon } from 'lucide-react';

import AttachmentPreview from '@/components/chat/AttachmentPreview';
import { toast } from 'sonner';
import { safeExternalUrl } from '@/lib/safeUrl';

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewing, setViewing] = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any>(null);
  const [reqFiles, setReqFiles] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const enriched = await Promise.all(
      (data || []).map(async (o: any) => {
        const [b, f, g] = await Promise.all([
          supabase.from('profiles').select('full_name').eq('id', o.buyer_id).maybeSingle(),
          supabase.from('freelancers').select('user_id').eq('id', o.freelancer_id).maybeSingle(),
          o.gig_id
            ? supabase.from('gigs').select('title').eq('id', o.gig_id).maybeSingle()
            : Promise.resolve({ data: null }),
        ]);
        let sn = 'Fivesom User';
        if (f.data?.user_id) {
          const { data: sp } = await supabase.from('profiles').select('full_name').eq('id', f.data.user_id).maybeSingle();
          sn = sp?.full_name || 'Fivesom User';
        }
        return { ...o, buyer_name: b.data?.full_name, seller_name: sn, gig_title: g.data?.title };
      })
    );
    setOrders(enriched);
    setSelected([]);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const update = async (id: string, status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled') => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) return toast.error('Failed');
    toast.success(`Order ${status}`);
    fetch();
  };

  const toggleOne = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const deleteOrders = async (ids: string[]) => {
    if (!ids.length) return;
    if (!window.confirm(`Delete ${ids.length} order(s)? This cannot be undone.`)) return;
    setDeleting(true);
    const { data, error } = await (supabase as any).rpc('admin_delete_orders', { _ids: ids });
    setDeleting(false);
    if (error) return toast.error(error.message || 'Failed to delete orders');
    toast.success(`${data ?? ids.length} order(s) deleted`);
    setOrders((prev) => prev.filter((o) => !ids.includes(o.id)));
    setSelected((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const openOrder = async (o: any) => {
    setViewing(o);
    setViewLoading(true);
    setDeliveries([]);
    setRequirements(null);
    setReqFiles([]);
    const [delRes, reqRes] = await Promise.all([
      (supabase as any).from('order_deliveries').select('*').eq('order_id', o.id).order('delivered_at', { ascending: false }),
      supabase.from('order_requirements').select('*').eq('order_id', o.id).maybeSingle(),
    ]);
    setDeliveries(delRes.data || []);
    if (reqRes.data) {
      setRequirements(reqRes.data);
      const { data: files } = await supabase
        .from('order_requirement_files')
        .select('*')
        .eq('order_requirement_id', reqRes.data.id);
      setReqFiles(files || []);
    }
    setViewLoading(false);
  };

  const filtered = orders.filter((o) => {
    const s = search.toLowerCase();
    const matchS = !s || (o.buyer_name || '').toLowerCase().includes(s) || (o.seller_name || '').toLowerCase().includes(s) || (o.gig_title || '').toLowerCase().includes(s);
    const matchF = filter === 'all' || o.status === filter;
    return matchS && matchF;
  });

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: orders.length },
          { label: 'Active', value: orders.filter((o) => o.status === 'in_progress' || o.status === 'pending').length },
          { label: 'Delivered', value: orders.filter((o) => o.status === 'delivered').length },
          { label: 'Cancelled', value: orders.filter((o) => o.status === 'cancelled').length },
        ].map((s) => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> All Orders</CardTitle>
          <div className="flex gap-2 items-center flex-wrap">
            {selected.length > 0 && (
              <Button size="sm" variant="destructive" className="h-9" disabled={deleting}
                      onClick={() => deleteOrders(selected)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete Selected ({selected.length})
              </Button>
            )}
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="pl-9 h-9" />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">Active</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={filtered.length > 0 && filtered.every((o) => selected.includes(o.id))}
                    onCheckedChange={(v) =>
                      setSelected(v ? filtered.map((o) => o.id) : [])
                    }
                    aria-label="Select all orders"
                  />
                </TableHead>
                <TableHead>Gig</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id} data-state={selected.includes(o.id) ? 'selected' : undefined}>
                  <TableCell>
                    <Checkbox checked={selected.includes(o.id)} onCheckedChange={() => toggleOne(o.id)}
                              aria-label="Select order" />
                  </TableCell>
                  <TableCell className="text-sm font-medium truncate max-w-[200px]">{o.gig_title || o.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-sm">{o.buyer_name}</TableCell>
                  <TableCell className="text-sm">{o.seller_name}</TableCell>
                  <TableCell className="font-bold">${Number(o.amount).toFixed(2)}</TableCell>
                  <TableCell><Badge variant="outline">{o.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openOrder(o)}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                      {o.status !== 'completed' && <Button size="sm" className="h-7 text-xs" onClick={() => update(o.id, 'completed')}>Force Complete</Button>}
                      {o.status !== 'cancelled' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => update(o.id, 'cancelled')}>Cancel</Button>}
                      <Button size="sm" variant="destructive" className="h-7 text-xs" disabled={deleting}
                              onClick={() => deleteOrders([o.id])}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No orders</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" /> {viewing.gig_title || 'Order'}
                </DialogTitle>
                <DialogDescription>
                  {viewing.buyer_name} → {viewing.seller_name} · ${Number(viewing.amount).toFixed(2)} ·{' '}
                  <Badge variant="outline" className="ml-1">{viewing.status}</Badge>
                </DialogDescription>
              </DialogHeader>

              {viewLoading ? (
                <div className="py-12 text-center text-muted-foreground text-sm">Loading delivery content…</div>
              ) : (
                <div className="space-y-6 mt-2">
                  {/* Buyer Requirements */}
                  <section>
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Buyer Requirements
                    </h4>
                    {!requirements ? (
                      <p className="text-sm text-muted-foreground italic">Buyer did not submit requirements.</p>
                    ) : (
                      <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
                        {requirements.instructions && (
                          <p className="text-sm whitespace-pre-wrap">{requirements.instructions}</p>
                        )}
                        {requirements.external_links?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {requirements.external_links.map((l: string, i: number) => safeExternalUrl(l) && (
                              <a key={i} href={safeExternalUrl(l)!} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground inline-flex items-center gap-1">
                                <Link2 className="h-3 w-3" /> Link {i + 1}
                              </a>
                            ))}
                          </div>
                        )}
                        {reqFiles.length > 0 && (
                          <div className="space-y-2">
                            {reqFiles.map((f: any) => <AttachmentPreview key={f.id} url={f.file_url} />)}
                          </div>
                        )}
                      </div>
                    )}
                  </section>

                  {/* Deliveries history */}
                  <section>
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Freelancer Deliveries ({deliveries.length})
                    </h4>
                    {deliveries.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No deliveries submitted yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {deliveries.map((d: any, idx: number) => (
                          <div key={d.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs">
                                <Badge variant={d.status === 'revision_requested' ? 'destructive' : 'default'}>
                                  {d.status === 'revision_requested' && <RefreshCw className="h-3 w-3 mr-1" />}
                                  Submission #{deliveries.length - idx} · {d.status}
                                </Badge>
                                <span className="text-muted-foreground">
                                  {new Date(d.delivered_at).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            {d.delivery_message && (
                              <div className="text-sm whitespace-pre-wrap bg-muted/30 rounded p-2">{d.delivery_message}</div>
                            )}
                            {d.delivery_file_url && <AttachmentPreview url={d.delivery_file_url} />}
                            {safeExternalUrl(d.delivery_link) && (
                              <a href={safeExternalUrl(d.delivery_link)!} target="_blank" rel="noreferrer"
                                 className="text-xs text-primary inline-flex items-center gap-1 underline">
                                <Link2 className="h-3 w-3" /> {d.delivery_link}
                              </a>
                            )}
                            {d.revision_feedback && (
                              <div className="text-xs rounded border border-yellow-500/30 bg-yellow-500/10 p-2">
                                <p className="font-semibold text-yellow-600 mb-1">Buyer revision feedback:</p>
                                <p className="whitespace-pre-wrap">{d.revision_feedback}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
