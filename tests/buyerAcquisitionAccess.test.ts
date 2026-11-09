import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('anonymous visitors cannot access buyer-growth summaries', async () => {
  const source = readFileSync(new URL('../scripts/generate-sitemap.ts', import.meta.url), 'utf8');
  const url = source.match(/const SUPABASE_URL = .*?"(https:\/\/[^"\n]+)"/)?.[1];
  const key = source.match(/"(eyJ[^"\n]+)"/)?.[1];
  assert.ok(url && key, 'public Supabase configuration is present');
  const response = await fetch(`${url}/rest/v1/rpc/buyer_acquisition_summary`, {
    method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: '{}',
  });
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.code, '42501');
});