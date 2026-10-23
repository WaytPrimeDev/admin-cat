import type { FieldErrors } from "react-hook-form";

import styles from "./RequiredField.module.css";

/** Звёздочка рядом с подписью обязательного поля */
export const RequiredMark = () => (
  <span className={styles.mark} title="Обязательное поле" aria-hidden="true">
    *
  </span>
);

/** Пояснение к звёздочкам — ставится один раз вверху формы */
export const RequiredLegend = () => (
  <p className={styles.legend}>
    <span className={styles.mark} aria-hidden="true">
      *
    </span>
    — обязательное поле, без него сохранить не получится
  </p>
);

/** Требования к конкретному полю — под самим полем */
export const FieldHint = ({ children }: { children: React.ReactNode }) => (
  <p className={styles.fieldHint}>{children}</p>
);

interface MissingFieldsNoticeProps {
  // Ошибки из react-hook-form
  errors: FieldErrors;
  // Человеческие названия полей: ключ формы -> подпись в списке
  labels: Record<string, string>;
}

/**
 * Сводка незаполненных обязательных полей перед кнопкой сохранения:
 * иначе при неактивной кнопке непонятно, чего форме не хватает.
 */
export const MissingFieldsNotice = ({
  errors,
  labels,
}: MissingFieldsNoticeProps) => {
  const missing = Object.keys(labels).filter((name) => name in errors);

  if (missing.length === 0) return null;

  return (
    <div className={styles.notice} role="alert">
      <span className={styles.noticeTitle}>Заполните обязательные поля:</span>
      <ul className={styles.noticeList}>
        {missing.map((name) => (
          <li key={name}>{labels[name]}</li>
        ))}
      </ul>
    </div>
  );
};
