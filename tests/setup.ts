import { config } from 'dotenv';

// Integration tests talk to the local Supabase stack, so they need the same variables the app
// uses. Unit tests do not read env at all; loading it here is harmless for them.
config({ path: '.env.local', quiet: true });
