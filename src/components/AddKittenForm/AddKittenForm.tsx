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

import styles from "./AddKittenForm.module.css";
import {
  kittenSchema,
  type KittenFormValues,
} from "../../validation/kittenSchema";
import { useAppDispatch, type RootState } from "../../store";
import { addKitten } from "../../store/slices/kittensSlice";
import { SortablePhoto } from "../SortablePhoto/SortablePhoto";
import { AdminDynamicSelect } from "../AdminDynamicSelect/AdminDynamicSelect";
import { useSelector } from "react-redux";
import {
  addBreed,
  addColor,
  clearError,
  deleteBreed,
  deleteColor,
} from "../../store/slices/filterSlice";

interface AddKittenFormProps {
  editShowForm: Dispatch<SetStateAction<boolean>>;
}

const AddKittenForm = ({ editShowForm }: AddKittenFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<KittenFormValues>({
    resolver: zodResolver(kittenSchema),
    defaultValues: {
      images: [],
    },
  });

  const dispatch = useAppDispatch();

  // Отслеживаем текущие выбранные значения
  const selectedColor = useWatch({ control, name: "color" });
  const selectedBreed = useWatch({ control, name: "breed" });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { colors, breeds, errorColor, errorBreed } = useSelector(
    (state: RootState) => state.filters,
  );

  // Блокируем скролл страницы при открытом модальном окне
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

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
    const optionToDelete = breeds.find((breed) => breed.name === selectedBreed); // Исправлена опечатка

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onSubmit = async (data: KittenFormValues) => {
    const formData = new FormData();

    formData.append("birthDay", data.birthDay);
    formData.append("nameUa", data.nameUa);
    formData.append("nameEn", data.nameEn);
    formData.append("color", data.color);
    formData.append("breed", data.breed);
    formData.append("sex", data.sex);
    formData.append("breeding", String(data.breeding));
    formData.append("pet", String(data.pet));

    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      await dispatch(addKitten(formData)).unwrap();
      editShowForm(false);
      setSelectedFiles([]);
      reset();
    } catch (err) {
      console.error("Ошибка при отправке:", err);
    }
  };

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

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    setValue("images", updated, { shouldValidate: true });
  };

  const closeForm = () => {
    editShowForm(false);
    dispatch(clearError());
  };

  return (
    <div className={styles.overlay} onClick={() => closeForm()}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Шапка модалки */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h2>Add New Kitten</h2>
            <p>Fill in the details below to register a kitten</p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => closeForm()}
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
                placeholder="e.g., Пушок"
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
                placeholder="e.g., Snowball"
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
              {errorBreed && <p className={styles.error}>{errorBreed}</p>}
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
              {errorColor && <p className={styles.error}>{errorColor}</p>}
              {errors.color && (
                <span className={styles.error}>{errors.color.message}</span>
              )}
            </div>
          </div>

          <div className={styles.gridRow}>
            <div className={styles.formGroup}>
              <label>Date of Birth</label>
              <input
                type="date"
                {...register("birthDay")}
                className={styles.input}
              />
              {errors.birthDay && (
                <span className={styles.error}>{errors.birthDay.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Gender</label>
              <select {...register("sex")} className={styles.input}>
                <option value="">Select gender</option>
                <option value="male">Male (Самец)</option>
                <option value="female">Female (Самка)</option>
              </select>
              {errors.sex && (
                <span className={styles.error}>{errors.sex.message}</span>
              )}
            </div>
          </div>

          <div className={styles.gridRow}>
            <div className={styles.formGroup}>
              <label>Price for Breeding</label>
              <input
                type="number"
                placeholder="e.g., 3500"
                {...register("breeding")}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Price as Pet</label>
              <input
                type="number"
                placeholder="e.g., 1500"
                {...register("pet")}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Photos (Up to 5)</label>
            <label className={styles.uploadBtn} htmlFor="file-upload">
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
              id="file-upload"
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

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => closeForm()}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Save Kitten
            </button>
          </div>
        </form>
      </div>
      <svg className={styles.catIcon} viewBox="0 0 24 24">
        <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"></path>
        <path d="M8 14v.5"></path>
        <path d="M16 14v.5"></path>
        <path d="M11.25 16.25h1.5L12 17l-.75-.75Z"></path>
      </svg>
    </div>
  );
};

export default AddKittenForm;
