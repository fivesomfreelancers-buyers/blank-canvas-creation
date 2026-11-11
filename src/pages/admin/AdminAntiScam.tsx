import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAdminProfiles, displayName } from '@/lib/adminUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import SuspiciousText from '@/components/security/SuspiciousText';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type Incident = { id: string; user_id: string; context: string; ref_id: string | null; content: string; findings: { type: string; match: string; reason: string }[]; risk: string; action: string; status: string; review_note: string | null; created_at: string };

const DECISIONS: { key: string; label: string; variant?: 'destructive' | 'outline' | 'secondary' }[] = [
  { key: 'approve', label: 'Approve (legitimate)', variant: 'outline' },
  { key: 'dismiss', label: 'Dismiss', variant: 'outline' },
  { key: 'warn', label: 'Warn user', variant: 'secondary' },
  { key: 'restrict_messaging', label: 'Restrict messaging 7d', variant: 'secondary' },
  { key: 'restrict_job_posting', label: 'Restrict job posting 7d', variant: 'secondary' },
  { key: 'suspend', label: 'Suspend 30d', variant: 'destructive' },
];

export default function AdminAntiScam() {
  const [rows, setRows] = useState<Incident[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let q = (supabase as any).from('security_incidents').select('*').order('created_at', { ascending: false }).limit(300);
    if (filter === 'open') q = q.eq('status', 'open');
    const { data, error } = await q;
    if (error) toast.error(error.message);
    const list = (data || []) as Incident[];
    setRows(list);
    const ids = [...new Set(list.map((r) => r.user_id))];
    if (ids.length) {
      const p = await fetchAdminProfiles(ids);
      setProfiles(Object.fromEntries(p.entries()));
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const counts = useMemo(() => rows.reduce<Record<string, number>>((a, r) => ({ ...a, [r.user_id]: (a[r.user_id] || 0) + 1 }), {}), [rows]);

  const decide = async (id: string, decision: string) => {
    if (decision === 'suspend' && !confirm('Suspend this account for 30 days?')) return;
    const { error } = await (supabase as any).rpc('admin_review_security_incident', { _id: id, _decision: decision, _note: notes[id] || null, _days: decision === 'suspend' ? 30 : 7 });
    if (error) return toast.error(error.message);
    toast.success('Decision saved and logged.');
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><ShieldAlert className="h-5 w-5 text-destructive" /> Security &amp; Anti-Scam Monitoring</h2>
        <div className="flex gap-2">
          <Button size="sm" variant={filter === 'open' ? 'default' : 'outline'} onClick={() => setFilter('open')}>Open</Button>
          <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
          <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : rows.length === 0 ? <p className="text-sm text-muted-foreground">No incidents.</p> : rows.map((r) => {
        const p = profiles[r.user_id];
        return (
          <Card key={r.id} className={r.risk === 'high' ? 'border-destructive/50' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="flex flex-wrap items-center gap-2 text-sm">
                <span>{displayName(p, r.user_id.slice(0, 8))}</span>
                {p?.role && <Badge variant="outline" className="capitalize">{p.role}</Badge>}
                <Badge variant={r.risk === 'high' ? 'destructive' : 'secondary'}>{r.risk} risk</Badge>
                <Badge variant="outline">{r.context.replace('_', ' ')}</Badge>
                <Badge variant="outline">{r.action}</Badge>
                <Badge variant="outline">{r.status}</Badge>
                {counts[r.user_id] > 1 && <Badge variant="destructive">{counts[r.user_id]} incidents</Badge>}
              </CardTitle>
              <p className="text-xs text-muted-foreground break-all">User ID: {r.user_id}{p?.email ? ` · ${p.email}` : ''} · {new Date(r.created_at).toLocaleString()}{r.ref_id ? ` · Ref: ${r.ref_id}` : ''}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="whitespace-pre-wrap break-words rounded-md bg-muted/50 p-3 text-sm"><SuspiciousText text={r.content} /></p>
              <ul className="space-y-1 text-xs">
                {r.findings.map((f, i) => <li key={i}><span className="font-semibold text-destructive">{f.match}</span> — {f.reason}</li>)}
              </ul>
              {r.status === 'open' ? (
                <>
                  <Textarea placeholder="Note (optional, saved in the log)" value={notes[r.id] || ''} onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })} />
                  <div className="flex flex-wrap gap-2">
                    {DECISIONS.map((d) => <Button key={d.key} size="sm" variant={d.variant} onClick={() => decide(r.id, d.key)}>{d.label}</Button>)}
                  </div>
                </>
              ) : r.review_note && <p className="text-xs text-muted-foreground">Note: {r.review_note}</p>}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
