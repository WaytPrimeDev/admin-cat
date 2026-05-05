import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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
import {
  fetchParents,
  addParent,
  deleteParent,
} from "../../store/slices/parentsSlice";
import { useAppDispatch, type RootState } from "../../store";
import styles from "./ParentsPage.module.css";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  parentSchema,
  type ParentFormValues,
} from "../../validation/ParentSchema";
import { useForm } from "react-hook-form";
import EditParentForm from "../../components/Parents/EditParentForm";
import type { Parent } from "../../types";
import { SortablePhoto } from "../../components/SortablePhoto/SortablePhoto";

const ParentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: parents,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.parents);
  const [showForm, setShowForm] = useState(false);
  console.log(parents);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ParentFormValues>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      images: [],
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      setSelectedFiles(() => {
        const combined = newFiles.slice(0, 5);
        setValue("images", combined, { shouldValidate: true });
        return combined;
      });
      e.target.value = "";
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedFiles((items) => {
        const oldIndex = items.findIndex((f) => f.name + f.size === active.id);
        const newIndex = items.findIndex((f) => f.name + f.size === over.id);
        const updated = arrayMove(items, oldIndex, newIndex);

        // Синхронизируем с react-hook-form
        setValue("images", updated, { shouldValidate: true });
        return updated;
      });
    }
  };

  useEffect(() => {
    dispatch(fetchParents());
  }, [dispatch]);

  const onSubmit = async (data: ParentFormValues) => {
    const formData = new FormData();

    // 2. Наполняем его текстовыми данными
    formData.append("nameUa", data.nameUa);
    formData.append("nameEn", data.nameEn);
    formData.append("color", data.color);

    formData.append("breed", data.breed);
    formData.append("sex", data.sex);

    // 3. Добавляем файлы (images — это массив файлов или FileList)
    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });
    }

    // 4. Теперь передаем именно formData (тип совпадет с тем, что в thunk)
    try {
      await dispatch(addParent(formData)).unwrap();
      setShowForm(false);
      setSelectedFiles([]);
      reset();
    } catch (err) {
      console.error("Ошибка при отправке:", err);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этого родителя?")) {
      dispatch(deleteParent(id));
    }
  };
  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    setValue("images", updated, { shouldValidate: true });
  };
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Родители</h2>
        <button
          className={styles.addBtn}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Отмена" : "Добавить родителя"}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="kitten-form">
          <h2>Добавить котенка</h2>

          <div className="form-group">
            <label>Имя (UA)</label>
            <input {...register("nameUa")} />
            {errors.nameUa && <span>{errors.nameUa.message}</span>}
          </div>

          <div className="form-group">
            <label>Name (EN)</label>
            <input {...register("nameEn")} />
            {errors.nameEn && <span>{errors.nameEn.message}</span>}
          </div>

          <div className="form-group">
            <label>Color</label>
            <input {...register("color")} />
            {errors.color && <span>{errors.color.message}</span>}
          </div>

          <div className="grid-row">
            <div className="form-group">
              <label>Пол</label>
              <select {...register("sex")}>
                <option value="male">Самец</option>
                <option value="female">Самка</option>
              </select>
              {errors.sex && <span>{errors.sex.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Порода</label>
            <input {...register("breed")} defaultValue="British Shorthair" />
          </div>

          <div className="form-group">
            <label className={styles.btnPhoto} htmlFor="file-upload">
              Добавьте фотографии (1-5 шт.)
            </label>
            <input
              id="file-upload"
              style={{ display: "none" }}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className={styles.previewContainer}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedFiles.map((f) => f.name + f.size)}
                  strategy={rectSortingStrategy}
                >
                  {selectedFiles.map((file, index) => (
                    <SortablePhoto
                      key={file.name + file.size}
                      id={file.name + file.size}
                      file={file}
                      index={index}
                      onRemove={() => removeFile(index)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            {errors.images && (
              <span className="error">{errors.images.message}</span>
            )}
          </div>

          <button type="submit">Сохранить родителя</button>
        </form>
      )}

      {editingParent && (
        <EditParentForm parent={editingParent} onClose={() => setEditingParent(null)} />
      )}

      {isLoading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : (
        <div className={styles.grid}>
          {parents.map((parent) => (
            <div key={parent._id} className={styles.card}>
              <div className={styles.photos}>
                {parent.images.map((photo, index) => (
                  <img
                    key={index}
                    src={photo.full}
                    alt={`${parent.nameEn} ${index + 1}`}
                  />
                ))}
              </div>
              <div className={styles.info}>
                <h3>{parent.nameUa}</h3>
                <p>Порода: {parent.breed || "Не указана"}</p>
              </div>
              <button
                className={styles.editBtn}
                onClick={() => setEditingParent(parent)}
              >
                Редактировать
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(parent._id)}
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentsPage;
