import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canonicalSeoUrl, absoluteAssetUrl } from '../src/lib/seo/site';

test('public page canonicals use the final slash address and omit search variants', () => {
  assert.equal(canonicalSeoUrl('/explore?q=logo&utm_source=google#results'), 'https://fivesom.net/explore/');
  assert.equal(canonicalSeoUrl('/services/logo-design/'), 'https://fivesom.net/services/logo-design/');
  assert.equal(canonicalSeoUrl('/'), 'https://fivesom.net/');
});

test('uploaded service media addresses are never rewritten as page URLs', () => {
  assert.equal(absoluteAssetUrl('/og-image.png'), 'https://fivesom.net/og-image.png');
  assert.equal(absoluteAssetUrl('https://cdn.example.com/preview.webp'), 'https://cdn.example.com/preview.webp');
});