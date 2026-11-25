import { supabase } from '@/integrations/supabase/client';

export const db = supabase as any;

export const ACADEMY_PLANS = {
  golden: { name: 'Golden', price: 5, firstMonth: 1, courses: 1, liveDays: 1,
    features: ['Student Dashboard', '1 live teaching session per week', 'Dedicated Course Community Group', 'Publish 1 course', 'Upload and manage lessons', 'Manage enrolled students', 'Student questions and discussions'] },
  platinum: { name: 'Platinum', price: 20, firstMonth: 10, courses: 3, liveDays: 3,
    features: ['Student Dashboard', '3 live teaching days per week', 'Dedicated Course Community Group', 'Voice Chat Community Group', 'Publish up to 3 courses', 'Upload and manage lessons for all courses', 'Manage enrolled students', 'Expanded teaching and community features'] },
} as const;
export type AcademyPlan = keyof typeof ACADEMY_PLANS;

export const courseLimit = (plan: string | null | undefined) =>
  plan === 'platinum' ? 3 : plan === 'golden' ? 1 : 0;

/** Uploads to a bucket under the user's own folder and returns the storage path. */
export async function uploadAcademyFile(bucket: string, userId: string, file: File, folder: string) {
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${userId}/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

export async function uploadPublicCourseMedia(userId: string, file: File) {
  const path = await uploadAcademyFile('gig-media', userId, file, 'academy');
  return supabase.storage.from('gig-media').getPublicUrl(path).data.publicUrl;
}

export async function signedUrl(bucket: string, path: string | null | undefined) {
  if (!path) return null;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export const videoDurationSeconds = (file: File) => new Promise<number>((resolve) => {
  const v = document.createElement('video');
  v.preload = 'metadata';
  v.onloadedmetadata = () => { URL.revokeObjectURL(v.src); resolve(v.duration || 0); };
  v.onerror = () => resolve(0);
  v.src = URL.createObjectURL(file);
});
