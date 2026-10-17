type ReviewState = {
  review_status: string;
  status: string;
  submitted_at: string | null;
  review_deadline: string | null;
};

type ReviewClient = {
  rpc: (name: 'submit_gig_for_review', args: { _gig_id: string }) => PromiseLike<{ error: { message: string } | null }>;
  from: (table: 'gigs') => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        single: () => PromiseLike<{ data: ReviewState | null; error: { message: string } | null }>;
      };
    };
  };
};

// Both new submissions and corrected gigs use the same server-owned transition.
export async function submitSavedGigForReview(client: ReviewClient, gigId: string, requireReview = true) {
  const { error } = await client.rpc('submit_gig_for_review', { _gig_id: gigId });
  if (error) throw new Error(error.message);
  const { data: saved, error: readError } = await client.from('gigs')
    .select('review_status, status, submitted_at, review_deadline').eq('id', gigId).single();
  if (readError) throw new Error(readError.message);
  if (!requireReview && saved && ['approved', 'published'].includes(saved.review_status)) return saved;
  const windowMs = saved?.submitted_at && saved.review_deadline
    ? Date.parse(saved.review_deadline) - Date.parse(saved.submitted_at)
    : NaN;
  if (!saved || saved.review_status !== 'pending_review' || saved.status !== 'draft' || windowMs !== 5 * 60 * 60 * 1000) {
    throw new Error('Your gig could not be confirmed as Pending Review. Please try submitting again.');
  }
  return saved;
}