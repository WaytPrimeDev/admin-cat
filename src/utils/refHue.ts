/*
 * Устойчивый оттенок и монограмма для карточки справочника без фото
 * (окрасы). Один и тот же текст всегда даёт один и тот же цвет,
 * поэтому карточки не «перекрашиваются» между рендерами и сортировками.
 */

export const refHue = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  }
  return hash;
};

export const refMonogram = (name: string): string => {
  const letter = name.trim().charAt(0);
  return letter ? letter.toUpperCase() : "?";
};
