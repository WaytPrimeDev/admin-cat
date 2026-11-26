import z from "zod";
import { MAX_PHOTOS, photoSelectionShape } from "./photoSelection";

const Sex = {
  MALE: "male",
  FEMALE: "female",
};

export const parentSchema = z.object({
  nameUa: z.string().min(1, "Имя (UA) обязательно"),
  nameEn: z.string().min(1, "Имя (EN) обязательно"),
  // Пустой слаг бэкенд соберёт сам из nameEn — в запрос такое поле не кладём
  slug: z.string().optional(),
  color: z.string().min(1, "Выберите окрас"),
  breed: z.string().min(1, "Выберите породу"),
  sex: z.enum(Sex, "Выберите пол"),

  images: z
    .array(z.any())
    .min(1, "Добавьте хотя бы одно фото")
    .max(MAX_PHOTOS, `Максимум ${MAX_PHOTOS} фотографий`),
});

export const updateParentSchema = z.object({
  nameUa: z.string().trim().min(1, "Имя (UA) обязательно"),
  nameEn: z.string().trim().min(1, "Имя (EN) обязательно"),
  slug: z.string().optional(),
  color: z.string().min(1, "Выберите окрас"),
  breed: z.string().min(1, "Выберите породу"),
  sex: z.enum(Sex, "Выберите пол"),

  ...photoSelectionShape,
});

export type UpdateParentFormValues = z.infer<typeof updateParentSchema>;
export type ParentFormValues = z.infer<typeof parentSchema>;
