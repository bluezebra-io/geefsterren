import { z } from 'zod';

/**
 * Environment validation.
 *
 * Split into a client schema (NEXT_PUBLIC_* only) and a server schema. The split is a security
 * boundary, not a stylistic one: anything in the client schema ends up in the browser bundle.
 */

const nonEmpty = z.string().trim().min(1);

/**
 * A service-role key is a JWT whose payload contains `"role":"service_role"`. If one is ever
 * pasted into a NEXT_PUBLIC_* variable it would be published to every visitor, so we detect it
 * and refuse to boot rather than ship it.
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

const publicKey = nonEmpty.refine((value) => !looksLikeServiceRoleKey(value), {
  message: 'This value is a service-role key and must never be exposed as NEXT_PUBLIC_*',
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: publicKey,
  NEXT_PUBLIC_MARKETING_URL: z.url(),
  NEXT_PUBLIC_PORTAL_URL: z.url(),
  NEXT_PUBLIC_REVIEW_URL: z.url(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().trim().optional(),
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
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_MARKETING_URL: process.env.NEXT_PUBLIC_MARKETING_URL,
    NEXT_PUBLIC_PORTAL_URL: process.env.NEXT_PUBLIC_PORTAL_URL,
    NEXT_PUBLIC_REVIEW_URL: process.env.NEXT_PUBLIC_REVIEW_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });

  if (!parsed.success) throw new Error(format(parsed.error));
  return parsed.data;
}

let clientEnvCache: ClientEnv | undefined;
let serverEnvCache: ServerEnv | undefined;

/** Safe to call from anywhere, including Client Components. */
export function clientEnv(): ClientEnv {
  clientEnvCache ??= readClientEnv();
  return clientEnvCache;
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

export type { ClientEnv, ServerEnv };
