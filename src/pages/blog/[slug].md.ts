import { getCollection } from "astro:content";
import type { APIRoute, GetStaticPaths } from "astro";
import { isPublishedPost } from "../../lib/blog";

const markdownFiles = import.meta.glob<string>("../../content/blog/**/*.{md,mdx}", {
  eager: true,
  import: "default",
  query: "?raw",
});

function getMarkdownSource(postId: string) {
  const entry = Object.entries(markdownFiles).find(([path]) => {
    const id = path.replace("../../content/blog/", "").replace(/\.(md|mdx)$/u, "");
    return id === postId;
  });

  return entry?.[1];
}

export const getStaticPaths = (async () => {
  const posts = (await getCollection("blog")).filter(isPublishedPost);

  return posts.map((post) => {
    const markdown = getMarkdownSource(post.id);

    if (!markdown) {
      throw new Error(`Markdown source was not found for blog post: ${post.id}`);
    }

    return {
      params: { slug: post.id },
      props: { markdown },
    };
  });
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(String(props.markdown), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
