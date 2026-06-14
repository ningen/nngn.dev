import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

export function isPublishedPost(post: BlogPost) {
  return !post.data.draft;
}

export function sortPosts(posts: readonly BlogPost[]) {
  return [...posts].sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
}

export function getPostUrl(post: Pick<BlogPost, "id">) {
  return `/blog/${post.id}/`;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function formatDateTime(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function estimateReadingMinutes(body: string | undefined) {
  const words = (body ?? "").trim().split(/\s+/u).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
}
