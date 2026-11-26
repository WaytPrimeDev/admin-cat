/*
 * Слаг — второй ключ записи, только для публичных URL сайта.
 * Админка везде работает по _id, слаг нигде не обязателен.
 *
 * Бэкенд собирает слаг сам из nameEn (slugify, locale "uk") и нормализует
 * присланное значение, а при коллизии добавляет -2, -3. Поэтому здешний
 * slugify — это ТОЛЬКО превью для формы: итоговое значение всегда берём
 * из ответа сервера, оно может отличаться от введённого.
 */
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export type SlugKind = "kittens" | "parents" | "breeds";

// Базовый адрес публичного сайта. Переопределяется VITE_SITE_URL в .env
// (например, для стейджинга); по умолчанию — прод, чтобы скопированная
// ссылка всегда была абсолютной и открывалась из Telegram или письма.
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://koshenya.com"
).replace(/\/+$/, "");

export const sitePath = (kind: SlugKind, slug: string): string =>
  `/${kind}/${slug}`;

export const siteUrl = (kind: SlugKind, slug: string): string =>
  `${SITE_URL}${sitePath(kind, slug)}`;
