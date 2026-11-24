import { useEffect, useMemo, useState } from "react";

// Раскладка модалки общая с формой породы
import styles from "../AddBreedForm/AddBreedForm.module.css";
import { useAppDispatch } from "../../store";
import { addColor, updateColor } from "../../store/slices/filterSlice";
import type { AddColorRequest, ColorRef } from "../../types";
import {
  buildReferencePatch,
  referenceFormValues,
} from "../../utils/referencePatch";
import { refNameUa } from "../../utils/referenceName";

interface ColorFormModalProps {
  // null или отсутствует — создание нового окраса
  color?: ColorRef | null;
  onClose: () => void;
  // Созданный или изменённый окрас: формам котёнка/родителя нужно его выбрать
  onSaved?: (color: ColorRef) => void;
}

const EMPTY_VALUES = {
  nameUa: "",
  nameEn: "",
  nameLang3: "",
  nameLang4: "",
};

/*
 * Одна модалка на создание (POST /filters/color) и правку
 * (PATCH /filters/color/:id — только изменённые поля).
 * Слага у окраса нет: это фильтр, а не отдельная страница сайта.
 */
const ColorFormModal = ({ color, onClose, onSaved }: ColorFormModalProps) => {
  const dispatch = useAppDispatch();
  const isEdit = Boolean(color);
  const initial = useMemo(
    () => (color ? referenceFormValues(color) : EMPTY_VALUES),
    [color],
  );

  const [nameUa, setNameUa] = useState(initial.nameUa);
  const [nameEn, setNameEn] = useState(initial.nameEn);
  const [nameLang3, setNameLang3] = useState(initial.nameLang3);
  const [nameLang4, setNameLang4] = useState(initial.nameLang4);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Модалка открывается и поверх формы котёнка/родителя, поэтому
    // возвращаем прежнее значение, а не сбрасываем прокрутку целиком
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSaving) onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose, isSaving]);

  const patch = color
    ? buildReferencePatch(color, { nameUa, nameEn, nameLang3, nameLang4 })
    : {};
  const namesFilled = Boolean(nameUa.trim() && nameEn.trim());
  // При правке пустой PATCH бэкенд отклоняет — кнопка ждёт изменений
  const canSave = isEdit ? Object.keys(patch).length > 0 : namesFilled;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namesFilled) {
      setError("Названия UA и EN обязательны");
      return;
    }
    if (!canSave) return;

    setIsSaving(true);
    setError(null);
    try {
      if (color) {
        const response = await dispatch(
          updateColor({ id: color._id, payload: patch }),
        ).unwrap();
        onSaved?.(response.data);
      } else {
        const payload: AddColorRequest = {
          nameUa: nameUa.trim(),
          nameEn: nameEn.trim(),
        };
        if (nameLang3.trim()) payload.nameLang3 = nameLang3.trim();
        if (nameLang4.trim()) payload.nameLang4 = nameLang4.trim();

        const response = await dispatch(addColor(payload)).unwrap();
        onSaved?.(response.data);
      }
      onClose();
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : isEdit
            ? "Не удалось изменить окрас"
            : "Не удалось добавить окрас",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={isSaving ? undefined : onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={isEdit ? "Правка окраса" : "Новый окрас"}
      >
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              {isEdit ? "Правка окраса" : "Новый окрас"}
            </h2>
            <p className={styles.subtitle}>
              {isEdit
                ? refNameUa(color!)
                : "Названия для украинской и английской версий сайта"}
            </p>
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
              <label htmlFor="color-form-ua">
                Назва (UA) <span className={styles.required}>*</span>
              </label>
              <input
                id="color-form-ua"
                className={styles.input}
                value={nameUa}
                onChange={(e) => setNameUa(e.target.value)}
                placeholder="напр., блакитний"
                disabled={isSaving}
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="color-form-en">
                Name (EN) <span className={styles.required}>*</span>
              </label>
              <input
                id="color-form-en"
                className={styles.input}
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g., blue"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Языки 3 и 4 — задел под остальные версии сайта, по умолчанию скрыты */}
          <details className={styles.extra}>
            <summary>Другие языки (необязательно)</summary>
            <div className={styles.gridRow}>
              <div className={styles.field}>
                <label htmlFor="color-form-lang3">Язык 3</label>
                <input
                  id="color-form-lang3"
                  className={styles.input}
                  value={nameLang3}
                  onChange={(e) => setNameLang3(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="color-form-lang4">Язык 4</label>
                <input
                  id="color-form-lang4"
                  className={styles.input}
                  value={nameLang4}
                  onChange={(e) => setNameLang4(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>
            {isEdit && (
              <p className={styles.hint}>
                Пустое поле очистит язык, если он был заполнен.
              </p>
            )}
          </details>

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
              disabled={isSaving || !canSave}
            >
              {isSaving
                ? "Сохраняем..."
                : isEdit
                  ? "Сохранить изменения"
                  : "Добавить окрас"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ColorFormModal;
