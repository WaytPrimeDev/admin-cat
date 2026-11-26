import type { BreedRef, ColorRef, UpdateReferenceRequest } from "../types";

export interface ReferenceFormValues {
  nameUa: string;
  nameEn: string;
  nameLang3: string;
  nameLang4: string;
}

/*
 * PATCH справочника принимает только изменённые поля: отсутствие ключа —
 * «не трогать», null — очистить необязательный язык. Пустой объект бэкенд
 * отклоняет с 400 «Нет полей для обновления», поэтому вызывающая форма
 * блокирует кнопку, когда здесь ничего не набралось.
 */
export const buildReferencePatch = (
  original: ColorRef | BreedRef,
  values: ReferenceFormValues,
): UpdateReferenceRequest => {
  const patch: UpdateReferenceRequest = {};

  const nameUa = values.nameUa.trim();
  const nameEn = values.nameEn.trim();
  if (nameUa !== (original.nameUa ?? "")) patch.nameUa = nameUa;
  if (nameEn !== (original.nameEn ?? "")) patch.nameEn = nameEn;

  // Необязательные языки: стёрли непустое значение — отправляем null
  const optional = [
    ["nameLang3", values.nameLang3, original.nameLang3] as const,
    ["nameLang4", values.nameLang4, original.nameLang4] as const,
  ];
  for (const [key, nextRaw, prevRaw] of optional) {
    const next = nextRaw.trim();
    const prev = prevRaw ?? "";
    if (next === prev) continue;
    patch[key] = next || null;
  }

  return patch;
};

export const referenceFormValues = (
  reference: ColorRef | BreedRef,
): ReferenceFormValues => ({
  nameUa: reference.nameUa ?? "",
  nameEn: reference.nameEn ?? "",
  nameLang3: reference.nameLang3 ?? "",
  nameLang4: reference.nameLang4 ?? "",
});
