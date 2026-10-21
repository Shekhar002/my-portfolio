import type { APIRoute } from 'astro';
import { url } from '../lib/url';

export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *
Allow: /
Disallow: ${url('/styleguide/')}

Sitemap: ${new URL(url('/sitemap.xml'), site).href}
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
