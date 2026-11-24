import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";

import {
  updateParentSchema,
  type UpdateParentFormValues,
} from "../../validation/ParentSchema";
import { useAppDispatch, type RootState } from "../../store";
import { updateParent } from "../../store/slices/parentsSlice";
import type { Parent } from "../../types";
import { buildUpdateParentFormData } from "../../utils/buildUpdateFormData";
import { withCurrentOption } from "../../utils/withCurrentOption";
import type { PhotoItem } from "../../validation/photoSelection";
import { PhotoOrderEditor } from "../PhotoOrderEditor/PhotoOrderEditor";
import formStyles from "../AddParentForm/AddParentForm.module.css";
import SlugField from "../SlugField/SlugField";
import styles from "./EditParentForm.module.css";

interface EditParentFormProps {
  parent: Parent;
  onClose: () => void;
}

const EditParentForm = ({ parent, onClose }: EditParentFormProps) => {
  const dispatch = useAppDispatch();
  const { colors, breeds } = useSelector((state: RootState) => state.filters);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<UpdateParentFormValues>({
    resolver: zodResolver(updateParentSchema),
    mode: "onChange",
    defaultValues: {
      nameUa: parent.nameUa,
      nameEn: parent.nameEn,
      slug: parent.slug ?? "",
      // в значении селекта лежит _id справочной записи, а не название
      color: parent.color?._id ?? "",
      breed: parent.breed?._id ?? "",
      sex: parent.sex,
      photos: parent.images.map((image) => ({
        kind: "retained" as const,
        url: image.full,
      })),
    },
  });

  const photos = useWatch({ control, name: "photos" });
  const slugValue = useWatch({ control, name: "slug" });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const setPhotos = (nextPhotos: PhotoItem[]) => {
    setValue("photos", nextPhotos, { shouldValidate: true });
  };

  const onSubmit = async (values: UpdateParentFormValues) => {
    setSubmitError(null);
    try {
      // Слаг уходит только если его реально меняли: переименование
      // родителя адрес не меняет, он уже в чужих ссылках
      const nextSlug = values.slug?.trim();
      const changedSlug =
        nextSlug && nextSlug !== (parent.slug ?? "") ? nextSlug : undefined;

      const response = await dispatch(
        updateParent({
          id: parent._id,
          formData: buildUpdateParentFormData(values, changedSlug),
        }),
      ).unwrap();
      // Бэкенд нормализует слаг и при коллизии вернёт luna-2 — значение
      // берём из ответа, а не то, что ввёл админ
      setValue("slug", response.data.slug ?? "");
      onClose();
    } catch (error) {
      setSubmitError(
        typeof error === "string" ? error : "Не удалось сохранить родителя",
      );
    }
  };

  const closeForm = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <div className={formStyles.overlay} onClick={closeForm}>
      <div
        className={formStyles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={formStyles.header}>
          <div className={formStyles.headerText}>
            <h2>Edit Parent</h2>
            <p>{parent.nameUa}</p>
          </div>
          <button
            type="button"
            className={formStyles.closeBtn}
            onClick={closeForm}
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

        <form onSubmit={handleSubmit(onSubmit)} className={formStyles.formBody}>
          <div className={formStyles.gridRow}>
            <div className={formStyles.formGroup}>
              <label htmlFor="edit-parent-nameUa">Name (UA)</label>
              <input
                id="edit-parent-nameUa"
                {...register("nameUa")}
                className={formStyles.input}
              />
              {errors.nameUa && (
                <span className={formStyles.error}>
                  {errors.nameUa.message}
                </span>
              )}
            </div>

            <div className={formStyles.formGroup}>
              <label htmlFor="edit-parent-nameEn">Name (EN)</label>
              <input
                id="edit-parent-nameEn"
                {...register("nameEn")}
                className={formStyles.input}
              />
              {errors.nameEn && (
                <span className={formStyles.error}>
                  {errors.nameEn.message}
                </span>
              )}
            </div>
          </div>

          <SlugField
            id="edit-parent-slug"
            kind="parents"
            mode="edit"
            value={slugValue ?? ""}
            sourceName={parent.nameEn}
            inputProps={register("slug")}
            error={errors.slug?.message}
          />

          <div className={formStyles.gridRow}>
            <div className={formStyles.formGroup}>
              <label htmlFor="edit-parent-breed">Breed</label>
              <select
                id="edit-parent-breed"
                {...register("breed")}
                className={formStyles.input}
              >
                <option value="">-- Выберите --</option>
                {withCurrentOption(breeds, parent.breed).map((breed) => (
                  <option key={breed._id} value={breed._id} title={breed.nameEn}>
                    {breed.nameUa}
                  </option>
                ))}
              </select>
              {errors.breed && (
                <span className={formStyles.error}>{errors.breed.message}</span>
              )}
            </div>

            <div className={formStyles.formGroup}>
              <label htmlFor="edit-parent-color">Color / Pattern</label>
              <select
                id="edit-parent-color"
                {...register("color")}
                className={formStyles.input}
              >
                <option value="">-- Выберите --</option>
                {withCurrentOption(colors, parent.color).map((color) => (
                  <option key={color._id} value={color._id} title={color.nameEn}>
                    {color.nameUa}
                  </option>
                ))}
              </select>
              {errors.color && (
                <span className={formStyles.error}>{errors.color.message}</span>
              )}
            </div>
          </div>

          <div className={formStyles.gridRow}>
            <div className={formStyles.formGroup}>
              <label htmlFor="edit-parent-sex">Gender</label>
              <select
                id="edit-parent-sex"
                {...register("sex")}
                className={formStyles.input}
              >
                <option value="male">Male (Самец)</option>
                <option value="female">Female (Самка)</option>
              </select>
              {errors.sex && (
                <span className={formStyles.error}>{errors.sex.message}</span>
              )}
            </div>
          </div>

          <PhotoOrderEditor
            inputId="edit-parent-photos"
            existingImages={parent.images}
            photos={photos}
            onChange={setPhotos}
            error={errors.photos?.message}
          />

          {submitError && (
            <div className={styles.submitError}>{submitError}</div>
          )}

          <div className={formStyles.footer}>
            <button
              type="button"
              className={formStyles.cancelBtn}
              onClick={closeForm}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={formStyles.submitBtn}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditParentForm;
