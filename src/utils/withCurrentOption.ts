interface Option {
  _id: string;
  name: string;
}

// Если значение удалили из справочника, оно всё равно должно остаться выбираемым,
// иначе <select> молча покажет пустое значение и форма не пройдёт валидацию
export const withCurrentOption = (options: Option[], current: string) =>
  current && !options.some((option) => option.name === current)
    ? [{ _id: `current-${current}`, name: current }, ...options]
    : options;
