/**
 * Prefix a site-relative path with the configured `base` (e.g. `/my-portfolio`).
 * Always use this for internal links and files in `public/`, so the site works
 * both on GitHub Pages and on a future custom domain with no base.
 */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}
