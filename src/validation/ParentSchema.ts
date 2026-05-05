import z from "zod";

const Sex = {
  MALE: "male",
  FEMALE: "female",
};

export const parentSchema = z.object({
  nameUa: z.string().min(1, "Имя (UA) обязательно"),
  nameEn: z.string().min(1, "Имя (EN) обязательно"),
  color: z.string().min(1, "Цвет обязателен"),
  breed: z.string().min(1, "Порода обязательна"),
  sex: z.enum(Sex, "rrtt"),

  images: z
    .array(z.any())
    .min(1, "Добавьте хотя бы одно фото")
    .max(5, "Максимум 5 фотографий"),
});

export const updateParentSchema = z.object({
  nameUa: z.string().min(1, "Имя (UA) обязательно"),
  nameEn: z.string().min(1, "Имя (EN) обязательно"),
  color: z.string().min(1, "Цвет обязателен"),
  breed: z.string().min(1, "Порода обязательна"),
  sex: z.enum(Sex, "rrtt"),

  retainedImages: z.array(z.string()), // URLs of images to keep
  newImages: z.array(z.any()).max(5, "Максимум 5 новых фотографий"), // New files
});

export type UpdateParentFormValues = z.infer<typeof updateParentSchema>;
export type ParentFormValues = z.infer<typeof parentSchema>;
