import "./preview.css";
import type { Preview } from "@storybook-astro/framework";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "site",
      values: [
        { name: "site", value: "#f8fafc" },
        { name: "white", value: "#ffffff" },
      ],
    },
  },
};

export default preview;
