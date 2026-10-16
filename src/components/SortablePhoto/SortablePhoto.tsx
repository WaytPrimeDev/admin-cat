import { useEffect, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./SortablePhoto.module.css";

interface Props {
  id: string;
  // File — новый локальный файл, string — URL уже загруженного фото
  source: File | string;
  onRemove: () => void;
  index: number;
}

export const SortablePhoto = ({ id, source, onRemove, index }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Создаём локальный URL один раз на файл, а не на каждый ре-рендер при перетаскивании
  const previewUrl = useMemo(
    () => (typeof source === "string" ? source : URL.createObjectURL(source)),
    [source],
  );

  // Освобождаем URL при размонтировании, а не в onLoad: на мобильных браузер
  // может перерисовать картинку во время перетаскивания, и отозванный URL
  // оставил бы пустой квадрат.
  useEffect(() => {
    if (typeof source === "string") return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl, source]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.previewItem} ${isDragging ? styles.dragging : ""}`}
    >
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className={styles.dragHandle}
      >
        <img
          src={previewUrl}
          alt="preview"
          className={styles.previewImage}
          // Иначе на мобильных долгое нажатие открывает меню «сохранить
          // изображение», а на десктопе стартует нативный drag браузера
          draggable={false}
        />
        <span className={styles.badge}>{index === 0 ? "★ 1" : index + 1}</span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Удалить фото"
        className={styles.removeSmall}
      >
        ×
      </button>
    </div>
  );
};
