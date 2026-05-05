import { z } from "zod";

export enum KittenStatus {
  OFFLINE = "offline",
  ACTIVE = "active",
  BOOKED = "booked",
  OUT = "out",
}

const Sex = {
  MALE: "male",
  FEMALE: "female",
};

export const kittenSchema = z.object({
  nameUa: z.string().min(1, "Имя (UA) обязательно"),
  nameEn: z.string().min(1, "Имя (EN) обязательно"),
  color: z.string().min(1, "Цвет обязателен"),
  birthDay: z.string().nonempty("Дата рождения обязательна"),
  breed: z.string().min(1, "Порода обязательна"),
  sex: z.enum(Sex, "rrtt"),

  breeding: z.string(),
  pet: z.string(),

  images: z
    .array(z.any())
    .min(1, "Добавьте хотя бы одно фото")
    .max(5, "Максимум 5 фотографий"),
});

export const updateKittenSchema = z.object({
  nameUa: z.string().min(1, "Имя (UA) обязательно"),
  nameEn: z.string().min(1, "Имя (EN) обязательно"),
  color: z.string().min(1, "Цвет обязателен"),
  birthDay: z.string().nonempty("Дата рождения обязательна"),
  breed: z.string().min(1, "Порода обязательна"),
  sex: z.enum(Sex, "rrtt"),

  breeding: z.string(),
  pet: z.string(),

  retainedImages: z.array(z.string()), // URLs of images to keep
  newImages: z.array(z.any()).max(5, "Максимум 5 новых фотографий"), // New files
});

export type UpdateKittenFormValues = z.infer<typeof updateKittenSchema>;
export type KittenFormValues = z.infer<typeof kittenSchema>;
