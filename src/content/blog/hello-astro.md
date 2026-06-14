---
title: "nngn.dev starts here"
description: "A small Astro foundation for links, tagged markdown posts, Storybook components, and Cloudflare Pages."
publishedAt: 2026-06-14
tags:
  - astro
  - cloudflare
  - note
draft: false
---

This first note is mostly a smoke test for the publishing path.

Articles live in `src/content/blog`. Add a markdown file with frontmatter, and Astro turns it into a static page under `/blog/{slug}/`.

## Frontmatter

```yaml
---
title: "Post title"
description: "Short summary for cards and metadata."
publishedAt: 2026-06-14
tags:
  - astro
  - note
draft: false
---
```

Set `draft: true` when the file should stay out of production builds.
