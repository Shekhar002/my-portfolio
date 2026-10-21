import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export async function getProfile() {
  const profile = await getEntry('profile', 'shekhar');
  if (!profile) throw new Error('src/content/profile.json must contain a "shekhar" entry');
  return profile.data;
}

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

/** Published case studies, in display order. */
export async function getCaseStudies() {
  return (await getCollection('projects', ({ data }) => !data.draft)).sort(byOrder);
}

export type ExperienceEntry = CollectionEntry<'experience'>;
export type ExperienceNode = ExperienceEntry & { children: ExperienceEntry[] };

/**
 * Experience grouped for display: top-level roles (employers, internships) with
 * their client engagements nested underneath, plus "beyond work" entries.
 */
export async function getExperienceTree() {
  const all = (await getCollection('experience')).sort(byOrder);
  const childrenOf = (id: string) => all.filter((e) => e.data.parent?.id === id);

  const career: ExperienceNode[] = all
    .filter((e) => !e.data.parent && (e.data.kind === 'employer' || e.data.kind === 'internship'))
    .map((e) => ({ ...e, children: childrenOf(e.id) }));

  const beyond = all.filter((e) => e.data.kind === 'leadership' || e.data.kind === 'volunteering');

  return { career, beyond };
}
