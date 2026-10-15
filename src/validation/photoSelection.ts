import { z } from "zod";

export const MAX_PHOTOS = 5;

// Общая часть схем редактирования котёнка и родителя.
// Порядок важен: первое фото итога станет главным.
export const photoSelectionShape = {
  retainedImages: z.array(z.string()), // full-URL старых фото, которые остаются
  newImages: z.array(z.instanceof(File)), // новые файлы, встанут после старых
};

export const refinePhotoCount = (
  values: { retainedImages: string[]; newImages: File[] },
  context: z.RefinementCtx,
) => {
  const total = values.retainedImages.length + values.newImages.length;
  if (total < 1) {
    context.addIssue({
      code: "custom",
      path: ["newImages"],
      message: "Добавьте хотя бы одно фото",
    });
  }
  if (total > MAX_PHOTOS) {
    context.addIssue({
      code: "custom",
      path: ["newImages"],
      message: `Максимум ${MAX_PHOTOS} фотографий`,
    });
  }
};
