-- Table privileges for the service role.
--
-- `service_role` bypasses Row Level Security but still needs ordinary SQL
-- privileges, and those are two different things. The earlier migrations granted
-- `authenticated` explicitly and revoked `anon`, which left the service role with
-- nothing on the newer tables — the guest flow failed with
-- "permission denied for table qr_codes" the first time it tried to resolve a
-- token.
--
-- Granting broadly here is deliberate: the service role is the trusted
-- server-side identity that already bypasses RLS, so withholding a SELECT buys no
-- safety while producing exactly the failure above. What actually contains it is
-- that the key never leaves `lib/supabase/admin.ts`.
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

-- Tables added by later migrations get the same treatment without needing to
-- remember this file.
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;

-- anon keeps nothing. The public feedback path goes through validated server
-- endpoints, not through direct anonymous table access.
revoke all on all tables in schema public from anon;
