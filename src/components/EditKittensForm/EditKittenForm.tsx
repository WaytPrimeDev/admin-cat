import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";

import {
  KITTEN_STATUSES,
  updateKittenSchema,
  type UpdateKittenFormValues,
} from "../../validation/kittenSchema";
import { useAppDispatch, type RootState } from "../../store";
import { updateKitten } from "../../store/slices/kittensSlice";
import type { Kitten, KittenPrice } from "../../types";
import { buildUpdateKittenFormData } from "../../utils/buildUpdateFormData";
import { withCurrentOption } from "../../utils/withCurrentOption";
import type { PhotoItem } from "../../validation/photoSelection";
import { PhotoOrderEditor } from "../PhotoOrderEditor/PhotoOrderEditor";
import formStyles from "../AddKittenForm/AddKittenForm.module.css";
import styles from "./EditKittenForm.module.css";

const STATUS_LABELS: Record<(typeof KITTEN_STATUSES)[number], string> = {
  offline: "Offline (скрыт)",
  active: "Active (в продаже)",
  booked: "Booked (забронирован)",
  out: "Out (уехал)",
};

// Бэкенд хранит пустую цену как строку "null"
const toPriceInput = (price: KittenPrice["breeding"] | string | undefined) =>
  price === null || price === undefined || price === "null" ? "" : String(price);

interface EditKittenFormProps {
  kitten: Kitten;
  onClose: () => void;
}

const EditKittenForm = ({ kitten, onClose }: EditKittenFormProps) => {
  const dispatch = useAppDispatch();
  const { colors, breeds } = useSelector((state: RootState) => state.filters);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<UpdateKittenFormValues>({
    resolver: zodResolver(updateKittenSchema),
    mode: "onChange",
    defaultValues: {
      nameUa: kitten.nameUa,
      nameEn: kitten.nameEn,
      color: kitten.color,
      breed: kitten.breed,
      sex: kitten.sex,
      status: kitten.status ?? "offline",
      // <input type="date"> принимает только YYYY-MM-DD, а с бэка приходит ISO
      birthDay: kitten.birthDay?.slice(0, 10) ?? "",
      breeding: toPriceInput(kitten.price?.breeding),
      pet: toPriceInput(kitten.price?.pet),
      photos: kitten.images.map((image) => ({
        kind: "retained" as const,
        url: image.full,
      })),
    },
  });

  const photos = useWatch({ control, name: "photos" });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const setPhotos = (nextPhotos: PhotoItem[]) => {
    setValue("photos", nextPhotos, { shouldValidate: true });
  };

  const onSubmit = async (values: UpdateKittenFormValues) => {
    setSubmitError(null);
    try {
      await dispatch(
        updateKitten({
          id: kitten._id,
          formData: buildUpdateKittenFormData(values),
        }),
      ).unwrap();
      onClose();
    } catch (error) {
      setSubmitError(
        typeof error === "string" ? error : "Не удалось сохранить котёнка",
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
            <h2>Edit Kitten</h2>
            <p>{kitten.nameUa}</p>
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
              <label htmlFor="edit-kitten-nameUa">Name (UA)</label>
              <input
                id="edit-kitten-nameUa"
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
              <label htmlFor="edit-kitten-nameEn">Name (EN)</label>
              <input
                id="edit-kitten-nameEn"
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
              <label htmlFor="edit-kitten-breed">Breed</label>
              <select
                id="edit-kitten-breed"
                {...register("breed")}
                className={formStyles.input}
              >
                <option value="">-- Выберите --</option>
                {withCurrentOption(breeds, kitten.breed).map((breed) => (
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
              <label htmlFor="edit-kitten-color">Color / Pattern</label>
              <select
                id="edit-kitten-color"
                {...register("color")}
                className={formStyles.input}
              >
                <option value="">-- Выберите --</option>
                {withCurrentOption(colors, kitten.color).map((color) => (
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
              <label htmlFor="edit-kitten-birthDay">Date of Birth</label>
              <input
                id="edit-kitten-birthDay"
                type="date"
                {...register("birthDay")}
                className={formStyles.input}
              />
              {errors.birthDay && (
                <span className={formStyles.error}>
                  {errors.birthDay.message}
                </span>
              )}
            </div>

            <div className={formStyles.formGroup}>
              <label htmlFor="edit-kitten-sex">Gender</label>
              <select
                id="edit-kitten-sex"
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

          <div className={formStyles.gridRow}>
            <div className={formStyles.formGroup}>
              <label htmlFor="edit-kitten-status">Status</label>
              <select
                id="edit-kitten-status"
                {...register("status")}
                className={formStyles.input}
              >
                {KITTEN_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              {errors.status && (
                <span className={formStyles.error}>
                  {errors.status.message}
                </span>
              )}
            </div>
          </div>

          <div className={formStyles.gridRow}>
            <div className={formStyles.formGroup}>
              <label htmlFor="edit-kitten-breeding">Price for Breeding</label>
              <input
                id="edit-kitten-breeding"
                type="number"
                min="0"
                placeholder="e.g., 3500"
                {...register("breeding")}
                className={formStyles.input}
              />
            </div>

            <div className={formStyles.formGroup}>
              <label htmlFor="edit-kitten-pet">Price as Pet</label>
              <input
                id="edit-kitten-pet"
                type="number"
                min="0"
                placeholder="e.g., 1500"
                {...register("pet")}
                className={formStyles.input}
              />
            </div>
          </div>

          <PhotoOrderEditor
            inputId="edit-kitten-photos"
            existingImages={kitten.images}
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

export default EditKittenForm;
