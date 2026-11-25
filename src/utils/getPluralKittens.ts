/*
 * Склонение слова «котёнок» по числу. Возвращает только само слово —
 * число подставляет вызывающий код, чтобы его можно было отдельно
 * оформить (жирным, другим цветом).
 */
const rules = new Intl.PluralRules("ru-RU");

export const getPluralKittens = (count: number): string => {
  switch (rules.select(count)) {
    case "one":
      return "котёнок"; // 1, 21, 31...
    case "few":
      return "котёнка"; // 2, 3, 4...
    default:
      return "котят"; // 5, 6, 0, 11-14...
  }
};

export default getPluralKittens;
