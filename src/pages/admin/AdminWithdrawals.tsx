import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Wallet, Eye, Building2, Smartphone, Check, X, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface WithdrawalRow {
  id: string;
  freelancer_id: string;
  amount: number;
  fee_percent: number | null;
  fee_amount: number | null;
  net_amount: number | null;
  status: string;
  method: string | null;
  bank_name: string | null;
  account_number: string | null;
  swift_code: string | null;
  country: string | null;
  city: string | null;
  mobile_provider: string | null;
  mobile_number: string | null;
  country_code: string | null;
  receiver_first_name: string | null;
  receiver_middle_name: string | null;
  receiver_last_name: string | null;
  reason: string | null;
  requested_at: string;
  processed_at: string | null;
  user_name?: string;
  user_email?: string;
}

const Field = ({ label, value, copyable }: { label: string; value?: string | number | null; copyable?: boolean }) => {
  const v = value == null || value === '' ? null : String(value);
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-foreground break-words flex-1">{v || '—'}</p>
        {copyable && v && (
          <button
            type="button"
            onClick={() => { navigator.clipboard.writeText(v); toast.success(`${label} copied`); }}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            title={`Copy ${label}`}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

const AdminWithdrawals = () => {
  const [items, setItems] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<WithdrawalRow | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('withdrawals')
      .select('*')
      .order('requested_at', { ascending: false });
    const enriched = await Promise.all(
      (data || []).map(async (w: any) => {
        const { data: f } = await supabase
          .from('freelancers')
          .select('user_id')
          .eq('id', w.freelancer_id)
          .maybeSingle();
        let name = 'Unknown';
        let email = '';
        if (f?.user_id) {
          const { data: p } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', f.user_id)
            .maybeSingle();
          name = p?.full_name || p?.email || 'Unknown';
          email = p?.email || '';
        }
        return { ...w, user_name: name, user_email: email } as WithdrawalRow;
      })
    );
    setItems(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const update = async (id: string, status: 'completed' | 'rejected') => {
    const { error } = await supabase
      .from('withdrawals')
      .update({ status, processed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return toast.error('Failed');
    toast.success(`Withdrawal ${status === 'completed' ? 'paid' : status}`);
    setSelected(null);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
      </div>
    );
  }

  const pending = items.filter((i) => i.status === 'pending');
  const totalPending = pending.reduce((s, i) => s + Number(i.amount), 0);
  const paidItems = items.filter(
    (i) => i.status === 'completed' || (i.status as any) === 'paid' || i.status === 'approved'
  );
  const totalPaid = paidItems.reduce((s, i) => s + Number(i.amount), 0);
  const totalCommission = paidItems.reduce(
    (s, i) => s + Number(i.fee_amount ?? Number(i.amount) * 0.15),
    0
  );

  const isBank = (w: WithdrawalRow) => w.method === 'bank' || !!w.bank_name;
  const fullName = (w: WithdrawalRow) =>
    [w.receiver_first_name, w.receiver_middle_name, w.receiver_last_name]
      .filter(Boolean).join(' ').trim() || w.user_name || '—';

  const feeOf = (w: WithdrawalRow) =>
    Number(w.fee_amount ?? Number(w.amount) * ((w.fee_percent ?? 15) / 100));
  const netOf = (w: WithdrawalRow) =>
    Number(w.net_amount ?? Number(w.amount) - feeOf(w));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-yellow-500">{pending.length}</p>
            <p className="text-xs text-muted-foreground">Pending Requests</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-foreground">${totalPending.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Pending Amount</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-green-500">${totalPaid.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Paid Out (gross)</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-primary">${totalCommission.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Fivesom Commission (15%)</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Withdrawal Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Fee (15%)</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="text-sm">{w.user_name}</TableCell>
                  <TableCell className="font-bold">${Number(w.amount).toFixed(2)}</TableCell>
                  <TableCell className="text-primary">-${feeOf(w).toFixed(2)}</TableCell>
                  <TableCell className="font-semibold text-green-500">${netOf(w).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {isBank(w) ? <Building2 className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                      {isBank(w) ? 'Bank' : w.mobile_provider || 'Mobile'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{fullName(w)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={(w.status === 'completed' || (w.status as any) === 'paid' || w.status === 'approved') ? 'default' : w.status === 'rejected' ? 'destructive' : 'outline'}
                    >
                      {w.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(w.requested_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelected(w)}>
                      <Eye className="h-3.5 w-3.5 mr-1" /> Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No requests
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {isBank(selected) ? <Building2 className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                  Withdrawal Request
                </DialogTitle>
                <DialogDescription>
                  Submitted {new Date(selected.requested_at).toLocaleString()} ·{' '}
                  <Badge variant="outline" className="ml-1">{selected.status}</Badge>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Original amount (requested)
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      ${Number(selected.amount).toFixed(2)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/60">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Fivesom fee ({selected.fee_percent ?? 15}%)
                      </p>
                      <p className="text-lg font-semibold text-primary">
                        -${feeOf(selected).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Final payout to freelancer
                      </p>
                      <p className="text-lg font-bold text-green-500">
                        ${netOf(selected).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {selected.reason && (
                    <p className="text-xs text-muted-foreground pt-2 border-t border-border/60">
                      Reason: <span className="text-foreground font-medium">{selected.reason}</span>
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Freelancer (account holder)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Account" value={selected.user_name} />
                    <Field label="Email" value={selected.user_email} />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Receiver name</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="First Name" value={selected.receiver_first_name} />
                    <Field label="Middle Name" value={selected.receiver_middle_name} />
                    <Field label="Last Name" value={selected.receiver_last_name} />
                  </div>
                </div>

                {isBank(selected) ? (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Bank details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Bank Name" value={selected.bank_name} copyable />
                      <Field label="Account Number" value={selected.account_number} copyable />
                      <Field label="SWIFT / IBAN" value={selected.swift_code} copyable />
                      <Field label="Country" value={selected.country} copyable />
                      <Field label="City" value={selected.city} copyable />
                      <Field label="Mobile" value={selected.country_code ? `${selected.country_code} ${selected.mobile_number || ''}` : selected.mobile_number} copyable />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Mobile wallet details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Provider" value={selected.mobile_provider} copyable />
                      <Field
                        label="Mobile Number"
                        value={
                          selected.country_code
                            ? `${selected.country_code} ${selected.mobile_number || ''}`
                            : selected.mobile_number
                        }
                        copyable
                      />
                      <Field label="Country" value={selected.country} copyable />
                      <Field label="City" value={selected.city} copyable />
                    </div>
                  </div>
                )}

                {selected.status === 'pending' && (
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button className="flex-1" onClick={() => update(selected.id, 'completed')}>
                      <Check className="h-4 w-4 mr-1" /> Approve & Mark Paid
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => update(selected.id, 'rejected')}
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWithdrawals;
