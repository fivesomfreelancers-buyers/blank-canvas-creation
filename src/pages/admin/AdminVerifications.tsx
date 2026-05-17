import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Eye, ShieldCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface VDoc {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: string;
  submitted_at: string;
  note: string | null;
  personal_info: any;
  professional_info: any;
  profile?: { full_name: string; email: string; profile_image_url: string | null; location: string | null };
  freelancer?: { id: string; bio: string | null; skills: string[]; professional_title: string | null; years_experience: string | null; education_level: string | null; software_tools: any; rating: number };
  portfolio?: { media_url: string; media_type: string }[];
}

const AdminVerifications = () => {
  const [docs, setDocs] = useState<VDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<VDoc | null>(null);

  const fetchDocs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('verification_documents')
      .select('*')
      .order('submitted_at', { ascending: false });

    const enriched = await Promise.all((data || []).map(async (d: any) => {
      const [profileRes, freelancerRes] = await Promise.all([
        supabase.from('profiles').select('full_name, email, profile_image_url, location').eq('id', d.user_id).maybeSingle(),
        supabase.from('freelancers').select('id, bio, skills, professional_title, years_experience, education_level, software_tools, rating').eq('user_id', d.user_id).maybeSingle(),
      ]);
      let portfolio: any[] = [];
      if (freelancerRes.data?.id) {
        const { data: p } = await supabase.from('freelancer_portfolio').select('media_url, media_type').eq('freelancer_id', freelancerRes.data.id);
        portfolio = p || [];
      }
      return { ...d, profile: profileRes.data, freelancer: freelancerRes.data, portfolio };
    }));
    setDocs(enriched as VDoc[]);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, []);

  const updateStatus = async (doc: VDoc, status: 'approved' | 'rejected' | 'pending', note?: string) => {
    const { error } = await supabase.from('verification_documents').update({ status, note: note ?? doc.note }).eq('id', doc.id);
    if (error) { toast.error('Failed'); return; }
    if (status === 'approved' && doc.freelancer?.id) {
      await supabase.from('freelancers').update({ is_verified: true, verified_at: new Date().toISOString() }).eq('id', doc.freelancer.id);
    }
    if (status === 'rejected' && doc.freelancer?.id) {
      await supabase.from('freelancers').update({ is_verified: false, verified_at: null }).eq('id', doc.freelancer.id);
    }
    toast.success(`Verification ${status}`);
    setOpen(null);
    fetchDocs();
  };

  const DAY_MS = 24 * 60 * 60 * 1000;
  const filterStatus = (s: string) => docs.filter(d => {
    if (d.status !== s) return false;
    // Hide approved verifications after 24 hours so the admin list stays clean
    if (s === 'approved') {
      const ts = new Date(d.submitted_at).getTime();
      if (!isNaN(ts) && Date.now() - ts > DAY_MS) return false;
    }
    return true;
  });
  const renderList = (items: VDoc[]) => (
    <div className="grid gap-3 mt-4">
      {items.length === 0 && <p className="text-center text-muted-foreground py-8">No requests</p>}
      {items.map(d => (
        <Card key={d.id} className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-primary font-bold">
              {d.profile?.profile_image_url ? <img src={d.profile.profile_image_url} alt="" className="h-full w-full object-cover" /> : (d.profile?.full_name?.[0] || '?').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{d.profile?.full_name || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground truncate">{d.freelancer?.professional_title || d.profile?.email}</p>
              <p className="text-[11px] text-muted-foreground">{new Date(d.submitted_at).toLocaleString()}</p>
            </div>
            <Badge variant="outline" className={
              d.status === 'approved' ? 'text-green-500 border-green-500/30 bg-green-500/10' :
              d.status === 'rejected' ? 'text-destructive border-destructive/30 bg-destructive/10' :
              'text-yellow-500 border-yellow-500/30 bg-yellow-500/10'
            }>{d.status}</Badge>
            <Button size="sm" variant="outline" onClick={() => setOpen(d)}><Eye className="h-3.5 w-3.5 mr-1" /> Review</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: filterStatus('pending').length, icon: Clock, c: 'yellow' },
          { label: 'Approved', value: filterStatus('approved').length, icon: CheckCircle, c: 'green' },
          { label: 'Rejected', value: filterStatus('rejected').length, icon: XCircle, c: 'red' },
        ].map(s => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="pt-6 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-${s.c}-500/10`}><s.icon className={`h-5 w-5 text-${s.c}-500`} /></div>
              <div><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Verification Requests</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList><TabsTrigger value="pending">Pending</TabsTrigger><TabsTrigger value="approved">Approved</TabsTrigger><TabsTrigger value="rejected">Rejected</TabsTrigger></TabsList>
            <TabsContent value="pending">{renderList(filterStatus('pending'))}</TabsContent>
            <TabsContent value="approved">{renderList(filterStatus('approved'))}</TabsContent>
            <TabsContent value="rejected">{renderList(filterStatus('rejected'))}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>Verification: {open.profile?.full_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Email:</span> {open.profile?.email}</div>
                  <div><span className="text-muted-foreground">Location:</span> {open.profile?.location || '—'}</div>
                  <div><span className="text-muted-foreground">Title:</span> {open.freelancer?.professional_title || '—'}</div>
                  <div><span className="text-muted-foreground">Experience:</span> {open.freelancer?.years_experience || '—'}</div>
                  <div><span className="text-muted-foreground">Education:</span> {open.freelancer?.education_level || '—'}</div>
                  <div><span className="text-muted-foreground">Rating:</span> ⭐ {Number(open.freelancer?.rating || 0).toFixed(1)}</div>
                </div>
                {open.freelancer?.skills && open.freelancer.skills.length > 0 && (
                  <div><p className="text-xs font-semibold text-muted-foreground mb-1">SKILLS</p><div className="flex flex-wrap gap-1">{open.freelancer.skills.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}</div></div>
                )}
                {Array.isArray(open.freelancer?.software_tools) && open.freelancer!.software_tools.length > 0 && (
                  <div><p className="text-xs font-semibold text-muted-foreground mb-1">SOFTWARE</p><div className="flex flex-wrap gap-1">{(open.freelancer!.software_tools as any[]).map((s, i) => <Badge key={i} variant="outline">{String(s)}</Badge>)}</div></div>
                )}
                {open.freelancer?.bio && <div><p className="text-xs font-semibold text-muted-foreground mb-1">BIO</p><p className="text-sm text-foreground">{open.freelancer.bio}</p></div>}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">ID DOCUMENT</p>
                  {open.document_url && (
                    open.document_url.match(/\.(mp4|webm|mov)$/i)
                      ? <video src={open.document_url} controls className="w-full rounded-lg max-h-64" />
                      : <img src={open.document_url} alt="document" className="w-full rounded-lg max-h-64 object-contain bg-muted" />
                  )}
                </div>
                {open.portfolio && open.portfolio.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">PORTFOLIO ({open.portfolio.length})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {open.portfolio.map((p, i) => (
                        p.media_type === 'video'
                          ? <video key={i} src={p.media_url} controls className="rounded-lg w-full h-24 object-cover" />
                          : <img key={i} src={p.media_url} alt="" className="rounded-lg w-full h-24 object-cover" />
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => updateStatus(open, 'approved')} className="flex-1"><CheckCircle className="h-4 w-4 mr-1" /> Approve & Verify</Button>
                  <Button onClick={() => updateStatus(open, 'rejected', 'Documents insufficient')} variant="destructive" className="flex-1"><XCircle className="h-4 w-4 mr-1" /> Reject</Button>
                  <Button onClick={() => updateStatus(open, 'pending', 'Please resubmit clearer documents')} variant="outline" className="flex-1">Request Changes</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVerifications;
