import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
export type Job = Database['public']['Tables']['jobs']['Row'];
export type Application = Database['public']['Tables']['job_applications']['Row'];
export type Agreement = Database['public']['Tables']['job_agreements']['Row'];
export interface CV {
  user_id: string; freelancer_id: string; full_name: string; username?: string;
  profile_image_url?: string; professional_title?: string; bio?: string; location?: string;
  skills?: string[]; languages?: string[]; years_experience?: string; education?: string;
  software_tools?: unknown; rating?: number; review_count: number; verified: boolean; blue_tick: boolean;
  portfolio: { media_url: string; media_type: string }[]; generated_at: string;
}
export const jobLabel = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
export const budgetLabel = (j: Pick<Job, 'budget_min' | 'budget_max' | 'payment_type'>) => `$${Number(j.budget_min).toLocaleString()}${j.budget_max !== j.budget_min ? ` – $${Number(j.budget_max).toLocaleString()}` : ''}${j.payment_type === 'hourly' ? ' / hr' : ''}`;
export const JOB_DURATIONS = ['Less than 1 week', '1–2 weeks', '2–4 weeks', '1–3 months', '3+ months', 'Ongoing'];
export const jobDeadlineMinutes = (deadline: string, now = Date.now()) => Math.max(0, Math.ceil((new Date(deadline).getTime() - now) / 60000));
export function validateJob(j: Partial<Job>, now = Date.now()): string | null {
  if ((j.title?.trim().length || 0) < 5) return 'Enter a job title with at least 5 characters.';
  if (!j.category) return 'Select a category.';
  if ((j.description?.trim().length || 0) < 50) return 'Describe the job in at least 50 characters.';
  if (!(Number(j.budget_min) > 0) || Number(j.budget_max) < Number(j.budget_min)) return 'Budget must be positive; maximum cannot be below minimum.';
  if (!j.duration || !j.experience || !j.work_location || !j.freelancer_count) return 'Complete work duration and freelancer requirements.';
  if (!j.skills?.length || !j.languages?.length) return 'Select at least one skill and language.';
  if (!j.requirements?.trim() || !j.deliverables?.trim()) return 'Add project requirements and expected deliverables.';
  if (!j.application_deadline || new Date(j.application_deadline).getTime() <= now) return 'Choose a future application deadline.';
  if ((j.questions?.length || 0) > 5 || j.questions?.some(q => !q.trim())) return 'Add no more than 5 non-empty application questions.';
  return null;
}
export async function signedJobFile(path: string) {
  const { data, error } = await supabase.storage.from('job-files').createSignedUrl(path, 600);
  if (error) throw error;
  return data.signedUrl;
}
export async function uploadJobFile(file: File | Blob, kind: 'references' | 'cv', name: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Please sign in.');
  if (file.size > 50 * 1024 * 1024) throw new Error('Maximum file size is 50 MB.');
  const path = `${user.id}/${kind}/${crypto.randomUUID()}-${name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const { error } = await supabase.storage.from('job-files').upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}