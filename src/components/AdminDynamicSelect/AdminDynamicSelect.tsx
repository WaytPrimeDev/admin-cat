import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { useAppDispatch } from "../../store";
import { clearError } from "../../store/slices/filterSlice";

export interface SelectOption {
  _id: string; // или id, если на бекенде по-другому
  name: string;
}

interface AdminDynamicSelectProps {
  label: string;
  options: SelectOption[];
  registerProps: UseFormRegisterReturn;
  currentValue: string;
  error?: string;
  onAdd: (name: string) => Promise<void> | void;
  onRemove: (id: string) => Promise<void> | void;
}

export const AdminDynamicSelect = ({
  label,
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
    <div className="form-group">
      <label>{label}</label>

      {isAdding ? (
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={`Новое значение...`}
            disabled={isLoading}
            style={{ flex: 1 }}
          />

          <button
            type="button"
            onClick={handleAdd}
            disabled={isLoading || !newValue.trim()}
          >
            💾
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            disabled={isLoading}
          >
            ❌
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "8px" }}>
          <select
            {...registerProps}
            style={{ flex: 1 }}
            disabled={isLoading}
            onBlur={(e) => {
              // Проверка: если фокус ушел за пределы всего блока компонента
              if (!e.currentTarget.contains(e.relatedTarget)) {
                dispatch(clearError());
              }
            }}
          >
            <option value="">-- Выберите --</option>
            {options.map((opt) => (
              <option key={opt._id} value={opt.name}>
                {opt.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            disabled={isLoading}
            title="Добавить"
          >
            ➕
          </button>
          <button
            type="button"
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
