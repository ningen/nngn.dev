import BlogCard from "./BlogCard.astro";

export default {
  title: "Blog/BlogCard",
  component: BlogCard,
};

export const Default = {
  args: {
    title: "nngn.dev starts here",
    description: "A compact post card for markdown entries with date, reading time, and linked tags.",
    href: "/blog/hello-astro/",
    date: "Jun 14, 2026",
    dateTime: "2026-06-14",
    readingTime: "2 min read",
    tags: ["astro", "cloudflare", "note"],
  },
};

export const LongerTitle = {
  args: {
    ...Default.args,
    title: "Keeping a developer site useful without turning it into a product landing page",
    description: "A slightly longer summary to check card height, wrapping, and scan behavior.",
    tags: ["design", "writing"],
  },
};
