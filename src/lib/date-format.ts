export function formatLocaleDate(value: Date | string | null | undefined, language = "zh") {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString(language.startsWith("zh") ? "zh-TW" : "en-US");
}

export function isSameMonthYear(value: Date | string | null | undefined, target = new Date()) {
  if (!value) return false;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  return date.getMonth() === target.getMonth() && date.getFullYear() === target.getFullYear();
}
