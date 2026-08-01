import 'server-only';

import { NotFoundError } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Location } from '@/types/domain';

export async function listLocations(organizationId: string): Promise<Location[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('organization_id', organizationId)
    .is('archived_at', null)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

/**
 * RLS restricts this to locations the caller may access, so a location manager querying another
 * organization's location id gets `null` rather than a row. The NotFoundError is therefore also
 * the "not yours" response, which is the right thing to leak: nothing.
 */
export async function getLocation(locationId: string): Promise<Location> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', locationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new NotFoundError('Location not found');
  return data;
}

export async function slugExists(organizationId: string, slug: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from('locations')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('slug', slug);

  if (error) throw error;
  return (count ?? 0) > 0;
}
