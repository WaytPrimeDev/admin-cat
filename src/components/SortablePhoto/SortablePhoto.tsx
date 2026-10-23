import { useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./SortablePhoto.module.css";

const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

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

  const imgRef = useRef<HTMLImageElement>(null);

  // blob-URL создаём и отзываем в одном эффекте и пишем прямо в DOM: держать
  // его в useMemo нельзя — в StrictMode уборка эффекта отзывает ссылку, а
  // useMemo при повторном прогоне новую не пересчитывает, и в превью остаётся
  // битая картинка. Отзыв именно при размонтировании, а не в onLoad: на
  // мобильных браузер может перерисовать картинку во время перетаскивания, и
  // отозванный URL оставил бы пустой квадрат.
  useEffect(() => {
    const img = imgRef.current;
    if (typeof source === "string" || !img) return;

    const objectUrl = URL.createObjectURL(source);
    img.src = objectUrl;

    return () => URL.revokeObjectURL(objectUrl);
  }, [source]);

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
          ref={imgRef}
          // Для файла src проставляет эффект; до этого — прозрачный пиксель,
          // чтобы не мелькала иконка битой картинки
          src={typeof source === "string" ? source : TRANSPARENT_PIXEL}
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
