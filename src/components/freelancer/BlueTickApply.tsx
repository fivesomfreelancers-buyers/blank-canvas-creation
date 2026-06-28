import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock, Loader2, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import BlueTickBadge from '@/components/BlueTickBadge';

interface Props { userId: string; freelancerId: string; }

const REQ = { orders: 10, rating: 4.5, activeDays: 30, memberDays: 40, activeIn30: 15, earnings: 50, responseRate: 90, maxWarnings: 3 };

const BlueTickApply: React.FC<Props> = ({ userId, freelancerId }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    orders: 0, rating: 0, isVerified: false, lastSeen: null as string | null,
    hasBlueTick: false, memberDays: 0, warnings: 0, earnings: 0,
  });
  const [existing, setExisting] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [experience, setExperience] = useState('');
  const [links, setLinks] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ count }, { data: f }, { data: p }, { data: app }, { count: warnCount }, { data: completedOrders }] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('freelancer_id', freelancerId).eq('status', 'completed'),
      supabase.from('freelancers').select('rating, is_verified, has_blue_tick').eq('id', freelancerId).maybeSingle(),
      supabase.from('profiles').select('last_seen, created_at').eq('id', userId).maybeSingle(),
      (supabase as any).from('blue_tick_applications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      (supabase as any).from('user_reports').select('*', { count: 'exact', head: true }).eq('reported_user_id', userId).in('status', ['resolved', 'upheld', 'actioned']),
      supabase.from('orders').select('total_amount').eq('freelancer_id', freelancerId).eq('status', 'completed'),
    ]);
    const memberDays = (p as any)?.created_at
      ? Math.floor((Date.now() - new Date((p as any).created_at).getTime()) / 86400000) : 0;
    const earnings = (completedOrders || []).reduce((s: number, o: any) => s + (Number(o.total_amount) || 0), 0);
    setStats({
      orders: count || 0,
      rating: Number(f?.rating) || 0,
      isVerified: !!f?.is_verified,
      lastSeen: p?.last_seen || null,
      hasBlueTick: !!(f as any)?.has_blue_tick,
      memberDays,
      warnings: warnCount || 0,
      earnings,
    });
    setExisting(app);
    setLoading(false);
  };

  useEffect(() => { load(); }, [userId, freelancerId]);

  const daysSinceActive = stats.lastSeen ? Math.floor((Date.now() - new Date(stats.lastSeen).getTime()) / 86400000) : 999;
  const eligible =
    stats.orders >= REQ.orders &&
    stats.rating >= REQ.rating &&
    stats.isVerified &&
    daysSinceActive <= REQ.activeDays &&
    stats.memberDays >= REQ.memberDays &&
    stats.warnings <= REQ.maxWarnings &&
    stats.earnings >= REQ.earnings;

  const submit = async () => {
    if (!reason.trim() || reason.trim().length < 30) return toast.error('Reason must be at least 30 characters');
    setSubmitting(true);
    const cleanLinks = links.map(l => l.trim()).filter(Boolean);
    const { error } = await (supabase as any).from('blue_tick_applications').insert({
      user_id: userId, freelancer_id: freelancerId,
      reason: reason.trim(), experience: experience.trim() || null,
      portfolio_links: cleanLinks, status: 'pending',
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success('Application submitted — admin will review shortly');
    load();
  };

  if (loading) return <Card><CardContent className="py-6 text-sm text-muted-foreground">Loading…</CardContent></Card>;

  if (stats.hasBlueTick) {
    return (
      <Card className="border-[#1d9bf0]/40 bg-[#1d9bf0]/5">
        <CardContent className="py-8 flex flex-col items-center gap-3 text-center">
          <BlueTickBadge size="lg" />
          <h3 className="text-xl font-bold text-[#1d9bf0]">You have the Blue Tick</h3>
          <p className="text-sm text-muted-foreground max-w-md">Your account is recognised as a trusted, top-tier Fivesom freelancer.</p>
        </CardContent>
      </Card>
    );
  }

  const Item = ({ ok, label }: { ok: boolean; label: string }) => (
    <li className={`flex items-center gap-2 text-sm ${ok ? 'text-emerald-600' : 'text-muted-foreground'}`}>
      {ok ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />} {label}
    </li>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BlueTickBadge size="lg" /> Blue Tick Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Eligibility</p>
          <ul className="space-y-1.5">
            <Item ok={stats.orders >= REQ.orders} label={`${stats.orders}/${REQ.orders} completed orders`} />
            <Item ok={stats.isVerified} label="Account is verified" />
            <Item ok={daysSinceActive <= REQ.activeDays} label={`Active in last ${REQ.activeDays} days`} />
            <Item ok={stats.rating >= REQ.rating} label={`Average rating ${stats.rating.toFixed(1)} / ${REQ.rating}`} />
          </ul>
        </div>

        {existing && existing.status === 'pending' && (
          <Badge variant="outline" className="border-yellow-500/40 text-yellow-600">
            Application pending review
          </Badge>
        )}
        {existing && existing.status === 'rejected' && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm">
            <p className="font-semibold text-red-600">Previous application rejected</p>
            {existing.admin_notes && <p className="text-muted-foreground mt-1">{existing.admin_notes}</p>}
            <p className="text-xs text-muted-foreground mt-1">You can re-apply below.</p>
          </div>
        )}

        {!eligible && (!existing || existing.status !== 'pending') && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            Meet all requirements above to unlock the application form.
          </div>
        )}

        {eligible && (!existing || existing.status === 'rejected') && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Why do you deserve verification? *</Label>
              <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="A short, professional message about your work and contribution to Fivesom" />
            </div>
            <div className="space-y-2">
              <Label>Experience</Label>
              <Textarea rows={3} value={experience} onChange={(e) => setExperience(e.target.value)}
                placeholder="Years of experience, key projects, expertise" />
            </div>
            <div className="space-y-2">
              <Label>Portfolio links (optional)</Label>
              {links.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={l} onChange={(e) => setLinks(p => p.map((x, idx) => idx === i ? e.target.value : x))} placeholder="https://…" />
                  {links.length > 1 && (
                    <Button type="button" size="icon" variant="outline" onClick={() => setLinks(p => p.filter((_, idx) => idx !== i))}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={() => setLinks(p => [...p, ''])}>
                <Plus className="w-4 h-4 mr-1" /> Add link
              </Button>
            </div>
            <Button onClick={submit} disabled={submitting} className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Apply for Blue Verification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlueTickApply;
