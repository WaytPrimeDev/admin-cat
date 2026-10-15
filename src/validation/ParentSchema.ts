import z from "zod";
import { photoSelectionShape } from "./photoSelection";

const Sex = {
  MALE: "male",
  FEMALE: "female",
};

export const parentSchema = z.object({
  nameUa: z.string().min(1, "Имя (UA) обязательно"),
  nameEn: z.string().min(1, "Имя (EN) обязательно"),
  color: z.string().min(1, "Цвет обязателен"),
  breed: z.string().min(1, "Порода обязательна"),
  sex: z.enum(Sex, "Выберите пол"),

  images: z
    .array(z.any())
    .min(1, "Добавьте хотя бы одно фото")
    .max(5, "Максимум 5 фотографий"),
});

export const updateParentSchema = z.object({
  nameUa: z.string().trim().min(1, "Имя (UA) обязательно"),
  nameEn: z.string().trim().min(1, "Имя (EN) обязательно"),
  color: z.string().min(1, "Цвет обязателен"),
  breed: z.string().min(1, "Порода обязательна"),
  sex: z.enum(Sex, "Выберите пол"),

  ...photoSelectionShape,
});

export type UpdateParentFormValues = z.infer<typeof updateParentSchema>;
export type ParentFormValues = z.infer<typeof parentSchema>;
