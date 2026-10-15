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
import { PhotoOrderEditor } from "../PhotoOrderEditor/PhotoOrderEditor";
import formStyles from "../AddParentForm/AddParentForm.module.css";
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
    formState: { errors, isSubmitting },
  } = useForm<UpdateParentFormValues>({
    resolver: zodResolver(updateParentSchema),
    defaultValues: {
      nameUa: parent.nameUa,
      nameEn: parent.nameEn,
      color: parent.color,
      breed: parent.breed,
      sex: parent.sex,
      retainedImages: parent.images.map((image) => image.full),
      newImages: [],
    },
  });

  const retainedImages = useWatch({ control, name: "retainedImages" });
  const newImages = useWatch({ control, name: "newImages" });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const setPhotos = (nextRetained: string[], nextNew: File[]) => {
    setValue("retainedImages", nextRetained, { shouldValidate: true });
    setValue("newImages", nextNew, { shouldValidate: true });
  };

  const onSubmit = async (values: UpdateParentFormValues) => {
    setSubmitError(null);
    try {
      await dispatch(
        updateParent({
          id: parent._id,
          formData: buildUpdateParentFormData(values),
        }),
      ).unwrap();
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
                  <option key={breed._id} value={breed.name}>
                    {breed.name}
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
                  <option key={color._id} value={color.name}>
                    {color.name}
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
            retainedImages={retainedImages}
            newImages={newImages}
            onChange={setPhotos}
            error={errors.newImages?.message}
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
              disabled={isSubmitting}
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
