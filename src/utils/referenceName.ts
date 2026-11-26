import type { BreedRef, ColorRef } from "../types";

export const REFERENCE_FALLBACK = "—";

/*
 * Порода и окрас приходят объектами со всеми языками, а запись справочника
 * могли удалить из-под котёнка — тогда бэкенд присылает null.
 * Поэтому название везде берём через хелпер, а не через item.name.
 */
export const refNameUa = (
  ref: ColorRef | BreedRef | null | undefined,
  fallback: string = REFERENCE_FALLBACK,
): string => ref?.nameUa?.trim() || fallback;

export const refNameEn = (
  ref: ColorRef | BreedRef | null | undefined,
  fallback: string = REFERENCE_FALLBACK,
): string => ref?.nameEn?.trim() || fallback;

// В формы и фильтры уходит _id справочной записи
export const refId = (
  ref: ColorRef | BreedRef | null | undefined,
): string => ref?._id ?? "";

/*
 * Сортировка справочников по украинскому названию.
 * У части записей nameUa может отсутствовать (старые данные, битая запись),
 * поэтому название берём через refNameUa, а пустые уводим в конец.
 */
export const compareRefNameUa = (
  a: ColorRef | BreedRef | null | undefined,
  b: ColorRef | BreedRef | null | undefined,
): number => {
  const aName = refNameUa(a, "");
  const bName = refNameUa(b, "");
  if (!aName && !bName) return 0;
  if (!aName) return 1;
  if (!bName) return -1;
  return aName.localeCompare(bName, "uk", { numeric: true });
};
