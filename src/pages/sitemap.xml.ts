import type { APIRoute } from 'astro';
import { getCaseStudies } from '../lib/content';
import { url } from '../lib/url';

/** Public pages only (no /styleguide, no 404). */
export const GET: APIRoute = async ({ site }) => {
  const projects = await getCaseStudies();
  const paths = ['/', ...projects.map((p) => `/work/${p.id}/`)];
  const entries = paths
    .map((path) => `  <url><loc>${new URL(url(path), site).href}</loc></url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
