import { z } from 'zod';

/**
 * Environment validation.
 *
 * Three groups, and the boundaries between them are functional rather than stylistic:
 *
 * - `clientSchema` (NEXT_PUBLIC_* only) is a security boundary. Anything in it is inlined into the
 *   browser bundle at build time. Nothing but the Sentry DSN belongs here: all data access runs
 *   through Server Components and server actions, so the browser talks to no backend directly.
 * - `configSchema` holds server-side configuration that is not secret — the Supabase endpoint and
 *   the three host URLs.
 * - `serverSchema` holds the secrets and the knobs that go with them.
 *
 * Config is kept out of `serverSchema` on purpose: `src/proxy.ts` needs the portal URL and the
 * Supabase endpoint on every single request, the public feedback flow included, and must not be
 * taken down by a missing AI key or cron secret it never uses.
 */

const nonEmpty = z.string().trim().min(1);

/**
 * A service-role key is a JWT whose payload contains `"role":"service_role"`. Pasting one into the
 * anon-key slot would silently turn every user-scoped query into an RLS-bypassing one, which is a
 * quieter and worse failure than exposure. Detected here so the app refuses to boot instead.
 */
function looksLikeServiceRoleKey(value: string): boolean {
  const segments = value.split('.');
  if (segments.length !== 3) return false;
  try {
    const payload = Buffer.from(segments[1], 'base64url').toString('utf8');
    return payload.includes('service_role');
  } catch {
    return false;
  }
}

const anonKey = nonEmpty.refine((value) => !looksLikeServiceRoleKey(value), {
  message: 'This value is a service-role key; it bypasses RLS and must never be used as the anon key',
});

const clientSchema = z.object({
  NEXT_PUBLIC_SENTRY_DSN: z.string().trim().optional(),
});

/**
 * Read per request rather than frozen at build time, so one build can be promoted between
 * environments and a deployment can be repointed without a rebuild.
 */
const configSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_ANON_KEY: anonKey,
  MARKETING_URL: z.url(),
  PORTAL_URL: z.url(),
  REVIEW_URL: z.url(),
});

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  SUPABASE_SERVICE_ROLE_KEY: nonEmpty,

  /** 32 bytes, base64 encoded. AES-256-GCM key for consumer email encryption. */
  APP_ENCRYPTION_KEY: nonEmpty.refine(
    (value) => {
      try {
        return Buffer.from(value, 'base64').length === 32;
      } catch {
        return false;
      }
    },
    { message: 'APP_ENCRYPTION_KEY must be 32 bytes, base64 encoded (openssl rand -base64 32)' },
  ),

  /** Long enough that a leaked log line does not make it guessable. */
  CRON_SECRET: nonEmpty.min(16),

  AI_PROVIDER: z.enum(['anthropic']).default('anthropic'),
  ANTHROPIC_API_KEY: z.string().trim().optional(),
  ANTHROPIC_MODEL: z.string().trim().default('claude-sonnet-5'),

  EMAIL_PROVIDER: z.enum(['resend', 'postmark', 'console']).default('console'),
  RESEND_API_KEY: z.string().trim().optional(),
  EMAIL_FROM_ADDRESS: z.email().optional(),

  SENTRY_DSN: z.string().trim().optional(),

  TURNSTILE_SITE_KEY: z.string().trim().optional(),
  TURNSTILE_SECRET_KEY: z.string().trim().optional(),
});

type ClientEnv = z.infer<typeof clientSchema>;
type AppConfig = z.infer<typeof configSchema>;
type ServerEnv = z.infer<typeof serverSchema>;

function format(error: z.ZodError): string {
  const lines = error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`);
  return `Invalid environment configuration:\n${lines.join('\n')}`;
}

/**
 * Next.js inlines `process.env.NEXT_PUBLIC_*` at build time only when referenced statically,
 * so these have to be written out rather than iterated.
 */
function readClientEnv(): ClientEnv {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });

  if (!parsed.success) throw new Error(format(parsed.error));
  return parsed.data;
}

let clientEnvCache: ClientEnv | undefined;
let appConfigCache: AppConfig | undefined;
let serverEnvCache: ServerEnv | undefined;

/**
 * Safe to call from anywhere, including Client Components. Currently carries only the Sentry DSN;
 * it stays as the single declared client contract so future browser-facing values go through
 * validation instead of reaching for `process.env` ad hoc.
 */
export function clientEnv(): ClientEnv {
  clientEnvCache ??= readClientEnv();
  return clientEnvCache;
}

/**
 * Server only. Validates the non-secret configuration and nothing else, so a missing secret
 * elsewhere cannot take down the marketing site or the QR feedback flow.
 */
export function appConfig(): AppConfig {
  if (typeof window !== 'undefined') {
    throw new Error('appConfig() must never be called from the browser');
  }

  if (!appConfigCache) {
    const parsed = configSchema.safeParse(process.env);
    if (!parsed.success) throw new Error(format(parsed.error));
    appConfigCache = parsed.data;
  }

  return appConfigCache;
}

/** Server only. Throws if called in the browser. */
export function serverEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('serverEnv() must never be called from the browser');
  }

  if (!serverEnvCache) {
    const parsed = serverSchema.safeParse(process.env);
    if (!parsed.success) throw new Error(format(parsed.error));

    // Cross-field rules that a per-field schema cannot express.
    const data = parsed.data;
    if (data.AI_PROVIDER === 'anthropic' && !data.ANTHROPIC_API_KEY && data.NODE_ENV === 'production') {
      throw new Error('ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic in production');
    }
    if (data.EMAIL_PROVIDER === 'resend' && !data.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is required when EMAIL_PROVIDER=resend');
    }
    if (data.EMAIL_PROVIDER !== 'console' && !data.EMAIL_FROM_ADDRESS) {
      throw new Error('EMAIL_FROM_ADDRESS is required unless EMAIL_PROVIDER=console');
    }

    serverEnvCache = data;
  }

  return serverEnvCache;
}

export type { AppConfig, ClientEnv, ServerEnv };
