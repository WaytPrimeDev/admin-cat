import type { KittenStatus } from "../types";

/*
 * Статус котёнка бэкенд хранит как offline | active | booked | out.
 * Это значение нигде не показываем админу напрямую — только через
 * kittenStatusLabel, иначе в интерфейсе появляется английское слово.
 */
export const KITTEN_STATUS_LABELS: Record<KittenStatus, string> = {
  offline: "Скрыт",
  active: "В продаже",
  booked: "Забронирован",
  out: "Уехал",
};

// Подписи для выпадающих списков: рядом с русским держим исходный код,
// чтобы админ узнавал статус в выгрузках и в ответах бэкенда
export const KITTEN_STATUS_OPTION_LABELS: Record<KittenStatus, string> = {
  offline: "Скрыт (offline)",
  active: "В продаже (active)",
  booked: "Забронирован (booked)",
  out: "Уехал (out)",
};

/*
 * Подписи для таблицы всех котят. Там статус стоит рядом с колонкой «Семья»,
 * и offline на практике значит одно: котёнка ещё не включили в помёт, поэтому
 * на сайте его нет. Формулировки короче модальных ради узкой колонки.
 */
export const KITTEN_STATUS_TABLE_LABELS: Record<KittenStatus, string> = {
  offline: "БЕЗ СЕМЬИ",
  active: "В СЕМЬЕ",
  booked: "ЗАБРОНИРОВАН",
  out: "ПРОДАН",
};

/*
 * Порядок статусов: от «ещё не в продаже» к «уже уехал». По нему таблица
 * сортируется, чтобы котята выстраивались по ходу сделки, а не по алфавиту.
 */
export const KITTEN_STATUS_ORDER: Record<KittenStatus, number> = {
  offline: 0,
  active: 1,
  booked: 2,
  out: 3,
};

/** Приводит статус к одному из четырёх ключей; неизвестный считаем offline. */
export const kittenStatusKey = (
  status: string | null | undefined,
): KittenStatus => {
  const key = status?.toLowerCase() as KittenStatus | undefined;
  return key && key in KITTEN_STATUS_LABELS ? key : "offline";
};

export const kittenStatusLabel = (
  status: string | null | undefined,
  fallback = "Статус не указан",
): string => {
  if (!status) return fallback;
  const key = status.toLowerCase() as KittenStatus;
  return KITTEN_STATUS_LABELS[key] ?? status;
};

export default kittenStatusLabel;
