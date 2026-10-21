/**
 * Content Collections: every piece of CV content lives in src/content/ and is
 * validated against these Zod schemas at build time. A typo in a date or a
 * missing field fails the build instead of shipping a broken page.
 *
 * Client organisations are NEVER named. Use the CV descriptors (see CLAUDE.md).
 */
import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Year-month, e.g. "2025-06". */
const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM');
const endDate = z.union([yearMonth, z.literal('present')]);

const metric = z.object({
  value: z.number(),
  prefix: z.string().optional(),
  /** e.g. "+", "%" */
  suffix: z.string().optional(),
  label: z.string(),
});

/** Single-entry collection: name, headline, bio, links. */
const profile = defineCollection({
  loader: file('src/content/profile.json'),
  schema: z.object({
    name: z.string(),
    headline: z.string(),
    tagline: z.string(),
    location: z.string(),
    status: z.string(),
    bio: z.array(z.string()).min(1),
    links: z.object({
      linkedin: z.url(),
      github: z.url(),
      /** Path under public/, resolved with url() */
      cv: z.string(),
    }),
    quickFacts: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
});

/** Roles and engagements. Clients sit under their employer via `parent`. */
const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    org: z.string(),
    kind: z.enum(['employer', 'client', 'internship', 'leadership', 'project', 'volunteering']),
    parent: reference('experience').optional(),
    sector: z.string().optional(),
    location: z.string().optional(),
    period: z.object({ start: yearMonth, end: endDate }),
    /** Titles held, oldest → newest. Shown as a progression, deliberately without per-title dates. */
    roles: z.array(z.string()).min(1),
    summary: z.string(),
    highlights: z.array(z.string()),
    metrics: z.array(metric).default([]),
    stack: z.array(z.string()).default([]),
    caseStudies: z.array(reference('projects')).default([]),
    order: z.number(),
  }),
});

/** Case studies: Source → Challenge → Transformation → Result. Body holds the narrative. */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    sector: z.string(),
    period: z.object({ start: yearMonth, end: endDate }),
    summary: z.string(),
    source: z.array(z.string()).min(1),
    target: z.array(z.string()).min(1),
    stack: z.array(z.string()),
    metrics: z.array(metric).min(1),
    order: z.number(),
    draft: z.boolean().default(false),
  }),
});

/** Rendered as a table definition: column | type | proficiency. */
const skills = defineCollection({
  loader: file('src/content/skills.json'),
  schema: z.object({
    name: z.string(),
    category: z.enum(['sql', 'etl', 'programming', 'bi', 'frontend', 'platform', 'ml']),
    level: z.enum(['expert', 'advanced', 'working']),
    note: z.string().optional(),
  }),
});

const education = defineCollection({
  loader: file('src/content/education.json'),
  schema: z.object({
    institution: z.string(),
    qualification: z.string(),
    location: z.string(),
    start: yearMonth,
    end: yearMonth,
    coursework: z.array(z.string()).default([]),
    order: z.number(),
  }),
});

const certifications = defineCollection({
  loader: file('src/content/certifications.json'),
  schema: z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.number().optional(),
    badgeUrl: z.url().optional(),
  }),
});

export const collections = { profile, experience, projects, skills, education, certifications };
