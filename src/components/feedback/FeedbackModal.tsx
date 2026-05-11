import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  freelancerName: string;
  onFeedbackSubmitted: () => void;
}

const FeedbackModal = ({ isOpen, onClose, orderId, freelancerName, onFeedbackSubmitted }: FeedbackModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({ title: 'Rating Required', description: 'Please select a star rating before submitting.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      // Get gig_id from the order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .select('gig_id')
        .eq('id', orderId)
        .single();
      if (orderErr) throw orderErr;
      if (!order?.gig_id) throw new Error('This order has no associated gig.');

      const { error: reviewErr } = await supabase.from('gig_reviews').insert({
        gig_id: order.gig_id,
        order_id: orderId,
        buyer_id: user.id,
        rating,
        comment: comment.trim() || null,
      } as any);
      if (reviewErr) throw reviewErr;

      toast({ title: 'Review Submitted! ⭐', description: 'Thanks — your review is now public on the freelancer profile.' });
      onFeedbackSubmitted();
      onClose();
    } catch (err: any) {
      toast({ title: 'Could not submit review', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Rate Your Experience</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
            </div>
            <p className="text-muted-foreground text-sm">How was your experience working with {freelancerName}?</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <Label className="block text-sm font-medium mb-3">Rating *</Label>
                <div className="flex justify-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star className={`w-8 h-8 ${star <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {rating === 0 && 'Click to rate'}
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              </div>

              <div>
                <Label htmlFor="comment" className="block text-sm font-medium mb-2">Comment (Optional)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this freelancer..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">{comment.length}/500 characters</p>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting || rating === 0}>
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackModal;
