/*
 * Склонение слов «родитель» и «семья» по числу — для подписей под таблицами
 * вида «Показано 3 из 12 родителей».
 */
const rules = new Intl.PluralRules("ru-RU");

export const getPluralParents = (count: number): string => {
  switch (rules.select(count)) {
    case "one":
      return "родитель";
    case "few":
      return "родителя";
    default:
      return "родителей";
  }
};

export const getPluralFamilies = (count: number): string => {
  switch (rules.select(count)) {
    case "one":
      return "семья";
    case "few":
      return "семьи";
    default:
      return "семей";
  }
};
