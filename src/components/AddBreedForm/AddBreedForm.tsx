import { useEffect, useMemo, useState } from "react";

import styles from "./AddBreedForm.module.css";
import { useAppDispatch } from "../../store";
import { addBreed } from "../../store/slices/filterSlice";
import SlugField from "../SlugField/SlugField";
import { IMAGE_ACCEPT, validateBreedImage } from "../../utils/breedImage";

interface AddBreedFormProps {
  onClose: () => void;
}

const AddBreedForm = ({ onClose }: AddBreedFormProps) => {
  const dispatch = useAppDispatch();
  const [nameUa, setNameUa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameLang3, setNameLang3] = useState("");
  const [nameLang4, setNameLang4] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
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

  const isValid = Boolean(nameUa.trim() && nameEn.trim() && image);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError("Фото породы обязательно");
      return;
    }
    if (!isValid) return;

    const formData = new FormData();
    formData.append("nameUa", nameUa.trim());
    formData.append("nameEn", nameEn.trim());
    if (nameLang3.trim()) formData.append("nameLang3", nameLang3.trim());
    if (nameLang4.trim()) formData.append("nameLang4", nameLang4.trim());
    // Пустое поле в запрос не кладём — бэкенд соберёт слаг из nameEn
    if (slug.trim()) formData.append("slug", slug.trim());
    formData.append("image", image);

    setIsSaving(true);
    setError(null);
    try {
      await dispatch(addBreed(formData)).unwrap();
      onClose();
    } catch (err) {
      setError(typeof err === "string" ? err : "Не удалось добавить породу");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Новая порода"
      >
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Новая порода</h2>
            <p className={styles.subtitle}>
              Названия на двух языках и одно фото породы
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <form className={styles.body} onSubmit={handleSubmit}>
          <div className={styles.gridRow}>
            <div className={styles.field}>
              <label htmlFor="new-breed-ua">
                Назва (UA) <span className={styles.required}>*</span>
              </label>
              <input
                id="new-breed-ua"
                className={styles.input}
                value={nameUa}
                onChange={(e) => setNameUa(e.target.value)}
                placeholder="напр., мейн-кун"
                disabled={isSaving}
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="new-breed-en">
                Name (EN) <span className={styles.required}>*</span>
              </label>
              <input
                id="new-breed-en"
                className={styles.input}
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g., Maine Coon"
                disabled={isSaving}
              />
            </div>
          </div>

          <SlugField
            id="add-breed-slug"
            kind="breeds"
            mode="create"
            value={slug}
            sourceName={nameEn}
            onChange={setSlug}
            disabled={isSaving}
          />

          <details className={styles.extra}>
            <summary>Другие языки (необязательно)</summary>
            <div className={styles.gridRow}>
              <div className={styles.field}>
                <label htmlFor="new-breed-lang3">Язык 3</label>
                <input
                  id="new-breed-lang3"
                  className={styles.input}
                  value={nameLang3}
                  onChange={(e) => setNameLang3(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="new-breed-lang4">Язык 4</label>
                <input
                  id="new-breed-lang4"
                  className={styles.input}
                  value={nameLang4}
                  onChange={(e) => setNameLang4(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>
          </details>

          <div className={styles.field}>
            <label>
              Фото породы <span className={styles.required}>*</span>
            </label>
            <input
              type="file"
              accept={IMAGE_ACCEPT}
              className={styles.fileInput}
              onChange={handleFileChange}
              disabled={isSaving}
            />
            <p className={styles.hint}>
              Один файл, до 10 МБ: jpg, jpeg, png, webp или gif
            </p>

            {preview && (
              <div className={styles.previewBox}>
                <img src={preview} alt="" className={styles.preview} />
                <div className={styles.previewMeta}>
                  <span className={styles.fileName}>{image?.name}</span>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => setImage(null)}
                    disabled={isSaving}
                  >
                    Убрать
                  </button>
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
              disabled={isSaving || !isValid}
            >
              {isSaving ? "Сохраняем..." : "Сохранить породу"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBreedForm;
