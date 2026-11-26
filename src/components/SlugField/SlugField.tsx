import type { InputHTMLAttributes } from "react";

import styles from "./SlugField.module.css";
import { slugify, sitePath, type SlugKind } from "../../utils/slug";

interface SlugFieldProps {
  id: string;
  kind: SlugKind;
  // create — поле можно оставить пустым, бэкенд соберёт слаг из nameEn
  // edit — слаг уже в чужих ссылках, предупреждаем о последствиях
  mode: "create" | "edit";
  value: string;
  // nameEn: источник слага на бэкенде, нужен для превью при создании
  sourceName?: string;
  disabled?: boolean;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  onChange?: (value: string) => void;
  error?: string;
}

/*
 * Поле адреса записи на сайте. Значение всё равно нормализует бэкенд
 * (нижний регистр, латиница, дефисы), а при коллизии вернёт luna-2 —
 * поэтому превью здесь приблизительное, итог берём из ответа сервера.
 */
const SlugField = ({
  id,
  kind,
  mode,
  value,
  sourceName = "",
  disabled = false,
  inputProps,
  onChange,
  error,
}: SlugFieldProps) => {
  const typed = slugify(value);
  const fromName = slugify(sourceName);
  const preview = typed || fromName;

  return (
    <div className={styles.field}>
      <label htmlFor={id}>Адрес на сайте (slug)</label>
      <input
        id={id}
        className={styles.input}
        placeholder={fromName || "luna"}
        disabled={disabled}
        value={onChange ? value : undefined}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        {...inputProps}
      />
      <p className={styles.hint}>
        {preview ? (
          <>
            Адрес будет: <code className={styles.preview}>{sitePath(kind, preview)}</code>
            {!typed && " — собран из имени EN"}
          </>
        ) : (
          "Оставьте пустым — адрес соберётся из имени EN автоматически."
        )}
      </p>
      {mode === "edit" ? (
        <p className={styles.warning}>
          Изменение адреса ломает старые ссылки и поиск. Отправляется только при
          правке этого поля — переименование записи адрес не меняет.
        </p>
      ) : (
        <p className={styles.hint}>
          Бэкенд приведёт значение к нижнему регистру и латинице, а если адрес
          занят — добавит номер (luna-2).
        </p>
      )}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default SlugField;
