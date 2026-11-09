export function isIndexableJob(job: { status: string; application_deadline: string | null }, now = Date.now()): boolean {
  return job.status === 'published' && !!job.application_deadline && new Date(job.application_deadline).getTime() > now;
}