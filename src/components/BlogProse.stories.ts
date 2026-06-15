import BlogProse from "./BlogProse.astro";

export default {
  title: "Blog/BlogProse",
  component: BlogProse,
};

export const Default = {
  args: {
    headings: [
      { depth: 2, slug: "markdown-body", text: "Markdown body" },
      { depth: 3, slug: "code-blocks", text: "Code blocks" },
    ],
    slots: {
      default: `
        <h2>Markdown body</h2>
        <p>This wrapper holds rendered markdown. It keeps measure narrow, line-height loose, and code blocks readable.</p>
        <h3>Code blocks</h3>
        <p>Inline <code>code</code> should sit quietly inside a sentence.</p>
        <blockquote><p>Blockquotes use a single rule and muted text.</p></blockquote>
        <pre><code>export const site = "nngn.dev";</code></pre>
      `,
    },
  },
};
