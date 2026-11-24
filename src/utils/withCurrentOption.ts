import type { ColorRef } from "../types";

// Если значение удалили из справочника, оно всё равно должно остаться выбираемым,
// иначе <select> молча покажет пустое значение и форма не пройдёт валидацию.
// Сравниваем по _id: с переходом на справочники в формах лежит id, а не название
export const withCurrentOption = <T extends ColorRef>(
  options: T[],
  current: T | null | undefined,
): T[] =>
  current && !options.some((option) => option._id === current._id)
    ? [current, ...options]
    : options;
