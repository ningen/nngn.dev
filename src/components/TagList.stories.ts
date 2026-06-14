import TagList from "./TagList.astro";

export default {
  title: "Blog/TagList",
  component: TagList,
};

export const Linked = {
  args: {
    tags: ["astro", "cloudflare", "storybook", "markdown"],
    linked: true,
  },
};

export const Compact = {
  args: {
    tags: ["note", "build"],
    linked: true,
    compact: true,
  },
};
