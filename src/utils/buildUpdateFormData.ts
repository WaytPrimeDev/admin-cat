import type { UpdateKittenFormValues } from "../validation/kittenSchema";
import type { UpdateParentFormValues } from "../validation/ParentSchema";
import { splitPhotos, type PhotoItem } from "../validation/photoSelection";

/*
 * Собирают multipart-тела для PATCH /cats/kitten/:id и PATCH /cats/parent/:id.
 * Контракт бэкенда (arlenBack, validation/catSchemas.ts):
 * - файлы — в поле "images" (multer: upload.array("images", 5));
 * - retainedImages — JSON-строка массива full-URL старых фото, которые остаются;
 * - imagesOrder — JSON-строка итогового порядка: full-URL либо "new:<индекс файла>",
 *   благодаря ей новое фото может встать перед старыми;
 * - первое фото итога — главное.
 */

const appendPhotos = (formData: FormData, values: { photos: PhotoItem[] }) => {
  const { retainedImages, newImages, imagesOrder } = splitPhotos(values.photos);

  formData.append("retainedImages", JSON.stringify(retainedImages));
  newImages.forEach((file) => formData.append("images", file));
  formData.append("imagesOrder", JSON.stringify(imagesOrder));
};

export const buildUpdateKittenFormData = (
  values: UpdateKittenFormValues,
): FormData => {
  const formData = new FormData();

  formData.append("nameUa", values.nameUa);
  formData.append("nameEn", values.nameEn);
  formData.append("color", values.color);
  formData.append("breed", values.breed);
  formData.append("sex", values.sex);
  formData.append("status", values.status);
  formData.append("birthDay", values.birthDay); // YYYY-MM-DD из <input type="date">
  formData.append("breeding", values.breeding);
  formData.append("pet", values.pet);
  appendPhotos(formData, values);

  return formData;
};

export const buildUpdateParentFormData = (
  values: UpdateParentFormValues,
): FormData => {
  const formData = new FormData();

  formData.append("nameUa", values.nameUa);
  formData.append("nameEn", values.nameEn);
  formData.append("color", values.color);
  formData.append("breed", values.breed);
  formData.append("sex", values.sex);
  appendPhotos(formData, values);

  return formData;
};
