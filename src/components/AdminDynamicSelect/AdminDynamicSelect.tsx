import styles from "./AdminDynamicSelect.module.css";

import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { useAppDispatch } from "../../store";
import { clearError } from "../../store/slices/filterSlice";
import { RequiredMark } from "../RequiredField/RequiredField";

export interface SelectOption {
  _id: string; // или id, если на бекенде по-другому
  name: string;
}

interface AdminDynamicSelectProps {
  label: string;
  required?: boolean;
  options: SelectOption[];
  registerProps: UseFormRegisterReturn;
  currentValue: string;
  error?: string;
  onAdd: (name: string) => Promise<void> | void;
  onRemove: (id: string) => Promise<void> | void;
}

export const AdminDynamicSelect = ({
  label,
  required = false,
  options,
  registerProps,
  currentValue,
  onAdd,
  onRemove,
}: AdminDynamicSelectProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    setIsLoading(true);
    try {
      await onAdd(newValue.trim());
      setNewValue("");
      setIsAdding(false);
    } catch (err) {
      console.error("Ошибка при добавлении", err);
    } finally {
      setIsLoading(false);
    }
  };


  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentValue) return;

    const confirmDelete = window.confirm(
      "Вы уверены, что хотите удалить этот элемент из базы?",
    );
    const optionToDelete = options.find((opt) => opt.name === currentValue);
    if (confirmDelete && optionToDelete) {
      setIsLoading(true);
      try {
        await onRemove(optionToDelete._id);
      } catch (err) {
        console.error("Ошибка при удалении", err);
      } finally {
        setIsLoading(false);
      }
    }
  };
  const dispatch = useAppDispatch();

  return (
  <div className={styles.root}>
    <label>
      {label}
      {required && <RequiredMark />}
    </label>

    {isAdding ? (
      <div className={styles.controls}>
        <input
          className={styles.addInput}
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Новое значение..."
          disabled={isLoading}
        />
        <button
          type="button"
          className={styles.iconBtn}
          onClick={handleAdd}
          disabled={isLoading || !newValue.trim()}
          title="Сохранить"
        >
          💾
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => setIsAdding(false)}
          disabled={isLoading}
          title="Отмена"
        >
          ❌
        </button>
      </div>
    ) : (
      <div className={styles.controls}>
        <select
          {...registerProps}
          className={styles.select}
          disabled={isLoading}
          onBlur={(e) => {
            registerProps.onBlur(e); // см. замечание ниже
            if (!e.currentTarget.contains(e.relatedTarget)) {
              dispatch(clearError());
            }
          }}
        >
          <option value="">-- Выберите --</option>
          {[...options]
      .sort((a, b) => a.name.localeCompare(b.name)).map((opt) => (
            <option key={opt._id} value={opt.name}>
              {opt.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => setIsAdding(true)}
          disabled={isLoading}
          title="Добавить"
        >
          ➕
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={handleDelete}
          disabled={isLoading || !currentValue}
          title="Удалить выбранное"
        >
          🗑️
        </button>
      </div>
    )}
  </div>
);
};
