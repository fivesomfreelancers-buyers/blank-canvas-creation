import test from 'node:test';
import assert from 'node:assert/strict';
import { popularServiceTags } from '../src/lib/homeDiscovery';
import type { SearchGigResult } from '../src/hooks/useGigSearch';

test('popular suggestions count each published service once and merge equivalent tags', () => {
  const gigs = [
    { tags: ['Translation', 'translation', 'Logo'] },
    { tags: [' translation ', 'Video'] },
  ] as SearchGigResult[];
  assert.deepEqual(popularServiceTags(gigs, 2), [
    { label: 'Translation', count: 2 },
    { label: 'Logo', count: 1 },
  ]);
});

test('no published gigs means no invented trending suggestions', () => {
  assert.deepEqual(popularServiceTags([]), []);
});