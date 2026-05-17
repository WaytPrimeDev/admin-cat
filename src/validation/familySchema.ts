import { z } from "zod";

// Схема создания
export const familySchema = z.object({
  name: z.string().min(1, "Имя семьи обязательно"),
  breed: z.string().min(1, "Порода обязательна"),

  // Принимаем строку, массив строк, null или undefined
  kittens: z
    .union([z.string(), z.array(z.string()), z.undefined(), z.null()])
    // Трансформируем всё это в массив строк
    .transform((val) => {
      if (!val) return [];
      if (typeof val === "string") return [val];
      return val;
    })
    // Проверяем, что в массиве есть хотя бы 1 элемент
    .pipe(z.array(z.string()).min(1, "минимум 1 котенок")),

  mom: z.string().optional().nullable(),
  dad: z.string().optional().nullable(),
});

// Схема обновления
export const updateFamilySchema = z.object({
  name: z.string().min(1, "Имя семьи обязательно"),
  breed: z.string().min(1, "Порода обязательна"),
  displayOrder: z.number().optional(),

  kittensIds: z
    .union([z.string(), z.array(z.string()), z.undefined(), z.null()])
    .transform((val) => {
      if (!val) return [];
      if (typeof val === "string") return [val];
      return val;
    })
    .pipe(z.array(z.string()).min(1, "минимум 1 котенок")),

  mom: z.string().optional().nullable(),
  dad: z.string().optional().nullable(),
});

// ТИПЫ ДЛЯ REACT HOOK FORM (ВХОДНЫЕ ДАННЫЕ)
// z.input дает нам типы ДО трансформации (где kittens может быть строкой)
export type FamilyFormInput = z.input<typeof familySchema>;
export type UpdateFamilyFormInput = z.input<typeof updateFamilySchema>;

// ТИПЫ ДЛЯ ОТПРАВКИ НА СЕРВЕР (ВЫХОДНЫЕ ДАННЫЕ)
// z.infer дает нам типы ПОСЛЕ трансформации (где kittens строго string[])
export type FamilyFormValues = z.infer<typeof familySchema>;
export type UpdateFamilyFormValues = z.infer<typeof updateFamilySchema>;
