export const getPluralWeeks = (count: number) => {
    // Выбираем локаль (ru-RU или uk-UA)
    const rules = new Intl.PluralRules("ru-RU");
    const formation = rules.select(count);

    switch (formation) {
      case "one":
        return `${count} неделя`; // 1, 21, 31...
      case "few":
        return `${count} недели`; // 2, 3, 4...
      case "many":
        return `${count} недель`; // 5, 6, 0, 11-14...
      default:
        return `${count} недель`;
    }
  };