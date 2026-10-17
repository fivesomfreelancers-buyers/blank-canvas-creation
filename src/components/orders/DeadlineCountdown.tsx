import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

export const formatDeadline = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export const formatRemaining = (ms: number) => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return d > 0 ? `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s` : `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
};

interface Props {
  deadline: string | null | undefined;
  overdueAt?: string | null;
  viewer: "buyer" | "freelancer" | "admin";
  className?: string;
}

/** Live per-second countdown to an order's delivery deadline. */
export function DeadlineCountdown({ deadline, overdueAt, viewer, className = "" }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [deadline]);

  if (!deadline) return null;

  const ms = new Date(deadline).getTime() - now;
  const isOverdue = ms <= 0 || !!overdueAt;

  if (isOverdue) {
    return (
      <div className={`flex items-center gap-2 text-sm font-semibold text-destructive ${className}`}>
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>
          {viewer === "buyer"
            ? "Overdue — Awaiting Delivery"
            : viewer === "freelancer"
              ? "Deadline missed — deliver as soon as possible"
              : "Overdue — requires review"}
        </span>
      </div>
    );
  }

  const urgent = ms < 60 * 60 * 1000;
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm ${className}`}>
      <Clock className={`h-4 w-4 shrink-0 ${urgent ? "text-destructive" : "text-primary"}`} />
      <span className="text-muted-foreground">Deadline: {formatDeadline(deadline)}</span>
      <span className={`font-mono font-semibold tabular-nums ${urgent ? "text-destructive" : "text-foreground"}`}>
        ⏳ {formatRemaining(ms)}
      </span>
    </div>
  );
}
