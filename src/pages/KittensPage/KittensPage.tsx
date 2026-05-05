import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  fetchKittens,
  addKitten,
  deleteKitten,
} from "../../store/slices/kittensSlice";
import { useAppDispatch, type RootState } from "../../store";
import type { Kitten } from "../../types";
import styles from "./KittensPage.module.css";
import { getKittenAgeInWeeks } from "../../utils/kittenAge";
import {
  kittenSchema,
  type KittenFormValues,
} from "../../validation/kittenSchema";
import { SortablePhoto } from "../../components/SortablePhoto/SortablePhoto";
import EditKittenForm from "../../components/Kittens/EditKittenForm";

const KittensPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: kittens,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.kittens);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingKitten, setEditingKitten] = useState<Kitten | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<KittenFormValues>({
    resolver: zodResolver(kittenSchema),
    defaultValues: {
      images: [],
    },
  });
  const [showForm, setShowForm] = useState(false);

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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    setValue("images", updated, { shouldValidate: true });
  };

  const getPluralWeeks = (count: number) => {
    // Выбираем локаль (ru-RU или uk-UA)
    const rules = new Intl.PluralRules("ru-RU");
    const formation = rules.select(count);

    switch (formation) {
      case "one":
        return `${count} неделя`; // 1, 21, 31...
      case "few":
        return `${count} недели`; // 2, 3, 4...
      case "many":
        return `${count} недель`; // 5, 6, 0, 11-14...
      default:
        return `${count} недель`;
    }
  };

  useEffect(() => {
    dispatch(fetchKittens());
  }, [dispatch]);

  const onSubmit = async (data: KittenFormValues) => {
    console.log(data);

    // 1. Создаем пустой экземпляр FormData
    const formData = new FormData();

    // 2. Наполняем его текстовыми данными
    formData.append("nameUa", data.nameUa);
    formData.append("nameEn", data.nameEn);
    formData.append("color", data.color);
    formData.append("birthDay", data.birthDay);
    formData.append("breed", data.breed);
    formData.append("sex", data.sex);

    // Для числовых полей приводим к строке
    formData.append("breeding", String(data.breeding));
    formData.append("pet", String(data.pet));

    // 3. Добавляем файлы (images — это массив файлов или FileList)
    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });
    }

    // 4. Теперь передаем именно formData (тип совпадет с тем, что в thunk)
    try {
      await dispatch(addKitten(formData)).unwrap();
      setShowForm(false);
      setSelectedFiles([]);
      reset();
    } catch (err) {
      console.error("Ошибка при отправке:", err);
    }
  };
  const handleDelete = (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этого котенка?")) {
      dispatch(deleteKitten(id));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Котята</h2>
        <button
          className={styles.addBtn}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Отмена" : "Добавить котенка"}
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

            <div className="form-group">
              <label>Дата рождения</label>
              <input type="date" {...register("birthDay")} />
            </div>
          </div>

          <div className="form-group">
            <label>Порода</label>
            <input {...register("breed")} defaultValue="British Shorthair" />
          </div>

          <div className="checkbox-group">
            <label>
              <input {...register("breeding")} /> Разведение
            </label>
            <label>
              <input {...register("pet")} /> В любимцы
            </label>
          </div>

          <div className="form-group">
            <label className={styles.btnPhoto} htmlFor="file-upload">
              Выберите фотографии (1-5 шт.)
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              style={{ display: "none" }}
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

          <button type="submit">Сохранить котенка</button>
        </form>
      )}

      {editingKitten && (
        <EditKittenForm
          kitten={editingKitten}
          onClose={() => setEditingKitten(null)}
        />
      )}

      {isLoading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : (
        <div className={styles.grid}>
          {kittens.map((kitten) => (
            <div key={kitten._id} className={styles.card}>
              <div className={styles.photos}>
                {kitten.images.map((photo, index) => (
                  <img
                    key={index}
                    src={photo.mobile}
                    alt={`${kitten.nameUa} ${index + 1}`}
                  />
                ))}
              </div>
              <div className={styles.info}>
                <h3>{kitten.nameUa}</h3>
                <p>Порода: {kitten.breed || "Не указана"}</p>
                <p>
                  Возраст:{" "}
                  {kitten.birthDay
                    ? `${getPluralWeeks(getKittenAgeInWeeks(kitten.birthDay))}`
                    : "Не указан"}
                </p>
              </div>
              <button
                className={styles.editBtn}
                onClick={() => setEditingKitten(kitten)}
              >
                Редактировать
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(kitten._id)}
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

export default KittensPage;
