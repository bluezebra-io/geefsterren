import type { Metadata } from 'next';
import { DM_Sans, Plus_Jakarta_Sans } from 'next/font/google';

import { resolveLocale } from '@/lib/i18n/locale';

import './globals.css';

/*
 * Two families, no exceptions: Plus Jakarta Sans for display and headings,
 * DM Sans for body, UI, tables and every number.
 *
 * Loaded through `next/font` rather than a Google Fonts @import so the files
 * are self-hosted and there is no render-blocking request to a third party —
 * the design handoff lists this as a recommended improvement over the
 * prototypes.
 */
const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'GeefSterren',
    template: '%s',
  },
  description:
    'Collect structured private feedback from your guests, understand what to improve, and earn better public reviews.',
  icons: { icon: '/icon.svg' },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await resolveLocale();

  return (
    <html lang={locale} className={`${jakarta.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
