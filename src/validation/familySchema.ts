import z from "zod";

export const familySchema = z.object({
  name: z.string().min(1, "Имя семьи обязательно"),
  kittens: z.array(z.string()).min(1, "минимум 1 котенок"),
  mom: z.string(),
  dad: z.string(),
  displayOrder: z.number(),
});

export const updateFamilySchema = z.object({
  name: z.string().min(1, "Имя семьи обязательно"),
  displayOrder: z.number(),
  mom: z.string(),
  dad: z.string(),
  kittensIds: z.array(z.string()).min(1, "минимум 1 котенок"),
});

export type UpdateFamilyFormValues = z.infer<typeof updateFamilySchema>;

export type FamilyFormValues = z.infer<typeof familySchema>;
