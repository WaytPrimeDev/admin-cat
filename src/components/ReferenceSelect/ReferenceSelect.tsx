import styles from "./ReferenceSelect.module.css";

import type { UseFormRegisterReturn } from "react-hook-form";
import { useAppDispatch } from "../../store";
import { clearError } from "../../store/slices/filterSlice";
import { RequiredMark } from "../RequiredField/RequiredField";
import type { BreedRef, ColorRef } from "../../types";
import { compareRefNameUa, refNameUa } from "../../utils/referenceName";

interface ReferenceSelectProps {
  label: string;
  required?: boolean;
  options: (ColorRef | BreedRef)[];
  registerProps: UseFormRegisterReturn;
  // в значении формы лежит _id справочной записи
  currentValue: string;
  disabled?: boolean;
  id?: string;
  // Кнопка ➕ показывается только там, где есть что открыть (окрас — модалка).
  // У породы добавления в форме больше нет: она создаётся на своей странице
  onAddClick?: () => void;
  onRemove?: (id: string) => Promise<void> | void;
}

export const ReferenceSelect = ({
  label,
  required = false,
  options,
  registerProps,
  currentValue,
  disabled = false,
  id,
  onAddClick,
  onRemove,
}: ReferenceSelectProps) => {
  const dispatch = useAppDispatch();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentValue || !onRemove) return;

    const confirmDelete = window.confirm(
      "Вы уверены, что хотите удалить этот элемент из базы?",
    );
    if (!confirmDelete) return;

    await onRemove(currentValue);
  };

  return (
    <div className={styles.root}>
      <label htmlFor={id}>
        {label}
        {required && <RequiredMark />}
      </label>

      <div className={styles.controls}>
        <select
          {...registerProps}
          id={id}
          className={styles.select}
          disabled={disabled}
          onBlur={(e) => {
            registerProps.onBlur(e);
            if (!e.currentTarget.contains(e.relatedTarget)) {
              dispatch(clearError());
            }
          }}
        >
          <option value="">-- Выберите --</option>
          {[...options]
            .sort(compareRefNameUa)
            .map((opt) => (
              <option key={opt._id} value={opt._id} title={opt.nameEn}>
                {refNameUa(opt)}
              </option>
            ))}
        </select>

        {onAddClick && (
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onAddClick}
            disabled={disabled}
            title="Добавить"
          >
            ➕
          </button>
        )}

        {onRemove && (
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleDelete}
            disabled={disabled || !currentValue}
            title="Удалить выбранное"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};
