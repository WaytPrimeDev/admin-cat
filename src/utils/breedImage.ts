// Бэкенд принимает ровно один файл до 10 МБ в поле image
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(",");

/*
 * Общая проверка файла для форм породы: возвращает текст ошибки
 * либо null, если файл подходит.
 */
export const validateBreedImage = (file: File): string | null => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Фото должно быть jpg, jpeg, png, webp или gif";
  }
  if (file.size > MAX_IMAGE_BYTES) return "Фото больше 10 МБ";
  return null;
};
