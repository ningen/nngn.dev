import BlogTableOfContents from "./BlogTableOfContents.astro";

export default {
  title: "Blog/BlogTableOfContents",
  component: BlogTableOfContents,
};

export const Default = {
  args: {
    headings: [
      { depth: 2, slug: "overview", text: "Overview" },
      { depth: 2, slug: "implementation", text: "Implementation" },
      { depth: 3, slug: "content-collection", text: "Content collection" },
      { depth: 3, slug: "static-routes", text: "Static routes" },
      { depth: 2, slug: "verification", text: "Verification" },
    ],
  },
};

export const Empty = {
  args: {
    headings: [],
  },
};
