import { useEffect, useMemo, useState } from "react";

import styles from "../AddBreedForm/AddBreedForm.module.css";
import { useAppDispatch } from "../../store";
import { updateBreed } from "../../store/slices/filterSlice";
import type { BreedRef } from "../../types";
import { IMAGE_ACCEPT, validateBreedImage } from "../../utils/breedImage";
import {
  buildReferencePatch,
  referenceFormValues,
} from "../../utils/referencePatch";
import { refNameUa } from "../../utils/referenceName";

interface EditBreedFormProps {
  breed: BreedRef;
  onClose: () => void;
}

/*
 * PATCH /filters/breed/:id. Фото меняется только если выбран новый файл:
 * тогда уходит FormData, иначе — JSON с изменёнными полями. Пустой
 * file-input к FormData не прикладываем вовсе.
 */
const EditBreedForm = ({ breed, onClose }: EditBreedFormProps) => {
  const dispatch = useAppDispatch();
  const initial = useMemo(() => referenceFormValues(breed), [breed]);

  const [nameUa, setNameUa] = useState(initial.nameUa);
  const [nameEn, setNameEn] = useState(initial.nameEn);
  const [nameLang3, setNameLang3] = useState(initial.nameLang3);
  const [nameLang4, setNameLang4] = useState(initial.nameLang4);
  // Слаг уже может быть в чужих ссылках, поэтому меняем его осознанно
  const [slug, setSlug] = useState(breed.slug ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const preview = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image],
  );

  // Освобождаем objectURL, иначе превью держит файл в памяти
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file) return;

    const fileError = validateBreedImage(file);
    if (fileError) {
      setError(fileError);
      return;
    }
    setError(null);
    setImage(file);
  };

  const patch = buildReferencePatch(breed, {
    nameUa,
    nameEn,
    nameLang3,
    nameLang4,
  });
  const slugChanged = slug.trim() !== (breed.slug ?? "");
  const namesFilled = Boolean(nameUa.trim() && nameEn.trim());
  const hasChanges = Object.keys(patch).length > 0 || slugChanged || !!image;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namesFilled) {
      setError("Названия UA и EN не могут быть пустыми");
      return;
    }
    if (!hasChanges) return;

    const fields: Record<string, string | null> = { ...patch };
    // Слаг отправляем только если его реально меняли
    if (slugChanged && slug.trim()) fields.slug = slug.trim();

    setIsSaving(true);
    setError(null);
    try {
      let payload: FormData | typeof patch;
      if (image) {
        const formData = new FormData();
        for (const [key, value] of Object.entries(fields)) {
          // null в multipart не передать — пустая строка очищает язык
          formData.append(key, value ?? "");
        }
        formData.append("image", image);
        payload = formData;
      } else {
        payload = { ...patch, ...(fields.slug ? { slug: fields.slug } : {}) };
      }

      const response = await dispatch(
        updateBreed({ id: breed._id, payload }),
      ).unwrap();
      // Бэкенд нормализует слаг и может вернуть не тот, что отправили
      setSlug(response.data.slug ?? "");
      onClose();
    } catch (err) {
      setError(typeof err === "string" ? err : "Не удалось изменить породу");
    } finally {
      setIsSaving(false);
    }
  };

  const currentPhoto = breed.image?.thumbnail || breed.image?.full || "";

  return (
    <div className={styles.overlay}>
      {/* Клик по фону модалку не закрывает — только кнопки внутри:
          случайным кликом не должны теряться введённые данные */}
      <div
        className={styles.modal}
        role="dialog"
        aria-label="Правка породы"
      >
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Правка породы</h2>
            <p className={styles.subtitle}>{refNameUa(breed)}</p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Закрыть"
            disabled={isSaving}
          >
            ✕
          </button>
        </div>

        <form className={styles.body} onSubmit={handleSubmit}>
          <div className={styles.gridRow}>
            <div className={styles.field}>
              <label htmlFor="edit-breed-ua">
                Название (UA) <span className={styles.required}>*</span>
              </label>
              <input
                id="edit-breed-ua"
                className={styles.input}
                value={nameUa}
                onChange={(e) => setNameUa(e.target.value)}
                disabled={isSaving}
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="edit-breed-en">
                Название (EN) <span className={styles.required}>*</span>
              </label>
              <input
                id="edit-breed-en"
                className={styles.input}
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="edit-breed-slug">Адрес на сайте (slug)</label>
            <input
              id="edit-breed-slug"
              className={styles.input}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="maine-coon"
              disabled={isSaving}
            />
            <p className={styles.hint}>
              Страница породы: /breeds/{slug.trim() || "<slug>"}. Изменение
              адреса ломает старые ссылки и поиск — меняйте только осознанно.
              Отправляется лишь при правке, бэкенд приводит к нижнему регистру и
              латинице.
            </p>
          </div>

          <details className={styles.extra}>
            <summary>Другие языки (необязательно)</summary>
            <div className={styles.gridRow}>
              <div className={styles.field}>
                <label htmlFor="edit-breed-lang3">Язык 3</label>
                <input
                  id="edit-breed-lang3"
                  className={styles.input}
                  value={nameLang3}
                  onChange={(e) => setNameLang3(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="edit-breed-lang4">Язык 4</label>
                <input
                  id="edit-breed-lang4"
                  className={styles.input}
                  value={nameLang4}
                  onChange={(e) => setNameLang4(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>
            <p className={styles.hint}>
              Пустое поле очистит язык, если он был заполнен.
            </p>
          </details>

          <div className={styles.field}>
            <label>Фото породы</label>
            <input
              type="file"
              accept={IMAGE_ACCEPT}
              className={styles.fileInput}
              onChange={handleFileChange}
              disabled={isSaving}
            />
            <p className={styles.hint}>
              Без выбора файла фото остаётся прежним. Новый файл заменит
              текущий: один файл до 10 МБ — jpg, jpeg, png, webp или gif.
            </p>

            {(preview || currentPhoto) && (
              <div className={styles.previewBox}>
                <img
                  src={preview || currentPhoto}
                  alt=""
                  className={styles.preview}
                />
                <div className={styles.previewMeta}>
                  <span className={styles.fileName}>
                    {image ? image.name : "Текущее фото"}
                  </span>
                  {image && (
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => setImage(null)}
                      disabled={isSaving}
                    >
                      Оставить прежнее
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSaving}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={isSaving || !hasChanges || !namesFilled}
            >
              {isSaving ? "Сохраняем..." : "Сохранить изменения"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBreedForm;
