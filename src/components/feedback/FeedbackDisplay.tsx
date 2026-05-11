import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  buyer_id: string;
  gig_id: string | null;
  buyerName?: string;
  buyerImage?: string | null;
  gigTitle?: string | null;
}

interface Props {
  /** Provide either the freelancer's user_id (preferred) or freelancer.id */
  freelancerUserId?: string | null;
  freelancerId?: string | null;
  averageRating?: number;
  totalReviewsHint?: number;
}

const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
  const cls = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${cls} ${s <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
      ))}
    </div>
  );
};

const FeedbackDisplay: React.FC<Props> = ({ freelancerUserId, freelancerId, averageRating, totalReviewsHint }) => {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Resolve freelancer.id from user_id if needed
        let fId = freelancerId || null;
        if (!fId && freelancerUserId) {
          const { data: f } = await supabase.from('freelancers').select('id').eq('user_id', freelancerUserId).maybeSingle();
          fId = f?.id || null;
        }
        if (!fId) { setReviews([]); return; }

        const { data: gigs } = await supabase.from('gigs').select('id, title').eq('freelancer_id', fId);
        const gigIds = (gigs || []).map(g => g.id);
        const gigTitleMap = new Map((gigs || []).map(g => [g.id, g.title]));
        if (gigIds.length === 0) { setReviews([]); return; }

        const { data: revs } = await supabase
          .from('gig_reviews')
          .select('*')
          .in('gig_id', gigIds)
          .order('created_at', { ascending: false });

        const buyerIds = Array.from(new Set((revs || []).map(r => r.buyer_id)));
        const { data: profiles } = buyerIds.length
          ? await (supabase as any).from('public_profiles').select('id, full_name, profile_image_url').in('id', buyerIds)
          : { data: [] as any[] };
        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

        setReviews((revs || []).map(r => ({
          ...r,
          buyerName: (profileMap.get(r.buyer_id) as any)?.full_name || 'Buyer',
          buyerImage: (profileMap.get(r.buyer_id) as any)?.profile_image_url || null,
          gigTitle: gigTitleMap.get(r.gig_id || '') || null,
        })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [freelancerUserId, freelancerId]);

  const total = reviews.length || totalReviewsHint || 0;
  const avg = averageRating ?? (reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0);

  if (loading) {
    return (
      <Card><CardHeader><CardTitle>Reviews</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground text-sm">Loading reviews...</p></CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Reviews</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground">Complete an order to receive your first review</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <span>Reviews</span>
          <div className="flex items-center space-x-2">
            {renderStars(avg, 'md')}
            <span className="font-bold text-lg">{avg.toFixed(1)}</span>
            <span className="text-muted-foreground">({total} review{total === 1 ? '' : 's'})</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-6 last:border-b-0">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.buyerImage || undefined} className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {(review.buyerName || 'B').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div>
                      <h4 className="font-medium text-foreground">{review.buyerName}</h4>
                      {review.gigTitle && <p className="text-xs text-muted-foreground">{review.gigTitle}</p>}
                    </div>
                    <div className="text-right">
                      {renderStars(review.rating)}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackDisplay;
