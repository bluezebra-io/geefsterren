import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export type QrCodeRow = {
  id: string;
  label: string | null;
  sourceChannel: string;
  status: 'active' | 'inactive';
  scanCount: number;
  createdAt: string;
  campaignId: string;
  campaignName: string;
  sessionCount: number;
  submissionCount: number;
  /**
   * Whether the token can still be recovered for a reprint.
   *
   * False for rows created before encrypted storage (the seeded demo codes):
   * only a hash was kept, and a hash cannot be turned back into a QR. Those need
   * reissuing first, so the UI offers that instead of a download that would
   * always fail.
   */
  canDownload: boolean;
};

/**
 * QR codes for a location, with how much traffic each has produced.
 *
 * Sessions and submissions are counted separately: the gap between them is the
 * completion rate, which is the number that tells you whether a sticker is in a
 * bad place versus whether the flow itself is losing people.
 */
export async function listQrCodes(locationId: string): Promise<QrCodeRow[]> {
  const supabase = await createSupabaseServerClient();

  const [codes, sessions, submissions] = await Promise.all([
    supabase
      .from('qr_codes')
      .select('id, label, source_channel, status, scan_count, created_at, campaign_id, token_encrypted, campaigns(name)')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false }),
    supabase.from('feedback_sessions').select('qr_code_id').eq('location_id', locationId),
    supabase
      .from('feedback_submissions')
      .select('feedback_session_id, feedback_sessions(qr_code_id)')
      .eq('location_id', locationId),
  ]);

  if (codes.error) throw codes.error;
  if (sessions.error) throw sessions.error;
  if (submissions.error) throw submissions.error;

  const sessionCounts = new Map<string, number>();
  for (const row of sessions.data ?? []) {
    sessionCounts.set(row.qr_code_id, (sessionCounts.get(row.qr_code_id) ?? 0) + 1);
  }

  const submissionCounts = new Map<string, number>();
  for (const row of submissions.data ?? []) {
    const qrId = row.feedback_sessions?.qr_code_id;
    if (qrId) submissionCounts.set(qrId, (submissionCounts.get(qrId) ?? 0) + 1);
  }

  return (codes.data ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    sourceChannel: row.source_channel,
    status: row.status as 'active' | 'inactive',
    scanCount: row.scan_count,
    createdAt: row.created_at,
    campaignId: row.campaign_id,
    campaignName: row.campaigns?.name ?? '—',
    sessionCount: sessionCounts.get(row.id) ?? 0,
    submissionCount: submissionCounts.get(row.id) ?? 0,
    canDownload: row.token_encrypted !== null,
  }));
}

export type CampaignOption = { id: string; name: string; status: string };

export async function listCampaigns(locationId: string): Promise<CampaignOption[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select('id, name, status')
    .eq('location_id', locationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
