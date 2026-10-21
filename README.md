# Shekhar Tyagi · Portfolio

Personal CV site for a Technical Data Consultant (ETL on SAP HANA, SAP SuccessFactors data migration).
The site is told as a data pipeline: **source → transform → target**.

Built with [Astro](https://astro.build) and Tailwind CSS v4 as a fully static site, with a lazy-loaded three.js hero.

## Run it locally

```powershell
npm install
npm run dev        # http://localhost:4321/my-portfolio/
```

| Command           | What it does                                     |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Dev server with live reload                      |
| `npm run build`   | Production build into `dist/`                    |
| `npm run preview` | Serve the production build locally               |
| `npm run check`   | Type-check (also validates all content files)    |
| `npm run lint`    | ESLint                                           |
| `npm run format`  | Prettier                                         |
| `npm run og`      | Regenerate social share images into `public/og/` |

## Updating content

All text lives in `src/content/`. Components never hard-code it, so most updates are a single file edit.
The schemas in `src/content.config.ts` check every file at build time, so a typo in a date or a missing field fails the build instead of going live.

| To change…                                   | Edit                                                |
| -------------------------------------------- | --------------------------------------------------- |
| Name, headline, bio, links, "Currently" chip | `src/content/profile.json`                          |
| A role or client engagement                  | `src/content/experience/<entry>.md`                 |
| A case study                                 | `src/content/projects/<slug>.md`                    |
| Skills and proficiency                       | `src/content/skills.json`                           |
| Education / certifications                   | `src/content/education.json`, `certifications.json` |
| Headshot                                     | `src/assets/headshot.jpg`                           |
| Downloadable CV                              | `public/cv/Shekhar-Tyagi-CV.pdf`                    |

New experience entries and case studies appear everywhere automatically: the timeline, the flowgraph, the case study pages, the command palette and the sitemap.

After changing names, titles or case-study metrics, run `npm run og` to refresh the share images.

**Privacy rules:** no email address or phone number anywhere (copy, PDFs, metadata), and clients are described, never named. See `CLAUDE.md`.

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`, which type-checks, lints, builds and publishes to GitHub Pages at `https://shekhar002.github.io/my-portfolio/`.

GitHub Pages on a free account needs a **public** repository. In the repo settings, set **Pages → Source** to **GitHub Actions**.

**Custom domain later:** set `site` to the new domain in `astro.config.mjs`, remove `base`, update `BASE` in `scripts/og-images.mjs`, re-run `npm run og`, and add the domain under **Settings → Pages**.

## Easter egg

Press <kbd>/</kbd> on the site.
