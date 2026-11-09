import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { jobDeadlineMinutes, validateJob } from '../src/lib/jobs';
const now = Date.parse('2026-11-08T10:00:00Z');
const valid = { title: 'Build a website', category: 'web-design', description: 'Build a professional business website with accessible pages, responsive layouts and clear navigation.', budget_min: 100, budget_max: 500, duration: '1–2 weeks', experience: 'expert', work_location: 'remote', freelancer_count: '1', skills: ['React'], languages: ['Somali'], requirements: 'Build the site', deliverables: 'Source code', application_deadline: '2026-11-10T10:00:00Z', questions: [] };
describe('Jobs rules', () => {
  it('accepts complete required job data', () => assert.equal(validateJob(valid, now), null));
  it('rejects maximum budget below minimum', () => assert.match(validateJob({ ...valid, budget_max: 99 }, now) || '', /maximum/i));
  it('requires buyer requirements', () => assert.match(validateJob({ ...valid, requirements: '' }, now) || '', /requirements/i));
  it('requires deliverables', () => assert.match(validateJob({ ...valid, deliverables: '' }, now) || '', /deliverables/i));
  it('requires skills and languages', () => assert.match(validateJob({ ...valid, languages: [] }, now) || '', /language/i));
  it('allows at most 5 questions', () => assert.match(validateJob({ ...valid, questions: ['1', '2', '3', '4', '5', '6'] }, now) || '', /5/));
  it('shows the required one-hour review window', () => assert.equal(jobDeadlineMinutes('2026-11-08T11:00:00Z', now), 60));
  it('never extends an expired review timer', () => assert.equal(jobDeadlineMinutes('2026-11-08T09:00:00Z', now), 0));
});