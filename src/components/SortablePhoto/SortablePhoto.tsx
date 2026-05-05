import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./SortablePhoto.module.css";

interface Props {
  id: string;
  file: File;
  onRemove: () => void;
  index: number;
}

export const SortablePhoto = ({ id, file, onRemove, index }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative" as const,
    cursor: "grab",
  };

  // Создаем локальный URL для превью
  const previewUrl = URL.createObjectURL(file);

  return (
    <div ref={setNodeRef} style={style} className={styles.previewItem}>
      <div {...attributes} {...listeners} className={styles.dragHandle}>
        <img src={previewUrl} alt="preview" className={styles.previewImage} />
        <span className={styles.badge}>{index + 1}</span>
      </div>
      <button type="button" onClick={onRemove} className={styles.removeSmall}>
        ×
      </button>
    </div>
  );
};
