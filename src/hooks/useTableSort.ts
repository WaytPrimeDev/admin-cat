import { useCallback, useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

export interface SortState<K extends string> {
  key: K;
  direction: SortDirection;
}

export type SortValue = string | number | null | undefined;

/*
 * Одинарная сортировка таблицы по одному полю.
 * Клик по заголовку: 1-й — по возрастанию (А→Я / от меньшего),
 * 2-й — по убыванию, 3-й — сброс к исходному порядку списка.
 * Пустые значения всегда уезжают в конец, независимо от направления.
 */
export const useTableSort = <T, K extends string>(
  items: T[],
  accessors: Record<K, (item: T) => SortValue>,
) => {
  const [sort, setSort] = useState<SortState<K> | null>(null);

  // Прямая установка поля и направления — для мобильной панели сортировки
  const applySort = useCallback(
    (key: K | null, direction: SortDirection = "asc") => {
      setSort(key ? { key, direction } : null);
    },
    [],
  );

  const toggleSort = useCallback((key: K) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  }, []);

  const sortedItems = useMemo(() => {
    if (!sort) return items;

    const accessor = accessors[sort.key];
    if (!accessor) return items;

    const factor = sort.direction === "asc" ? 1 : -1;
    const isEmpty = (value: SortValue) =>
      value === null || value === undefined || value === "";

    // Array.prototype.sort стабилен — строки с равными значениями
    // сохраняют исходный порядок
    return [...items].sort((a, b) => {
      const aValue = accessor(a);
      const bValue = accessor(b);

      if (isEmpty(aValue) && isEmpty(bValue)) return 0;
      if (isEmpty(aValue)) return 1;
      if (isEmpty(bValue)) return -1;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * factor;
      }

      return (
        String(aValue).localeCompare(String(bValue), "uk", {
          numeric: true,
          sensitivity: "base",
        }) * factor
      );
    });
  }, [items, sort, accessors]);

  const directionFor = useCallback(
    (key: K): SortDirection | null =>
      sort && sort.key === key ? sort.direction : null,
    [sort],
  );

  return { sortedItems, sort, toggleSort, applySort, directionFor };
};
