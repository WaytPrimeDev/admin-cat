import quotesData from "../cat_quotes.json";

// Описываем интерфейс, чтобы TypeScript понимал структуру объекта
export interface CatQuote {
  id: number;
  text: string;
  author: string;
}

// Убеждаемся, что TypeScript понимает импортированный JSON как массив CatQuote
const quotes: CatQuote[] = quotesData as CatQuote[];

/**
 * Функция возвращает одну случайную цитату из массива
 */
export const getRandomQuote = (): CatQuote => {
  // Проверка на случай пустого файла
  if (!quotes || quotes.length === 0) {
    return {
      id: 0,
      text: "Мяу.",
      author: "Неизвестный кот",
    };
  }

  // Генерируем случайный индекс от 0 до длины массива - 1
  const randomIndex = Math.floor(Math.random() * quotes.length);

  // Возвращаем цитату по этому индексу
  return quotes[randomIndex];
};
