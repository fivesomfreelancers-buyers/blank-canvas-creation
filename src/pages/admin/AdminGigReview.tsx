import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  CheckCircle2, RotateCcw, Trash2, Eye, Loader2, Clock, History, RefreshCw,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { gigPath } from '@/lib/urls';
import { deleteGigCompletely, DELETE_GIG_CONFIRM } from '@/lib/deleteGig';
import {
  asReviewStatus, formatReviewCountdown, isReviewOverdue,
  GIG_REVIEW_ISSUES, REVIEW_STATUS_CLASS, REVIEW_STATUS_LABEL, type GigReviewStatus,
} from '@/lib/gigReview';

type GigRow = {
  id: string;
  title: string;
  slug?: string | null;
  status: string;
  base_price: number | null;
  review_status: string | null;
  review_deadline: string | null;
  review_feedback: string | null;
  review_issues: string[] | null;
  reviewed_at: string | null;
  created_at: string;
  freelancer_id: string;
};

type TabKey = 'pending' | 'changes' | 'reviewed';

const TABS: { key: TabKey; label: string; match: (g: GigRow) => boolean }[] = [
  { key: 'pending', label: 'Pending Review', match: (g) => asReviewStatus(g.review_status) === 'pending_review' },
  { key: 'changes', label: 'Changes Required', match: (g) => asReviewStatus(g.review_status) === 'changes_required' },
  { key: 'reviewed', label: 'Reviewed', match: (g) => ['approved', 'published'].includes(asReviewStatus(g.review_status)) },
];

const AdminGigReview = () => {
  const [gigs, setGigs] = useState<GigRow[]>([]);
  const [history, setHistory] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('pending');
  const [now, setNow] = useState(Date.now());
  const [busyId, setBusyId] = useState<string | null>(null);

  const [returnTarget, setReturnTarget] = useState<GigRow | null>(null);
  const [checkedIssues, setCheckedIssues] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<GigRow | null>(null);
  const [historyTarget, setHistoryTarget] = useState<GigRow | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchGigs = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('gigs')
      .select('id, title, slug, status, base_price, review_status, review_deadline, review_feedback, review_issues, reviewed_at, created_at, freelancer_id')
      .order('review_deadline', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Could not load gigs', description: error.message, variant: 'destructive' });
    } else {
      setGigs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGigs();
    const channel = supabase
      .channel('admin-gig-review')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'gigs' }, () => fetchGigs())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const openHistory = async (gig: GigRow) => {
    setHistoryTarget(gig);
    if (history[gig.id]) return;
    const { data } = await (supabase as any)
      .from('gig_review_history')
      .select('*')
      .eq('gig_id', gig.id)
      .order('created_at', { ascending: false });
    setHistory((prev) => ({ ...prev, [gig.id]: data || [] }));
  };

  const confirmPersisted = async (gigId: string, decision: 'approve' | 'changes') => {
    const { data, error } = await (supabase as any)
      .from('gigs')
      .select('review_status, status, reviewed_at, reviewed_by')
      .eq('id', gigId)
      .single();
    if (error || !data) throw new Error('The review result could not be confirmed. Refresh the list before trying again.');
    const ok = decision === 'approve'
      ? data.review_status === 'published' && data.status === 'active' && data.reviewed_by
      : data.review_status === 'changes_required' && data.status === 'draft' && data.reviewed_by;
    if (!ok) throw new Error('The review result could not be confirmed. Refresh the list before trying again.');
  };

  const handleApprove = async (gig: GigRow) => {
    setBusyId(gig.id);
    try {
      const { error } = await (supabase as any).rpc('admin_review_gig', {
        _gig_id: gig.id, _decision: 'approve', _issues: [], _feedback: null,
      });
      if (error) throw error;
      await confirmPersisted(gig.id, 'approve');
      toast({ title: 'Gig approved & published', description: `"${gig.title}" is now live for buyers.` });
      fetchGigs();
    } catch (e: any) {
      toast({ title: 'Approval failed', description: e?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const handleReturn = async () => {
    if (!returnTarget) return;
    if (feedback.trim().length < 10) {
      toast({ title: 'Feedback required', description: 'Write at least a short note so the freelancer knows what to fix.', variant: 'destructive' });
      return;
    }
    setBusyId(returnTarget.id);
    try {
      const { error } = await (supabase as any).rpc('admin_review_gig', {
        _gig_id: returnTarget.id, _decision: 'changes', _issues: checkedIssues, _feedback: feedback.trim(),
      });
      if (error) throw error;
      await confirmPersisted(returnTarget.id, 'changes');
      toast({ title: 'Returned for correction', description: 'The freelancer can now see the issues and resubmit.' });
      setReturnTarget(null);
      setCheckedIssues([]);
      setFeedback('');
      fetchGigs();
    } catch (e: any) {
      toast({ title: 'Could not return the gig', description: e?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await deleteGigCompletely(deleteTarget.id);
      toast({ title: 'Gig deleted', description: 'The gig and its files were permanently removed.' });
      setDeleteTarget(null);
      fetchGigs();
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const visible = useMemo(() => gigs.filter(TABS.find((t) => t.key === tab)!.match), [gigs, tab]);
  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.key, gigs.filter(t.match).length])), [gigs]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Gigs Pending</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review new submissions within 5 hours. Approve, return for correction, or remove a gig.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchGigs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab(t.key)}
            className="flex items-center gap-2"
          >
            {t.label}
            <Badge variant="secondary" className="text-xs">{counts[t.key] || 0}</Badge>
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading gigs…</div>
      ) : visible.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No gigs in this list right now.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {visible.map((gig) => {
            const rs = asReviewStatus(gig.review_status);
            const busy = busyId === gig.id;
            const overdue = rs === 'pending_review' && isReviewOverdue(gig.review_deadline, now);
            return (
              <Card key={gig.id}>
                <CardContent className="p-4 sm:p-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground break-words">{gig.title}</h3>
                        <Badge className={REVIEW_STATUS_CLASS[rs]}>{REVIEW_STATUS_LABEL[rs]}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        ${Number(gig.base_price || 0).toFixed(2)} · submitted {new Date(gig.created_at).toLocaleString()}
                      </div>
                      {rs === 'pending_review' && (
                        <div className={`flex items-center gap-1 text-sm mt-1 ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                          <Clock className="w-4 h-4" />
                          {overdue ? 'Review overdue — please decide now' : formatReviewCountdown(gig.review_deadline, now)}
                          <span className="hidden sm:inline"> · Hidden from buyers until approved</span>
                        </div>
                      )}
                      {rs === 'changes_required' && gig.review_feedback && (
                        <div className="text-sm mt-2 rounded-md border border-orange-500/30 bg-orange-500/10 p-2 text-foreground">
                          <span className="font-medium">Feedback sent:</span> {gig.review_feedback}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                    {rs === 'pending_review' && (
                      <>
                        <Button size="sm" className="w-full sm:w-auto" disabled={busy} onClick={() => handleApprove(gig)}>
                          {busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                          Approve &amp; Publish
                        </Button>
                        <Button
                          size="sm" variant="outline" className="w-full sm:w-auto" disabled={busy}
                          onClick={() => { setReturnTarget(gig); setCheckedIssues([]); setFeedback(''); }}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" /> Return for Correction
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => window.open(gigPath(gig), '_blank')}>
                      <Eye className="w-4 h-4 mr-1" /> Preview
                    </Button>
                    <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => openHistory(gig)}>
                      <History className="w-4 h-4 mr-1" /> History
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      className="w-full sm:w-auto text-destructive hover:text-destructive"
                      disabled={busy}
                      onClick={() => setDeleteTarget(gig)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Return for correction */}
      <Dialog open={!!returnTarget} onOpenChange={(open) => !open && setReturnTarget(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Return for Correction</DialogTitle>
            <DialogDescription>
              Tick the issues and write feedback. The freelancer will see exactly what to fix and can resubmit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {GIG_REVIEW_ISSUES.map((issue) => (
              <label key={issue.key} className="flex items-start gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={checkedIssues.includes(issue.key)}
                  onCheckedChange={(c) =>
                    setCheckedIssues((prev) => c ? [...prev, issue.key] : prev.filter((k) => k !== issue.key))
                  }
                />
                <span>{issue.label}</span>
              </label>
            ))}
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write clear feedback for the freelancer (required)…"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnTarget(null)}>Cancel</Button>
            <Button onClick={handleReturn} disabled={busyId === returnTarget?.id}>
              {busyId === returnTarget?.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
              Send to Freelancer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review history */}
      <Dialog open={!!historyTarget} onOpenChange={(open) => !open && setHistoryTarget(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review History</DialogTitle>
            <DialogDescription>{historyTarget?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {(history[historyTarget?.id || ''] || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No history recorded yet.</p>
            ) : (
              (history[historyTarget?.id || ''] || []).map((h: any) => (
                <div key={h.id} className="rounded-md border p-3 text-sm">
                  <div className="font-medium text-foreground">{h.action || h.decision}</div>
                  <div className="text-muted-foreground">{new Date(h.created_at).toLocaleString()}</div>
                  {h.feedback && <div className="mt-1">{h.feedback}</div>}
                  {Array.isArray(h.issues) && h.issues.length > 0 && (
                    <div className="mt-1 text-muted-foreground">Issues: {h.issues.join(', ')}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this gig?</AlertDialogTitle>
            <AlertDialogDescription>
              {DELETE_GIG_CONFIRM}
              {deleteTarget && <span className="block mt-2 font-medium text-foreground break-words">{deleteTarget.title}</span>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyId === deleteTarget?.id}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={busyId === deleteTarget?.id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busyId === deleteTarget?.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminGigReview;
