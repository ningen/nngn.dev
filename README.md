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
