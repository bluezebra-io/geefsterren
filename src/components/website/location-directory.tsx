'use client';

import { MapPin, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Card, CardBody, ChoiceChip, EmptyState, Input, Select } from '@/components/ui';
import { ExampleLabel, LocationCard, type ImprovementStatus } from '@/components/website';

/**
 * The public improvement directory — handoff page 2, section 2.2.
 *
 * Filtering runs in the browser over a list the server already narrowed to
 * publishable locations. That is fine at this size and keeps the page static;
 * once the list outgrows a single response it becomes a server-side query with
 * the same shape.
 *
 * **There is deliberately no sort by score.** Sorting is last-updated or name
 * only. That is a product rule from the design system, not a styling choice: a
 * score sort would turn this page into the ranking it is explicitly not.
 */

export type DirectoryCategory = 'all' | 'delivery' | 'restaurant' | 'retail';

export type DirectoryLocation = {
  name: string;
  city: string;
  category: Exclude<DirectoryCategory, 'all'>;
  status: ImprovementStatus;
  topic: string;
  change: string;
  date: string;
  initials: string;
  /** Stable key, and the path segment once the location page exists. */
  slug: string;
  /**
   * Omitted while `/vestiging/{slug}` does not exist. A `Link` to a missing
   * route is not just a dead click: Next prefetches it, so every card would
   * fire a 404 on page load.
   */
  href?: string;
  /** ISO date, so `recent` sorts lexicographically without parsing. */
  updatedAt: string;
};

export type DirectoryLabels = {
  searchLabel: string;
  categoryAll: string;
  categoryDelivery: string;
  categoryRestaurant: string;
  categoryRetail: string;
  sortLabel: string;
  sortRecent: string;
  sortName: string;
  sortNote: string;
  resultCount: string;
  emptyTitle: string;
  emptyBody: string;
  exampleLabel: string;
  statusLabels: Record<ImprovementStatus, string>;
};

export function LocationDirectory({
  locations,
  labels,
}: {
  locations: readonly DirectoryLocation[];
  labels: DirectoryLabels;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<DirectoryCategory>('all');
  const [sort, setSort] = useState<'recent' | 'name'>('recent');

  const categories: Array<{ value: DirectoryCategory; label: string }> = [
    { value: 'all', label: labels.categoryAll },
    { value: 'delivery', label: labels.categoryDelivery },
    { value: 'restaurant', label: labels.categoryRestaurant },
    { value: 'retail', label: labels.categoryRetail },
  ];

  const visible = useMemo(() => {
    // Search matches name or city, so "Leiden" and "De Haven" both work.
    const needle = query.trim().toLowerCase();

    const filtered = locations.filter((location) => {
      const matchesCategory = category === 'all' || location.category === category;
      const matchesQuery =
        needle === '' ||
        location.name.toLowerCase().includes(needle) ||
        location.city.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });

    return [...filtered].sort((a, b) =>
      sort === 'name'
        ? a.name.localeCompare(b.name, 'nl')
        : b.updatedAt.localeCompare(a.updatedAt),
    );
  }, [locations, query, category, sort]);

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:flex-row lg:items-center">
        <div className="relative lg:min-w-60 lg:flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
          <Input
            type="search"
            aria-label={labels.searchLabel}
            placeholder={labels.searchLabel}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-11"
          />
        </div>

        {/* Horizontally scrolling on a narrow screen rather than wrapping into
            two ragged rows. */}
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
          {categories.map((option) => (
            <ChoiceChip
              key={option.value}
              selected={category === option.value}
              onClick={() => setCategory(option.value)}
              className="shrink-0"
            >
              {option.label}
            </ChoiceChip>
          ))}
        </div>

        <Select
          aria-label={labels.sortLabel}
          value={sort}
          onChange={(event) => setSort(event.target.value as 'recent' | 'name')}
          className="lg:w-52"
        >
          <option value="recent">{labels.sortRecent}</option>
          <option value="name">{labels.sortName}</option>
        </Select>
      </div>

      <div className="mt-5 mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-[var(--color-text-muted)]">{labels.sortNote}</p>
        <div className="flex items-center gap-3">
          <p className="tabular text-sm text-[var(--color-text-secondary)]">
            {visible.length} {labels.resultCount}
          </p>
          <ExampleLabel>{labels.exampleLabel}</ExampleLabel>
        </div>
      </div>

      {visible.length === 0 ? (
        <Card>
          <CardBody className="p-10">
            <EmptyState
              icon={<MapPin aria-hidden="true" className="size-10" />}
              title={labels.emptyTitle}
              description={labels.emptyBody}
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((location) => (
            <LocationCard
              key={location.slug}
              name={location.name}
              city={location.city}
              topic={location.topic}
              change={location.change}
              date={location.date}
              href={location.href}
              status={location.status}
              statusLabel={labels.statusLabels[location.status]}
              initials={location.initials}
            />
          ))}
        </div>
      )}
    </div>
  );
}
