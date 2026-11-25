/*
 * Видео котёнка не загружается на сервер: храним только videoId YouTube
 * (11 символов), плеер и превью собираем из него на фронте.
 * Парсер — копия бэкендового (arlenBack, utils/youtube.js): бэк всё равно
 * перепроверяет значение, здесь он нужен для превью и подсветки ошибки.
 */

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

// Ссылка вида /embed/<id>, /shorts/<id>, /live/<id>, /v/<id>
const PATH_ID = /^\/(?:embed|shorts|live|v)\/([^/?#]+)/;

/**
 * Достаёт videoId из любой формы ссылки YouTube либо из самого id.
 * Возвращает null, если это не YouTube (на чужой домен не ведёмся).
 */
export const parseYoutubeId = (input: string): string | null => {
  const raw = input.trim();
  if (!raw) return null;
  if (YOUTUBE_ID.test(raw)) return raw;

  // URL без схемы (админ скопировал "youtu.be/...") тоже разбираем
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./i, "").toLowerCase();

  let id = "";
  if (host === "youtu.be") {
    id = url.pathname.slice(1).split("/")[0];
  } else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    id = url.searchParams.get("v") ?? url.pathname.match(PATH_ID)?.[1] ?? "";
  }

  return YOUTUBE_ID.test(id) ? id : null;
};

/** Адрес для iframe-плеера. nocookie — чтобы не тянуть трекеры YouTube */
export const youtubeEmbedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0`;

/** Превью-кадр. Отдаётся без API-ключа */
export const youtubeThumb = (id: string) =>
  `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/** Обычная ссылка «смотреть на YouTube» — ею же заполняем инпут при редактировании */
export const youtubeWatchUrl = (id: string) =>
  `https://www.youtube.com/watch?v=${id}`;
