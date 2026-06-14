import BlogArticleHeader from "./BlogArticleHeader.astro";

export default {
  title: "Blog/BlogArticleHeader",
  component: BlogArticleHeader,
};

export const Default = {
  args: {
    title: "nngn.dev starts here",
    description: "A restrained article header with tags and static metadata.",
    date: "Jun 14, 2026",
    dateTime: "2026-06-14",
    readingTime: "2 min read",
    tags: ["astro", "cloudflare", "note"],
  },
};

export const Updated = {
  args: {
    ...Default.args,
    updatedAt: "Jun 15, 2026",
    updatedAtTime: "2026-06-15",
  },
};
