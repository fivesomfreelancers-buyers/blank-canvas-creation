import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flag, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ReportDialogProps {
  /** UUID of the user being reported */
  reportedUserId?: string;
  relatedGigId?: string;
  relatedOrderId?: string;
  relatedMessageId?: string;
  /** Trigger element. If omitted, renders a default outline button. */
  trigger?: React.ReactNode;
  buttonLabel?: string;
  className?: string;
}

const CATEGORIES = [
  { value: 'scam', label: 'Scam / Fraud' },
  { value: 'fake_portfolio', label: 'Fake Portfolio / Stolen Work' },
  { value: 'spam', label: 'Spam' },
  { value: 'abuse', label: 'Abuse / Harassment' },
  { value: 'bad_behavior', label: 'Bad Behavior' },
  { value: 'order_problem', label: 'Order Problem' },
  { value: 'other', label: 'Other' },
];

const ReportDialog: React.FC<ReportDialogProps> = ({
  reportedUserId,
  relatedGigId,
  relatedOrderId,
  relatedMessageId,
  trigger,
  buttonLabel = 'Report',
  className,
}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('other');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please log in to submit a report.', variant: 'destructive' });
      return;
    }
    if (!reason.trim()) {
      toast({ title: 'Reason required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await (supabase as any).from('user_reports').insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId || null,
        related_gig_id: relatedGigId || null,
        related_order_id: relatedOrderId || null,
        related_message_id: relatedMessageId || null,
        category,
        reason: reason.trim(),
        details: details.trim() || null,
        context_url: typeof window !== 'undefined' ? window.location.href : null,
      });
      if (error) throw error;
      toast({ title: 'Report submitted', description: 'Our team will review this shortly.' });
      setOpen(false);
      setReason(''); setDetails(''); setCategory('other');
    } catch (err: any) {
      toast({ title: 'Failed to submit', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <span onClick={() => setOpen(true)} className={className}>
        {trigger || (
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            <Flag className="w-4 h-4 mr-2" /> {buttonLabel}
          </Button>
        )}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Flag className="w-5 h-5 text-destructive" /> Submit a Report</DialogTitle>
            <DialogDescription>Tell us what's wrong. Our admin team reviews every report.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason (short)</Label>
              <Textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} placeholder="Briefly describe the issue" />
            </div>
            <div>
              <Label>Details (optional)</Label>
              <Textarea value={details} onChange={e => setDetails(e.target.value)} rows={4} placeholder="Add any context, links, or evidence" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit} disabled={submitting} variant="destructive">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Report'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportDialog;
