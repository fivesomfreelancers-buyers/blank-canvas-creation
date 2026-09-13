import React from 'react';
import { CheckCircle2, Circle, Loader2, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlueTickBadge from '@/components/BlueTickBadge';
import { BLUE_TICK_TARGETS, useBlueTickEligibility } from '@/hooks/useBlueTickEligibility';
import { cn } from '@/lib/utils';

interface Props {
  userId?: string | null;
  onOpen: () => void;
  compact?: boolean;
}

const Row = ({ ok, label, value, progress }: { ok: boolean; label: string; value: string; progress?: number }) => (
  <li className="space-y-1">
    <div className="flex items-center gap-2 text-xs">
      {ok ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
      <span className={cn('flex-1 truncate', ok ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
      <span className={cn('font-medium tabular-nums', ok ? 'text-emerald-500' : 'text-muted-foreground')}>{value}</span>
    </div>
    {progress !== undefined && (
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', ok ? 'bg-emerald-500' : 'bg-[#1d9bf0]')}
          style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
        />
      </div>
    )}
  </li>
);

/** Compact, realtime Blue Tick eligibility card for the freelancer dashboard sidebar. */
const BlueTickCard: React.FC<Props> = ({ userId, onOpen, compact = true }) => {
  const { eligibility: e, application, loading } = useBlueTickEligibility(userId);

  if (loading || !e) {
    return (
      <div className="m-2 rounded-xl border border-border bg-card/60 p-3 text-xs text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading Blue Tick status…
      </div>
    );
  }

  if (e.has_blue_tick) {
    return (
      <button onClick={onOpen} className="m-2 w-[calc(100%-1rem)] rounded-xl border border-[#1d9bf0]/40 bg-[#1d9bf0]/10 p-3 text-left">
        <div className="flex items-center gap-2">
          <BlueTickBadge size="md" />
          <span className="text-sm font-semibold text-[#1d9bf0]">Blue Tick Verified</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Your badge is live across FIVESOM.</p>
      </button>
    );
  }

  const pending = application?.status === 'pending';
  const needsInfo = application?.status === 'more_info_requested';
  const remaining = e.requirements_total - e.requirements_complete;

  const nextStep = !e.identity_verified
    ? 'Complete identity verification first'
    : e.completed_orders < BLUE_TICK_TARGETS.completedOrders
      ? `${BLUE_TICK_TARGETS.completedOrders - e.completed_orders} more completed orders`
      : e.earnings < BLUE_TICK_TARGETS.earnings
        ? `$${(BLUE_TICK_TARGETS.earnings - e.earnings).toFixed(2)} more earnings`
        : e.member_days < BLUE_TICK_TARGETS.memberDays
          ? `${BLUE_TICK_TARGETS.memberDays - e.member_days} more days as a member`
          : e.rating < BLUE_TICK_TARGETS.rating
            ? `Raise your rating to ${BLUE_TICK_TARGETS.rating}`
            : !e.recent_activity
              ? 'Stay active on FIVESOM'
              : e.active_warnings > BLUE_TICK_TARGETS.maxWarnings
                ? 'Resolve your active warnings'
                : 'You are ready to apply';

  return (
    <div className={cn('m-2 rounded-xl border border-border bg-card/70 p-3 space-y-3', compact ? '' : 'p-4')}>
      <div className="flex items-center gap-2">
        <BlueTickBadge size="md" />
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">Blue Tick Eligibility</p>
          <p className="text-[11px] text-muted-foreground leading-tight">Complete all requirements to apply.</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-muted-foreground">Overall progress</span>
          <span className="font-semibold text-[#1d9bf0]">{e.requirements_complete} / {e.requirements_total}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-[#1d9bf0] transition-all duration-500" style={{ width: `${(e.requirements_complete / e.requirements_total) * 100}%` }} />
        </div>
      </div>

      <ul className="space-y-2">
        <Row ok={e.identity_verified} label="Identity verified" value={e.identity_verified ? 'Verified' : 'Not verified'} />
        <Row ok={e.member_days >= BLUE_TICK_TARGETS.memberDays} label="Account age" value={`${e.member_days} / ${BLUE_TICK_TARGETS.memberDays}d`} progress={e.member_days / BLUE_TICK_TARGETS.memberDays} />
        <Row ok={e.recent_activity} label="Active last 30 days" value={e.recent_activity ? 'Active' : 'Inactive'} />
        <Row ok={e.completed_orders >= BLUE_TICK_TARGETS.completedOrders} label="Completed orders" value={`${e.completed_orders} / ${BLUE_TICK_TARGETS.completedOrders}`} progress={e.completed_orders / BLUE_TICK_TARGETS.completedOrders} />
        <Row ok={e.earnings >= BLUE_TICK_TARGETS.earnings} label="Earnings" value={`$${e.earnings.toFixed(0)} / $${BLUE_TICK_TARGETS.earnings}`} progress={e.earnings / BLUE_TICK_TARGETS.earnings} />
        <Row ok={e.rating >= BLUE_TICK_TARGETS.rating} label="Rating" value={`${e.rating.toFixed(1)} / ${BLUE_TICK_TARGETS.rating}`} progress={e.rating / BLUE_TICK_TARGETS.rating} />
        <Row ok={e.active_warnings <= BLUE_TICK_TARGETS.maxWarnings} label="Warnings" value={`${e.active_warnings} / ${BLUE_TICK_TARGETS.maxWarnings}`} />
      </ul>

      {pending ? (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2 text-[11px] text-yellow-600">
          Application pending review by the FIVESOM team.
        </div>
      ) : needsInfo ? (
        <div className="rounded-lg border border-[#1d9bf0]/30 bg-[#1d9bf0]/10 p-2 text-[11px] text-[#1d9bf0]">
          More information requested — open your application.
        </div>
      ) : e.eligible ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-[11px] text-emerald-600 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> 7 / 7 complete — you can apply now.
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-muted/40 p-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-medium text-foreground"><ShieldAlert className="w-3 h-3" /> {remaining} left</span>
          <br />Next step: {nextStep}
        </div>
      )}

      <Button
        size="sm"
        onClick={onOpen}
        className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white text-xs h-8"
      >
        {pending ? 'View application' : !e.identity_verified ? 'Complete identity verification' : e.eligible ? 'Apply for Blue Tick' : 'View progress'}
      </Button>
    </div>
  );
};

export default BlueTickCard;
