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

import styles from "./AddParentForm.module.css";
import {
  parentSchema,
  type ParentFormValues,
} from "../../validation/ParentSchema";
import { useForm, useWatch } from "react-hook-form";
import { useState, type Dispatch, type SetStateAction } from "react";
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

  const selectedColor = useWatch({
    control,
    name: "color",
  });
  const selectedBreed = useWatch({
    control,
    name: "breed",
  });

  const dispatch = useAppDispatch();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { colors, breeds } = useSelector((state: RootState) => state.filters);

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
      setValue("color", newBreed.name);
    }, 0);
  };

  const handleRemoveBreed = async (id: string) => {
    await dispatch(deleteBreed(id)).unwrap();
    const optionToDelete = breeds.find((breed) => breed.name === selectedColor);

    if (optionToDelete?._id === id) setValue("breed", "");
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
      editShowForm(false);
      setSelectedFiles([]);
      reset();
    } catch (err) {
      console.error("Ошибка при отправке:", err);
    }
  };

  return (
    <>
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
        <AdminDynamicSelect
          label="Color (Цвет)"
          options={colors}
          registerProps={register("color")}
          currentValue={selectedColor}
          onAdd={handleAddColor}
          onRemove={handleRemoveColor}
        />
        {errors && (
          <span className="error" style={{ color: "red", fontSize: "12px" }}>
            {errors.color?.message}
          </span>
        )}

        <AdminDynamicSelect
          label="Порода"
          options={breeds}
          registerProps={register("breed")}
          currentValue={selectedBreed}
          error={errors.breed?.message}
          onAdd={handleAddBreed}
          onRemove={handleRemoveBreed}
        />
        {errors && (
          <span className="error" style={{ color: "red", fontSize: "12px" }}>
            {errors.breed?.message}
          </span>
        )}
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
    </>
  );
};
export default AddParentForm;
