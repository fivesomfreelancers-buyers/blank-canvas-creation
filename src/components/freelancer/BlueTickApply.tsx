import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Loader2, ScanFace, Send, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import BlueTickBadge from '@/components/BlueTickBadge';
import { BLUE_TICK_TARGETS, useBlueTickEligibility } from '@/hooks/useBlueTickEligibility';
import { cn } from '@/lib/utils';

interface Props { userId: string; freelancerId: string; }

const SPECIALTY_OPTIONS = [
  'Graphic Design', 'Web Development', 'Mobile Apps', 'Video Editing', 'Content Writing',
  'Digital Marketing', 'Translation', 'Voice Over', 'Photography', 'Data & Analytics',
];

const Item = ({ ok, label, value }: { ok: boolean; label: string; value: string }) => (
  <li className="flex items-center gap-2 text-sm">
    {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Circle className="w-4 h-4 text-muted-foreground shrink-0" />}
    <span className={cn('flex-1', ok ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
    <span className={cn('font-medium tabular-nums', ok ? 'text-emerald-500' : 'text-muted-foreground')}>{value}</span>
  </li>
);

const BlueTickApply: React.FC<Props> = ({ userId }) => {
  const { eligibility: e, application, loading, refresh } = useBlueTickEligibility(userId);

  const [experience, setExperience] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [social, setSocial] = useState({ website: '', linkedin: '', instagram: '', behance: '' });
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [liveness, setLiveness] = useState(false);

  useEffect(() => {
    if (!application) return;
    setExperience(application.experience || '');
    setProjectSummary(application.project_summary || '');
    setSpecialties(application.specialties || []);
    const s = (application.social_links || {}) as Record<string, string>;
    setSocial({ website: s.website || '', linkedin: s.linkedin || '', instagram: s.instagram || '', behance: s.behance || '' });
  }, [application?.id]);

  const toggleSpecialty = (name: string) =>
    setSpecialties((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));

  const saveDraft = async () => {
    setSaving(true);
    const { error } = await (supabase as any).rpc('save_blue_tick_application_draft', {
      _experience: experience.trim() || null,
      _specialties: specialties,
      _project_summary: projectSummary.trim() || null,
      _social_links: Object.fromEntries(Object.entries(social).filter(([, v]) => v.trim())),
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('Draft saved');
    refresh();
  };

  const submit = async () => {
    if (projectSummary.trim().length < 30) return toast.error('Project summary must be at least 30 characters');
    if (specialties.length === 0) return toast.error('Select at least one specialty');
    setSubmitting(true);
    const { data: appId, error: draftError } = await (supabase as any).rpc('save_blue_tick_application_draft', {
      _experience: experience.trim() || null,
      _specialties: specialties,
      _project_summary: projectSummary.trim(),
      _social_links: Object.fromEntries(Object.entries(social).filter(([, v]) => v.trim())),
    });
    if (draftError) { setSubmitting(false); return toast.error(draftError.message); }
    const { error } = await (supabase as any).rpc('submit_blue_tick_application', { _application_id: appId });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success('Application submitted — the FIVESOM team will review it shortly');
    refresh();
  };

  const startLiveness = async () => {
    setLiveness(true);
    const { data, error } = await supabase.functions.invoke('persona-create-inquiry', { body: {} });
    setLiveness(false);
    if (error) return toast.error('Face verification is not available right now. Please try again later.');
    const url = (data as any)?.url;
    if (!url) return toast.error('Face verification is not available right now.');
    window.open(url, '_blank', 'noopener,noreferrer');
    refresh();
  };

  if (loading || !e) {
    return <Card><CardContent className="py-8 text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</CardContent></Card>;
  }

  if (e.has_blue_tick) {
    return (
      <Card className="border-[#1d9bf0]/40 bg-[#1d9bf0]/5">
        <CardContent className="py-8 flex flex-col items-center gap-3 text-center">
          <BlueTickBadge size="lg" />
          <h3 className="text-xl font-bold text-[#1d9bf0]">You have the Blue Tick</h3>
          <p className="text-sm text-muted-foreground max-w-md">Your badge is live across FIVESOM — on your profile, your gigs and in search results.</p>
        </CardContent>
      </Card>
    );
  }

  const pending = application?.status === 'pending';
  const needsInfo = application?.status === 'more_info_requested';
  const rejected = application?.status === 'rejected';
  const canApply = e.eligible && !pending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BlueTickBadge size="lg" /> Blue Tick Verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-medium text-foreground"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified Seller</span> confirms your identity documents.
          The <span className="font-medium text-[#1d9bf0]">Blue Tick</span> is the higher, invite-reviewed trust badge granted by the FIVESOM team.
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Eligibility</p>
            <span className="text-xs font-semibold text-[#1d9bf0]">{e.requirements_complete} / {e.requirements_total} complete</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
            <div className="h-full rounded-full bg-[#1d9bf0] transition-all duration-500" style={{ width: `${(e.requirements_complete / e.requirements_total) * 100}%` }} />
          </div>
          <ul className="space-y-2">
            <Item ok={e.identity_verified} label="Verified seller (identity confirmed)" value={e.identity_verified ? 'Verified' : 'Not verified'} />
            <Item ok={e.member_days >= BLUE_TICK_TARGETS.memberDays} label="Account age" value={`${e.member_days} / ${BLUE_TICK_TARGETS.memberDays} days`} />
            <Item ok={e.recent_activity} label="Active in the last 30 days" value={e.recent_activity ? 'Active' : 'Inactive'} />
            <Item ok={e.completed_orders >= BLUE_TICK_TARGETS.completedOrders} label="Completed orders" value={`${e.completed_orders} / ${BLUE_TICK_TARGETS.completedOrders}`} />
            <Item ok={e.earnings >= BLUE_TICK_TARGETS.earnings} label="Total earned" value={`$${e.earnings.toFixed(2)} / $${BLUE_TICK_TARGETS.earnings}`} />
            <Item ok={e.rating >= BLUE_TICK_TARGETS.rating} label={`Rating (${e.review_count} reviews)`} value={`${e.rating.toFixed(1)} / ${BLUE_TICK_TARGETS.rating}`} />
            <Item ok={e.active_warnings <= BLUE_TICK_TARGETS.maxWarnings} label="Active warnings" value={`${e.active_warnings} / ${BLUE_TICK_TARGETS.maxWarnings} max`} />
          </ul>
        </div>

        {pending && (
          <Badge variant="outline" className="border-yellow-500/40 text-yellow-600">Application pending review</Badge>
        )}
        {needsInfo && (
          <div className="rounded-lg border border-[#1d9bf0]/30 bg-[#1d9bf0]/5 p-3 text-sm">
            <p className="font-semibold text-[#1d9bf0]">More information requested</p>
            {application?.more_info_request && <p className="text-muted-foreground mt-1">{application.more_info_request}</p>}
          </div>
        )}
        {rejected && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm">
            <p className="font-semibold text-red-600">Previous application rejected</p>
            {(application?.rejection_reason || application?.admin_notes) && (
              <p className="text-muted-foreground mt-1">{application?.rejection_reason || application?.admin_notes}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">You can update your details and re-apply below.</p>
          </div>
        )}

        {!e.eligible && !pending && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            {e.requirements_total - e.requirements_complete} requirement(s) left. You can prepare your application now — submitting unlocks at {e.requirements_total} / {e.requirements_total}.
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Your specialties *</Label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTY_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  disabled={pending}
                  className={cn(
                    'px-3 py-1.5 rounded-full border text-xs transition-colors',
                    specialties.includes(s) ? 'border-[#1d9bf0] bg-[#1d9bf0]/10 text-[#1d9bf0]' : 'border-border text-muted-foreground hover:bg-accent',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Best projects / why you deserve the Blue Tick *</Label>
            <Textarea rows={4} disabled={pending} value={projectSummary} onChange={(ev) => setProjectSummary(ev.target.value)}
              placeholder="Describe your strongest work on FIVESOM and the results you delivered (min. 30 characters)" />
          </div>

          <div className="space-y-2">
            <Label>Experience</Label>
            <Textarea rows={3} disabled={pending} value={experience} onChange={(ev) => setExperience(ev.target.value)}
              placeholder="Years of experience, key clients, expertise" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {(['website', 'linkedin', 'instagram', 'behance'] as const).map((k) => (
              <div key={k} className="space-y-1.5">
                <Label className="capitalize">{k}</Label>
                <Input disabled={pending} value={social[k]} onChange={(ev) => setSocial((p) => ({ ...p, [k]: ev.target.value }))} placeholder="https://…" />
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border p-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium flex items-center gap-2"><ScanFace className="w-4 h-4 text-[#1d9bf0]" /> Face (liveness) check</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {application?.liveness_status === 'verified' ? 'Completed — thank you.'
                  : application?.liveness_status === 'failed' ? 'Last attempt failed. You can try again.'
                  : 'Opens a secure check in a new tab. Works on phone and desktop.'}
              </p>
            </div>
            {application?.liveness_status === 'verified' ? (
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-600">Verified</Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={startLiveness} disabled={liveness}>
                {liveness ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ScanFace className="w-4 h-4 mr-2" />} Start check
              </Button>
            )}
          </div>

          {!pending && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="flex-1" onClick={saveDraft} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save draft
              </Button>
              <Button className="flex-1 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white" onClick={submit} disabled={!canApply || submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                {canApply ? 'Submit application' : `Locked — ${e.requirements_total - e.requirements_complete} left`}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BlueTickApply;
