import type { NextConfig } from 'next';

/**
 * Security headers.
 *
 * A Content-Security-Policy is deliberately not set here yet: it needs a nonce-based script-src
 * wired into the rendering path, and the public feedback flow in Phase 3 is what determines the
 * required sources (Turnstile, Supabase). A permissive CSP added now would be worse than none —
 * it would look like coverage while allowing everything.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Never ship a build that skipped type checking. Next 16 removed the `eslint` key, so linting
  // is enforced by CI and the `lint` script instead of by the build.
  typescript: { ignoreBuildErrors: false },

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
