import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useMemo } from "react";

import type { KittenImage } from "../../types";
import { MAX_PHOTOS } from "../../validation/photoSelection";
import { SortablePhoto } from "../SortablePhoto/SortablePhoto";
import styles from "./PhotoOrderEditor.module.css";

// Совпадает с fileFilter multer на бэкенде
const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

const fileId = (file: File) =>
  `${file.name}-${file.size}-${file.lastModified}`;

interface PhotoOrderEditorProps {
  inputId: string;
  existingImages: readonly KittenImage[];
  retainedImages: string[];
  newImages: File[];
  onChange: (retainedImages: string[], newImages: File[]) => void;
  error?: string;
}

/**
 * Редактор фото для форм редактирования: сохранённые фото + новые файлы.
 * Бэкенд ставит новые фото после сохранённых, поэтому перетаскивать можно
 * только внутри своей группы; нумерация сквозная, первое фото — главное.
 */
export const PhotoOrderEditor = ({
  inputId,
  existingImages,
  retainedImages,
  newImages,
  onChange,
  error,
}: PhotoOrderEditorProps) => {
  const photoCount = retainedImages.length + newImages.length;
  const isLimitReached = photoCount >= MAX_PHOTOS;

  // Превью — лёгкая mobile-версия, идентификатор для бэкенда — full
  const previewByFullUrl = useMemo(
    () => new Map(existingImages.map((image) => [image.full, image.mobile])),
    [existingImages],
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const retainedFrom = retainedImages.indexOf(String(active.id));
    const retainedTo = retainedImages.indexOf(String(over.id));
    if (retainedFrom !== -1 && retainedTo !== -1) {
      onChange(arrayMove(retainedImages, retainedFrom, retainedTo), newImages);
      return;
    }

    const newIds = newImages.map(fileId);
    const newFrom = newIds.indexOf(String(active.id));
    const newTo = newIds.indexOf(String(over.id));
    if (newFrom !== -1 && newTo !== -1) {
      onChange(retainedImages, arrayMove(newImages, newFrom, newTo));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";

    const knownIds = new Set(newImages.map(fileId));
    const accepted = picked
      .filter((file) => !knownIds.has(fileId(file)))
      .slice(0, MAX_PHOTOS - photoCount);

    onChange(retainedImages, [...newImages, ...accepted]);
  };

  const removeRetained = (url: string) =>
    onChange(
      retainedImages.filter((retainedUrl) => retainedUrl !== url),
      newImages,
    );

  const removeNew = (file: File) =>
    onChange(
      retainedImages,
      newImages.filter((newFile) => newFile !== file),
    );

  return (
    <div className={styles.group}>
      <span className={styles.label}>
        Photos ({photoCount}/{MAX_PHOTOS})
      </span>
      <p className={styles.hint}>
        Перетаскивайте, чтобы изменить порядок. Первое фото (★) — главное.
        Новые фото добавляются после текущих. Удалённые фото пропадут только
        после сохранения.
      </p>

      <label
        htmlFor={inputId}
        className={`${styles.uploadBtn} ${
          isLimitReached ? styles.uploadDisabled : ""
        }`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        {isLimitReached ? "Limit reached" : "Add Images"}
      </label>
      <input
        id={inputId}
        type="file"
        multiple
        hidden
        accept={ACCEPTED_IMAGE_TYPES}
        disabled={isLimitReached}
        onChange={handleFileChange}
      />

      {photoCount > 0 && (
        <div className={styles.previewContainer}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={retainedImages}
              strategy={rectSortingStrategy}
            >
              {retainedImages.map((url, index) => (
                <SortablePhoto
                  key={url}
                  id={url}
                  source={previewByFullUrl.get(url) ?? url}
                  index={index}
                  onRemove={() => removeRetained(url)}
                />
              ))}
            </SortableContext>
            <SortableContext
              items={newImages.map(fileId)}
              strategy={rectSortingStrategy}
            >
              {newImages.map((file, index) => (
                <SortablePhoto
                  key={fileId(file)}
                  id={fileId(file)}
                  source={file}
                  index={retainedImages.length + index}
                  onRemove={() => removeNew(file)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};
