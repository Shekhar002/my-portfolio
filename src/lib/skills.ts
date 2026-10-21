import type { CollectionEntry } from 'astro:content';

export type SkillCategory = CollectionEntry<'skills'>['data']['category'];

/** Display order and SQL-ish type names, shared by the schema view and the command palette. */
export const SKILL_CATEGORIES: Record<SkillCategory, { order: number; label: string }> = {
  sql: { order: 1, label: 'sql' },
  etl: { order: 2, label: 'etl' },
  programming: { order: 3, label: 'programming' },
  ml: { order: 4, label: 'ml' },
  bi: { order: 5, label: 'bi_visualisation' },
  platform: { order: 6, label: 'platform' },
  frontend: { order: 7, label: 'frontend' },
};

export const SKILL_LEVELS = { expert: 3, advanced: 2, working: 1 } as const;
