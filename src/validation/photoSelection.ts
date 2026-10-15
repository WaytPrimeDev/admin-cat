import { z } from "zod";

export const MAX_PHOTOS = 5;

// Токен нового файла в imagesOrder: индекс в массиве отправляемых файлов
export const NEW_PHOTO_TOKEN_PREFIX = "new:";

/**
 * Один упорядоченный список фото: и сохранённые, и только что выбранные.
 * Порядок списка = порядок фото на сайте, первое — главное.
 */
export const photoItemSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("retained"), url: z.string() }),
  z.object({ kind: z.literal("new"), file: z.instanceof(File) }),
]);

export type PhotoItem = z.infer<typeof photoItemSchema>;

// Общая часть схем редактирования котёнка и родителя
export const photoSelectionShape = {
  photos: z
    .array(photoItemSchema)
    .min(1, "Добавьте хотя бы одно фото")
    .max(MAX_PHOTOS, `Максимум ${MAX_PHOTOS} фотографий`),
};

export const photoId = (photo: PhotoItem) =>
  photo.kind === "retained"
    ? photo.url
    : `${photo.file.name}-${photo.file.size}-${photo.file.lastModified}`;

/**
 * Раскладывает список на поля запроса:
 * retainedImages — какие старые фото остаются, images — какие файлы загрузить,
 * imagesOrder — итоговый порядок (URL либо "new:<индекс файла>").
 */
export const splitPhotos = (photos: readonly PhotoItem[]) => {
  const retainedImages: string[] = [];
  const newImages: File[] = [];

  const imagesOrder = photos.map((photo) => {
    if (photo.kind === "retained") {
      retainedImages.push(photo.url);
      return photo.url;
    }
    newImages.push(photo.file);
    return `${NEW_PHOTO_TOKEN_PREFIX}${newImages.length - 1}`;
  });

  return { retainedImages, newImages, imagesOrder };
};
