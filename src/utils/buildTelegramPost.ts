import type { Kitten } from "../types";
import { numberToEmoji } from "./numberToEmoji";

const INSTAGRAM_URL = "https://www.instagram.com/natalya.turusheva_1";

// Телеграм рендерит пост с parse_mode: "HTML",
// поэтому всё, что пришло из данных, экранируем — иначе символы < > &
// в кличке или окрасе сломают разметку и Telegram вернёт 400
const escapeHtml = (value: string | null | undefined): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

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

  const nameUa = escapeHtml(kitten.nameUa);
  const nameEn = escapeHtml(kitten.nameEn);
  const color = escapeHtml(kitten.color);
  const breed = escapeHtml(kitten.breed);

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
🐾 <b>Дуже ${isMale ? "Цікавий котик" : "Цікава кошечка"} ${nameUa} у ${color} забарвленні</b>

💞 ${nameEn} (${nameUa}) - ${formatBirthDay(kitten.birthDay)}, ${
    isMale ? "♂ Котик" : "♀ Кошечка"
  }

🏢 Порода: ${breed}

🎨 Забарвлення: ${color}

${priceLines.join("\n\n")}
💌👀♥️
📸 <a href="${INSTAGRAM_URL}">Наш Instagram</a>
`.trim();
};
