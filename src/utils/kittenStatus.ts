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

export const kittenStatusLabel = (
  status: string | null | undefined,
  fallback = "Статус не указан",
): string => {
  if (!status) return fallback;
  const key = status.toLowerCase() as KittenStatus;
  return KITTEN_STATUS_LABELS[key] ?? status;
};

export default kittenStatusLabel;
