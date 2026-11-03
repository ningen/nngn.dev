/** 日付を「2026年11月3日」形式にする */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** <time datetime> 属性用の ISO 表記 */
export function formatISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}
