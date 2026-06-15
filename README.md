# nngn.dev

Astro + Tailwind CSS site for `nngn.dev`.

## Stack

- Astro static build
- Tailwind CSS 4 via the Vite plugin
- Markdown blog entries through Astro content collections
- Storybook for isolated Astro component checks
- Cloudflare Pages deploy target
- Bun for package management and scripts

## Development

```sh
bun install
bun run dev
```

Astro will serve the site locally. Storybook is separate:

```sh
bun run storybook
```

Production builds include Storybook at `/storybook/`.

## Blog posts

Create a markdown file under `src/content/blog`.

```md
---
title: "Post title"
description: "Short summary for cards and metadata."
publishedAt: 2026-06-14
tags:
  - astro
  - note
draft: false
---

Write the post here.
```

`src/content/blog/example.md` becomes `/blog/example/`.

Set `draft: true` to keep a post out of static builds.

## Checks

```sh
bun run typecheck
bun run build
bun run build-storybook
```

## Cloudflare Pages

Use these build settings:

- Build command: `bun run build`
- Build output directory: `dist`
- Root directory: repository root

The build command writes the Astro site to `dist`, builds the Pagefind index, then writes static Storybook assets to `dist/storybook`.

Cloudflare Pages v3 includes Bun. If you want to pin the exact Bun version used locally, set the Pages build environment variable `BUN_VERSION=1.3.13`.

For direct upload deploys:

```sh
bun run deploy
```

For first-time setup with Wrangler:

```sh
bun run pages:create
```

For GitHub Actions auto deploys, add these repository secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

The API token needs Cloudflare Pages edit access. After that, pushes to `main` deploy `dist` to the `nngn-dev` Pages project.
