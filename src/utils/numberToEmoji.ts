const DIGIT_EMOJI = [
  "0️⃣",
  "1️⃣",
  "2️⃣",
  "3️⃣",
  "4️⃣",
  "5️⃣",
  "6️⃣",
  "7️⃣",
  "8️⃣",
  "9️⃣",
];

// Превращаем число в эмодзи-цифры: 1200 -> 1️⃣2️⃣0️⃣0️⃣
export const numberToEmoji = (value: number | string): string =>
  String(value)
    .split("")
    .map((char) => {
      const digit = Number(char);
      return Number.isNaN(digit) || char === " " ? char : DIGIT_EMOJI[digit];
    })
    .join("");
