import { describe, expect, it } from 'vitest';

import { newNonce } from './googleSignIn';

describe('newNonce', () => {
  it('gives a fresh code and its SHA-256 for Google', async () => {
    const a = await newNonce();
    const b = await newNonce();
    expect(a.plain).not.toBe(b.plain);
    expect(a.hashed).toMatch(/^[0-9a-f]{64}$/);
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(a.plain));
    expect(a.hashed).toBe(
      Array.from(new Uint8Array(digest), (x) => x.toString(16).padStart(2, '0')).join(''),
    );
  });
});
