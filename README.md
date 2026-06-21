# cueva.io

Personal website for Anthony Cueva. The site is a dark, single-column Next.js app that collects writing, product links, and profile information in one place.

## What It Includes

- Home page with a combined post feed from Substack RSS and manually curated project links.
- About page rendered from Markdown.
- Site-wide metadata, Open Graph/Twitter cards, icons, and JSON-LD structured data.
- Shader background, grain overlay, and a minimal navigation/footer shell.
- `/betterwriter` redirect to the BetterWriter TestFlight link.
- Vercel Analytics and the Collecty widget script.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Biome for formatting and linting
- Bun for package scripts

## Getting Started

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
bun run dev      # Start the local dev server
bun run build    # Create a production build
bun run start    # Start the production server
bun run check    # Run Biome checks
bun run lint     # Alias for Biome checks
bun run format   # Format files with Biome
```

## Project Structure

```text
app/
  layout.tsx          Root metadata, fonts, analytics, scripts
  page.tsx            Home page and post feed
  about/
    page.tsx          About route
    about.md          Markdown source for the About page
components/
  about/              Markdown rendering components
  posts/              Post list UI
  ui/                 Shared primitives
data/
  posts.json          Manual post/project entries
lib/
  posts.ts            RSS + local post merging
  site.ts             Site metadata and social links
public/               Icons and static assets
```

## Content Editing

### Manual Posts

Add curated links in `data/posts.json`:

```json
{
	"date": "2026-04-13",
	"title": "Peruvian Elections 2026 Bot",
	"link": "https://elecciones.cueva.io/",
	"description": "A focused bot for following Peru's 2026 election process."
}
```

Manual posts are merged with the Substack feed in `lib/posts.ts`, then sorted by date descending. The home page is revalidated once per day.

### Substack Feed

RSS posts are fetched from:

```text
https://cuevaio.substack.com/feed
```

Update `FEED_URL` in `lib/posts.ts` if the feed changes.

### About Page

Edit `app/about/about.md`. Markdown imports are enabled in `next.config.mjs` through `raw-loader` and an asset/source webpack rule.

### Site Metadata

Update canonical site details, social links, and default descriptions in `lib/site.ts`. Route-specific metadata lives next to each page.

## Deployment

The app is designed for Vercel. Before deploying a route or config change, run:

```bash
bun run check
bun run build
```

Notes:

- `next.config.mjs` currently sets `typescript.ignoreBuildErrors = true`, so a successful build does not guarantee type safety.
- `images.unoptimized = true`, so do not rely on Next Image Optimization.
- Tailwind is configured through CSS and PostCSS; there is no `tailwind.config.*` file.

## Maintenance Notes

- Preserve the existing visual direction unless intentionally redesigning: dark canvas, Space Grotesk typography, shader background, grain overlays, and subtle rounded hover states.
- `components/shader-background.tsx` and `components/about/about-content.tsx` are client components.
- `app/layout.tsx` is the source of truth for global scripts, fonts, metadata, and texture layers.
