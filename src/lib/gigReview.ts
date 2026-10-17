// Gig review lifecycle shared by admin/founder review screens and freelancer views.
// DB is authoritative: review_status lives on gigs, transitions go through the
// submit_gig_for_review / admin_review_gig RPCs only.

export type GigReviewStatus =
  | 'draft'
  | 'pending_review'
  | 'changes_required'
  | 'approved'
  | 'published';

export const REVIEW_STATUS_LABEL: Record<GigReviewStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  changes_required: 'Changes Required',
  approved: 'Approved',
  published: 'Published',
};

export const REVIEW_STATUS_CLASS: Record<GigReviewStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending_review: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
  changes_required: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30',
  approved: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
  published: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
};

// Tickable issue list shown in the "Return for Correction" dialog.
export const GIG_REVIEW_ISSUES: { key: string; label: string }[] = [
  { key: 'title', label: 'Title is unclear or misleading' },
  { key: 'description', label: 'Description is too short or unclear' },
  { key: 'images', label: 'Images are missing, low quality, or inappropriate' },
  { key: 'pricing', label: 'Pricing packages are incomplete or confusing' },
  { key: 'requirements', label: 'Buyer requirements are missing or unclear' },
  { key: 'category', label: 'Wrong category or subcategory' },
  { key: 'tags', label: 'Search tags are missing or irrelevant' },
  { key: 'policy', label: 'Content violates Fivesom policies' },
  { key: 'contact_info', label: 'Contains external contact info or links' },
  { key: 'other', label: 'Other issue (explain in feedback)' },
];

export function asReviewStatus(value: unknown): GigReviewStatus {
  const v = String(value || '');
  return (['draft', 'pending_review', 'changes_required', 'approved', 'published'] as const).includes(v as GigReviewStatus)
    ? (v as GigReviewStatus)
    : 'published'; // legacy gigs without a review status are already live
}

export function formatReviewCountdown(deadline: string | null | undefined, now = Date.now()): string {
  if (!deadline) return '';
  const ms = new Date(deadline).getTime() - now;
  if (ms <= 0) return 'Overdue';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}

export function isReviewOverdue(deadline: string | null | undefined, now = Date.now()): boolean {
  return !!deadline && new Date(deadline).getTime() < now;
}
