import { describe, expect, it } from 'vitest';

import { classifyHost } from '@/lib/hosts';

const PORTAL_URL = 'https://app.geefsterren.nl';

describe('classifyHost', () => {
  it('recognises the configured portal host', () => {
    expect(classifyHost('app.geefsterren.nl', PORTAL_URL)).toBe('portal');
  });

  it('ignores the port', () => {
    expect(classifyHost('app.geefsterren.nl:3000', PORTAL_URL)).toBe('portal');
  });

  it('is case insensitive', () => {
    expect(classifyHost('APP.GeefSterren.NL', PORTAL_URL)).toBe('portal');
  });

  it('treats the marketing and apex hosts as marketing', () => {
    expect(classifyHost('geefsterren.nl', PORTAL_URL)).toBe('marketing');
    expect(classifyHost('www.geefsterren.nl', PORTAL_URL)).toBe('marketing');
  });

  it('does not treat a lookalike suffix host as the portal', () => {
    // The whole reason for exact matching rather than a startsWith('app.') test.
    expect(classifyHost('app.geefsterren.nl.attacker.com', PORTAL_URL)).toBe('marketing');
    expect(classifyHost('evil-app.geefsterren.nl.example.com', PORTAL_URL)).toBe('marketing');
  });

  it('does not treat a location subdomain as the portal', () => {
    expect(classifyHost('leiden.geefsterren.nl', PORTAL_URL)).toBe('marketing');
  });

  it('supports the local development portal host', () => {
    expect(classifyHost('app.localhost:5010', PORTAL_URL)).toBe('portal');
    expect(classifyHost('localhost:5010', PORTAL_URL)).toBe('marketing');
  });

  it('falls back to marketing for a missing host header', () => {
    expect(classifyHost(null, PORTAL_URL)).toBe('marketing');
    expect(classifyHost(undefined, PORTAL_URL)).toBe('marketing');
    expect(classifyHost('', PORTAL_URL)).toBe('marketing');
  });

  it('falls back to marketing when the portal URL is unparseable', () => {
    expect(classifyHost('app.geefsterren.nl', 'not-a-url')).toBe('marketing');
  });
});
