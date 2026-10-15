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
import {
  MAX_PHOTOS,
  photoId,
  type PhotoItem,
} from "../../validation/photoSelection";
import { SortablePhoto } from "../SortablePhoto/SortablePhoto";
import styles from "./PhotoOrderEditor.module.css";

// Совпадает с fileFilter multer на бэкенде
const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

interface PhotoOrderEditorProps {
  inputId: string;
  existingImages: readonly KittenImage[];
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  error?: string;
}

/**
 * Редактор фото для форм редактирования: сохранённые фото и новые файлы живут
 * в одном списке, поэтому перетаскивать можно любое фото на любое место —
 * в том числе новое на первое, чтобы сделать его главным.
 */
export const PhotoOrderEditor = ({
  inputId,
  existingImages,
  photos,
  onChange,
  error,
}: PhotoOrderEditorProps) => {
  const isLimitReached = photos.length >= MAX_PHOTOS;

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

  const photoIds = useMemo(() => photos.map(photoId), [photos]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const from = photoIds.indexOf(String(active.id));
    const to = photoIds.indexOf(String(over.id));
    if (from === -1 || to === -1) return;

    onChange(arrayMove(photos, from, to));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";

    const knownIds = new Set(photoIds);
    const accepted = picked
      .map((file): PhotoItem => ({ kind: "new", file }))
      .filter((photo) => !knownIds.has(photoId(photo)))
      .slice(0, MAX_PHOTOS - photos.length);

    onChange([...photos, ...accepted]);
  };

  const removePhoto = (id: string) =>
    onChange(photos.filter((photo) => photoId(photo) !== id));

  return (
    <div className={styles.group}>
      <span className={styles.label}>
        Photos ({photos.length}/{MAX_PHOTOS})
      </span>
      <p className={styles.hint}>
        Перетаскивайте, чтобы изменить порядок. Первое фото (★) — главное,
        им может стать и только что добавленное. Удалённые фото пропадут
        только после сохранения.
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

      {photos.length > 0 && (
        <div className={styles.previewContainer}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={photoIds} strategy={rectSortingStrategy}>
              {photos.map((photo, index) => {
                const id = photoIds[index];
                return (
                  <SortablePhoto
                    key={id}
                    id={id}
                    source={
                      photo.kind === "retained"
                        ? (previewByFullUrl.get(photo.url) ?? photo.url)
                        : photo.file
                    }
                    index={index}
                    onRemove={() => removePhoto(id)}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </div>
      )}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};
