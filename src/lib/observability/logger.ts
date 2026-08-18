/**
 * Structured logging.
 *
 * Logs are JSON lines so they stay queryable in Vercel's log drain. Context identifiers travel
 * with the log rather than being interpolated into a message string.
 *
 * Never pass to this: raw consumer email addresses, reward codes, QR tokens, access tokens,
 * Supabase keys, or unscrubbed AI prompts containing customer comments.
 */

export type LogContext = {
  request_id?: string;
  organization_id?: string;
  location_id?: string;
  campaign_id?: string;
  job_id?: string;
  analysis_run_id?: string;
  [key: string]: string | number | boolean | null | undefined;
};

type Level = 'debug' | 'info' | 'warn' | 'error';

/**
 * Keys whose values are redacted if they ever reach a log call. This is a backstop for mistakes,
 * not a licence to pass secrets and rely on scrubbing.
 */
const REDACTED_KEYS = new Set([
  'email',
  'email_address',
  'recipient_email',
  'reward_code',
  'token',
  'qr_token',
  'access_token',
  'refresh_token',
  'password',
  'api_key',
  'authorization',
]);

function scrub(context: LogContext): LogContext {
  const output: LogContext = {};
  for (const [key, value] of Object.entries(context)) {
    output[key] = REDACTED_KEYS.has(key.toLowerCase()) ? '[redacted]' : value;
  }
  return output;
}

function emit(level: Level, message: string, context: LogContext = {}): void {
  const line = JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...scrub(context),
  });

  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV !== 'production') emit('debug', message, context);
  },
  info: (message: string, context?: LogContext) => emit('info', message, context),
  warn: (message: string, context?: LogContext) => emit('warn', message, context),
  error: (message: string, context?: LogContext) => emit('error', message, context),
};

/**
 * Normalises an unknown thrown value into loggable context.
 *
 * The keys are namespaced (`error_name`, `error_message`) rather than `name` and
 * `message`, because a bare `message` key spread into the log context silently
 * overwrote the log's own message — every error read "[object Object]" and the
 * call site was unknowable.
 *
 * Non-Error values are JSON-serialised. `String(error)` on a Supabase error
 * object yields "[object Object]", which is exactly the information you need and
 * do not get.
 */
export function describeError(error: unknown): {
  error_name: string;
  error_message: string;
  error_code?: string;
} {
  if (error instanceof Error) {
    return { error_name: error.name, error_message: error.message };
  }

  if (error !== null && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const code = typeof record.code === 'string' ? record.code : undefined;
    const message =
      typeof record.message === 'string' ? record.message : safeStringify(error);
    return {
      error_name: typeof record.name === 'string' ? record.name : 'ObjectError',
      error_message: message,
      ...(code ? { error_code: code } : {}),
    };
  }

  return { error_name: 'UnknownError', error_message: String(error) };
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}
