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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useState, type Dispatch, type SetStateAction, useEffect } from "react";

import styles from "./AddParentForm.module.css";
import {
  parentSchema,
  type ParentFormValues,
} from "../../validation/ParentSchema";
import { useAppDispatch, type RootState } from "../../store";
import { addParent } from "../../store/slices/parentsSlice";
import { SortablePhoto } from "../SortablePhoto/SortablePhoto";
import { AdminDynamicSelect } from "../AdminDynamicSelect/AdminDynamicSelect";
import { useSelector } from "react-redux";
import {
  addBreed,
  addColor,
  deleteBreed,
  deleteColor,
} from "../../store/slices/filterSlice";

interface AddParentFormProps {
  editShowForm: Dispatch<SetStateAction<boolean>>;
}

const AddParentForm = ({ editShowForm }: AddParentFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<ParentFormValues>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      images: [],
    },
  });

  const selectedColor = useWatch({ control, name: "color" });
  const selectedBreed = useWatch({ control, name: "breed" });

  const dispatch = useAppDispatch();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { colors, breeds } = useSelector((state: RootState) => state.filters);

  // Блокируем скролл страницы, пока открыто модальное окно
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

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

  const handleAddColor = async (name: string) => {
    const newColor = await dispatch(addColor({ name })).unwrap();
    setTimeout(() => {
      setValue("color", newColor.name);
    }, 0);
  };

  const handleRemoveColor = async (id: string) => {
    const optionToDelete = colors.find((color) => color.name === selectedColor);
    await dispatch(deleteColor(id)).unwrap();
    if (optionToDelete?._id === id) setValue("color", "");
  };

  const handleAddBreed = async (name: string) => {
    const newBreed = await dispatch(addBreed({ name })).unwrap();
    setTimeout(() => {
      setValue("breed", newBreed.name); // Исправлена опечатка (было "color")
    }, 0);
  };

  const handleRemoveBreed = async (id: string) => {
    await dispatch(deleteBreed(id)).unwrap();
    const optionToDelete = breeds.find((breed) => breed.name === selectedBreed); // Исправлено (было selectedColor)
    if (optionToDelete?._id === id) setValue("breed", "");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedFiles((items) => {
        const oldIndex = items.findIndex((f) => f.name + f.size === active.id);
        const newIndex = items.findIndex((f) => f.name + f.size === over.id);
        const updated = arrayMove(items, oldIndex, newIndex);

        setValue("images", updated, { shouldValidate: true });
        return updated;
      });
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

  const onSubmit = async (data: ParentFormValues) => {
    const formData = new FormData();

    formData.append("nameUa", data.nameUa);
    formData.append("nameEn", data.nameEn);
    formData.append("color", data.color);
    formData.append("breed", data.breed);
    formData.append("sex", data.sex);

    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      await dispatch(addParent(formData)).unwrap();
      editShowForm(false);
      setSelectedFiles([]);
      reset();
    } catch (err) {
      console.error("Ошибка при отправке:", err);
    }
  };

  return (
    <div className={styles.overlay} onClick={() => editShowForm(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Шапка */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h2>Add New Parent</h2>
            <p>Register a breeding cat in the cattery</p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => editShowForm(false)}
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Тело формы */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.formBody}>
          <div className={styles.gridRow}>
            <div className={styles.formGroup}>
              <label>Name (UA)</label>
              <input
                placeholder="e.g., Луна"
                {...register("nameUa")}
                className={styles.input}
              />
              {errors.nameUa && (
                <span className={styles.error}>{errors.nameUa.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Name (EN)</label>
              <input
                placeholder="e.g., Luna"
                {...register("nameEn")}
                className={styles.input}
              />
              {errors.nameEn && (
                <span className={styles.error}>{errors.nameEn.message}</span>
              )}
            </div>
          </div>

          <div className={styles.gridRow}>
            <div className={styles.formGroup}>
              <AdminDynamicSelect
                label="Breed"
                options={breeds}
                registerProps={register("breed")}
                currentValue={selectedBreed}
                onAdd={handleAddBreed}
                onRemove={handleRemoveBreed}
              />
              {errors.breed && (
                <span className={styles.error}>{errors.breed.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <AdminDynamicSelect
                label="Color / Pattern"
                options={colors}
                registerProps={register("color")}
                currentValue={selectedColor}
                onAdd={handleAddColor}
                onRemove={handleRemoveColor}
              />
              {errors.color && (
                <span className={styles.error}>{errors.color.message}</span>
              )}
            </div>
          </div>

          {/* Пол занимает отдельную строку (на десктопе можно сделать на всю ширину или оставить слева) */}
          <div className={styles.gridRow}>
            <div className={styles.formGroup}>
              <label>Gender</label>
              <select {...register("sex")} className={styles.input}>
                <option value="" disabled>
                  Select gender
                </option>
                <option value="male">Male (Самец)</option>
                <option value="female">Female (Самка)</option>
              </select>
              {errors.sex && (
                <span className={styles.error}>{errors.sex.message}</span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Photos (Up to 5)</label>
            <label className={styles.uploadBtn} htmlFor="parent-file-upload">
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
              Choose Images
            </label>
            <input
              id="parent-file-upload"
              type="file"
              multiple
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleFileChange}
            />

            {selectedFiles.length > 0 && (
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
            )}
            {errors.images && (
              <span className={styles.error}>{errors.images.message}</span>
            )}
          </div>

          {/* Кнопки */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => editShowForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Save Parent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddParentForm;
