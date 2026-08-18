import { NextResponse, type NextRequest } from 'next/server';
import QRCode from 'qrcode';

import { getPortalActor } from '@/features/auth/queries';
import { feedbackUrlFor } from '@/features/qr-codes/service';
import { clientEnv } from '@/lib/env';
import { describeError, logger } from '@/lib/observability/logger';
import { decryptValue } from '@/lib/security/encryption';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/validation/slug';

/**
 * Downloads a QR code as SVG or PNG.
 *
 * Print constraints from the design system are the reason for the options below:
 * error correction level **H**, so a sticker survives a scuff, and a quiet zone of
 * 4 modules, because a code printed flush against artwork often will not scan.
 * PNG is rendered at 1024px, which is ~85mm at 300dpi.
 *
 * Reading the row goes through the RLS-scoped client, so a location manager can
 * only download a QR for a location they may manage. The token itself is
 * decrypted here and never sent to the browser as text.
 */

const QR_OPTIONS = {
  errorCorrectionLevel: 'H' as const,
  margin: 4,
  color: { dark: '#142334', light: '#FFFFFF' },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrCodeId: string }> },
): Promise<NextResponse> {
  const actor = await getPortalActor();
  if (!actor) return new NextResponse('Not found', { status: 404 });

  const { qrCodeId } = await params;
  const format = request.nextUrl.searchParams.get('format') === 'png' ? 'png' : 'svg';

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('qr_codes')
    .select('id, label, token_encrypted, campaigns(name), locations(slug, organizations(slug))')
    .eq('id', qrCodeId)
    .maybeSingle();

  if (error) {
    logger.error('qr download query failed', { ...describeError(error) });
    return new NextResponse('Not found', { status: 404 });
  }

  // Indistinguishable from "does not exist", because RLS already filtered rows
  // this user may not see and the difference is not theirs to learn.
  if (!data) return new NextResponse('Not found', { status: 404 });

  if (!data.token_encrypted) {
    return NextResponse.json(
      { error: 'token_unavailable', message: 'Reissue this QR code to download it again.' },
      { status: 409 },
    );
  }

  let token: string;
  try {
    token = decryptValue(data.token_encrypted);
  } catch (decryptionError) {
    logger.error('qr token could not be decrypted for download', {
      qr_code_id: data.id,
      ...describeError(decryptionError),
    });
    return NextResponse.json(
      { error: 'token_unreadable', message: 'Reissue this QR code to download it again.' },
      { status: 409 },
    );
  }

  const url = feedbackUrlFor(clientEnv().NEXT_PUBLIC_REVIEW_URL, token);

  // Filename carries organization, location and campaign, so a folder of these
  // is still sortable months later.
  const filename = [
    'geefsterren',
    slugify(data.locations?.organizations?.slug ?? 'organisatie'),
    slugify(data.locations?.slug ?? 'vestiging'),
    slugify(data.campaigns?.name ?? 'campagne'),
    slugify(data.label ?? ''),
  ]
    .filter(Boolean)
    .join('-');

  try {
    if (format === 'png') {
      const png = await QRCode.toBuffer(url, { ...QR_OPTIONS, type: 'png', width: 1024 });
      return new NextResponse(new Uint8Array(png), {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${filename}.png"`,
          // A QR is a credential. Caching it in a shared proxy would be careless.
          'Cache-Control': 'private, no-store',
        },
      });
    }

    const svg = await QRCode.toString(url, { ...QR_OPTIONS, type: 'svg' });
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="${filename}.svg"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (renderError) {
    logger.error('qr rendering failed', { qr_code_id: data.id, ...describeError(renderError) });
    return new NextResponse('Could not render this QR code', { status: 500 });
  }
}
