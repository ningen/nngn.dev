import SectionHeading from "./SectionHeading.astro";

export default {
  title: "Layout/SectionHeading",
  component: SectionHeading,
};

export const Default = {
  args: {
    label: "Archive",
    title: "4 posts",
  },
};

export const WithAction = {
  args: {
    label: "Writing",
    title: "Latest notes",
    href: "/blog/",
    action: "View all",
  },
};
