'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { Locale } from './config';
import type { PortalMessages, PublicMessages } from './scope';

/**
 * Makes a request's message catalogue available to Client Components.
 *
 * Server Components read messages directly via `getMessages()`. Client
 * Components cannot, so a server layout resolves the catalogue once and passes
 * it across the boundary here.
 *
 * There are two scopes rather than one, because anything passed across the
 * boundary is serialised into the HTML: the public site must not ship the
 * portal's strings. See `scope.ts`.
 */

type Scope<T> = { locale: Locale; messages: T };

function createScope<T>(name: string) {
  const Context = createContext<Scope<T> | null>(null);

  function Provider({
    locale,
    messages,
    children,
  }: {
    locale: Locale;
    messages: T;
    children: ReactNode;
  }) {
    return <Context.Provider value={{ locale, messages }}>{children}</Context.Provider>;
  }

  function useScope(): Scope<T> {
    const value = useContext(Context);
    if (!value) {
      throw new Error(`use${name}Messages must be used inside ${name}I18nProvider`);
    }
    return value;
  }

  return { Provider, useScope };
}

const publicScope = createScope<PublicMessages>('Public');
const portalScope = createScope<PortalMessages>('Portal');

export const PublicI18nProvider = publicScope.Provider;
export const PortalI18nProvider = portalScope.Provider;

/** For Client Components on the marketing site and the guest flow. */
export function usePublicMessages(): PublicMessages {
  return publicScope.useScope().messages;
}

/** For Client Components in the portal and the auth screens. */
export function usePortalMessages(): PortalMessages {
  return portalScope.useScope().messages;
}

export function usePublicLocale(): Locale {
  return publicScope.useScope().locale;
}

export function usePortalLocale(): Locale {
  return portalScope.useScope().locale;
}

/** Client-side counterpart of `format()` in `locale.ts`. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
