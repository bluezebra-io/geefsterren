-- Scan counter.
--
-- A function rather than `update ... set scan_count = scan_count + 1` from the
-- application, so two concurrent scans cannot read the same value and both write
-- the same increment. Postgres does the arithmetic under the row lock.
create or replace function public.increment_qr_scan(p_qr_code_id uuid)
returns void
language sql
volatile
security definer
set search_path = pg_catalog, public
as $$
  update public.qr_codes set scan_count = scan_count + 1 where id = p_qr_code_id;
$$;

-- Only the service role calls this: it runs on the anonymous guest path, and
-- there is no reason for a signed-in portal user to move the counter.
revoke all on function public.increment_qr_scan(uuid) from public, anon, authenticated;
grant execute on function public.increment_qr_scan(uuid) to service_role;
