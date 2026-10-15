import { useMemo } from "react";
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
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative" as const,
    cursor: "grab",
  };

  // Создаём локальный URL один раз на файл, а не на каждый ре-рендер при перетаскивании
  const previewUrl = useMemo(
    () => (typeof source === "string" ? source : URL.createObjectURL(source)),
    [source],
  );

  const releaseObjectUrl = () => {
    if (typeof source !== "string") URL.revokeObjectURL(previewUrl);
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.previewItem}>
      <div {...attributes} {...listeners} className={styles.dragHandle}>
        <img
          src={previewUrl}
          alt="preview"
          className={styles.previewImage}
          onLoad={releaseObjectUrl}
        />
        <span className={styles.badge}>{index === 0 ? "★ 1" : index + 1}</span>
      </div>
      <button type="button" onClick={onRemove} className={styles.removeSmall}>
        ×
      </button>
    </div>
  );
};
