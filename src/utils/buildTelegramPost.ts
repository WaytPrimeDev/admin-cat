import type { Kitten } from "../types";
import { numberToEmoji } from "./numberToEmoji";

const formatBirthDay = (birthDay: string) => {
  if (!birthDay) return "Уточнюйте";
  const date = new Date(birthDay);
  if (Number.isNaN(date.getTime())) return birthDay;
  return date.toLocaleDateString("uk-UA");
};

// Стандартный текст поста для Telegram
export const buildTelegramPost = (kitten: Kitten): string => {
  const isMale = kitten.sex === "male";
  const petPrice = kitten.price?.pet;
  const emojiPrice =
    petPrice !== null && petPrice !== undefined && Number(petPrice) > 0
      ? `${numberToEmoji(petPrice)} $`
      : "Уточнюйте";

  return `
🐾 **Дуже ${isMale ? "Цікавий котик" : "Цікава кошечка"} ${kitten.nameUa} у ${kitten.color} забарвленні**

💞 ${kitten.nameEn} (${kitten.nameUa}) - ${formatBirthDay(kitten.birthDay)}, ${
    isMale ? "♂ Котик" : "♀ Кошечка"
  }

🏢 Порода: ${kitten.breed}

🎨 Забарвлення: ${kitten.color}

💰 Ціна в домашні улюбленці: ${emojiPrice}
`.trim();
};
