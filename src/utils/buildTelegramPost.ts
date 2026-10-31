import type { Kitten } from "../types";
import { numberToEmoji } from "./numberToEmoji";

const formatBirthDay = (birthDay: string) => {
  if (!birthDay) return "Уточнюйте";
  const date = new Date(birthDay);
  if (Number.isNaN(date.getTime())) return birthDay;
  return date.toLocaleDateString("uk-UA");
};

const hasPrice = (price: number | string | null | undefined): price is number | string =>
  price !== null && price !== undefined && Number(price) > 0;

// Стандартный текст поста для Telegram
export const buildTelegramPost = (kitten: Kitten): string => {
  const isMale = kitten.sex === "male";
  const petPrice = kitten.price?.pet;
  const petPriceBreeding = kitten.price?.breeding;

  const priceLines: string[] = [];
  if (hasPrice(petPrice)) {
    priceLines.push(
      `💰 Ціна в домашні улюбленці: ${numberToEmoji(petPrice)} $`
    );
  }
  if (hasPrice(petPriceBreeding)) {
    priceLines.push(
      `💰 Ціна для розведення: ${numberToEmoji(petPriceBreeding)} $`
    );
  }
  if (priceLines.length === 0) {
    priceLines.push("💰 Ціна: Уточнюйте");
  }

  return `
🐾 **Дуже ${isMale ? "Цікавий котик" : "Цікава кошечка"} ${kitten.nameUa} у ${kitten.color} забарвленні**

💞 ${kitten.nameEn} (${kitten.nameUa}) - ${formatBirthDay(kitten.birthDay)}, ${
    isMale ? "♂ Котик" : "♀ Кошечка"
  }

🏢 Порода: ${kitten.breed}

🎨 Забарвлення: ${kitten.color}

${priceLines.join("\n\n")}
`.trim();
};
