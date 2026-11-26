import type { Family, Kitten } from "../types";

/**
 * Семья котёнка: сначала по его familyId, а если поля нет — по составу семьи.
 * Та же пара проверок, по которой таблица котят показывает название семьи:
 * связь записана с двух сторон и у части записей заполнена только с одной.
 */
export function findKittenFamily(
  families: Family[],
  kittenId: string,
  familyId?: string | null,
): Family | null {
  const byId = familyId ? families.find((f) => f._id === familyId) : undefined;
  return byId ?? families.find((f) => f.kittens?.includes(kittenId)) ?? null;
}

/**
 * Котята семьи, которые останутся после удаления `kittenId`.
 *
 * Считается по актуальному списку котят, а не по family.kittens: там могут
 * висеть id уже удалённых котят, и семья из одних таких id выглядела бы
 * непустой. Учитываются обе связи — и состав семьи, и familyId котёнка.
 */
export function remainingFamilyKittens(
  family: Family,
  kittens: Kitten[],
  kittenId: string,
): Kitten[] {
  return kittens.filter(
    (kitten) =>
      kitten._id !== kittenId &&
      (kitten.familyId === family._id || Boolean(family.kittens?.includes(kitten._id))),
  );
}

/** Семья, которая опустеет, если удалить этого котёнка; иначе null. */
export function familyEmptiedBy(
  families: Family[],
  kittens: Kitten[],
  kittenId: string,
  familyId?: string | null,
): Family | null {
  const family = findKittenFamily(families, kittenId, familyId);
  if (!family) return null;
  return remainingFamilyKittens(family, kittens, kittenId).length === 0 ? family : null;
}
