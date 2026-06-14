import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook-astro/framework";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  staticDirs: ["../public"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook-astro/framework",
    options: {
      renderMode: "static",
    },
  },
  async viteFinal(config) {
    config.plugins = config.plugins ?? [];
    config.plugins.push(tailwindcss());
    config.server = {
      ...config.server,
      hmr: false,
    };
    return config;
  },
};

export default config;
