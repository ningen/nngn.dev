export function toTagPath(tag: string) {
  return `/blog/tags/${encodeURIComponent(tag)}/`;
}

export function sortTags(tags: readonly string[]) {
  return [...tags].sort((a, b) => a.localeCompare(b, "en"));
}

export function uniqueTags(entries: readonly { data: { tags: readonly string[] } }[]) {
  return sortTags([...new Set(entries.flatMap((entry) => entry.data.tags))]);
}
