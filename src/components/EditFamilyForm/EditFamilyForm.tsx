import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

import { useAppDispatch, type RootState } from "../../store";
import {
  updateFamilySchema,
  type UpdateFamilyFormInput,
  type UpdateFamilyFormValues,
} from "../../validation/familySchema";
import { updateFamily } from "../../store/slices/familiesSlice";
import { fetchKittens } from "../../store/slices/kittensSlice";
import { fetchParents } from "../../store/slices/parentsSlice";
import type { Family } from "../../types";
import {
  FieldHint,
  MissingFieldsNotice,
  RequiredLegend,
  RequiredMark,
} from "../RequiredField/RequiredField";
import formStyles from "../AddFamilyForm/AddFamily.module.css";
import styles from "./EditFamilyForm.module.css";

// Названия обязательных полей для сводки под формой
const REQUIRED_LABELS: Record<string, string> = {
  name: "Family / Litter Name",
  breed: "Breed",
  kittens: "Litter (Kittens)",
};

interface EditFamilyFormProps {
  family: Family;
  onClose: () => void;
}

const EditFamilyForm = ({ family, onClose }: EditFamilyFormProps) => {
  const dispatch = useAppDispatch();
  const { items: kittens } = useSelector((state: RootState) => state.kittens);
  const { items: parents } = useSelector((state: RootState) => state.parents);
  const { breeds } = useSelector((state: RootState) => state.filters);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateFamilyFormInput, undefined, UpdateFamilyFormValues>({
    resolver: zodResolver(updateFamilySchema),
    mode: "onChange",
    defaultValues: {
      name: family.name ?? "",
      breed: family.breed ?? "",
      mom: family.parents?.mom ?? "",
      dad: family.parents?.dad ?? "",
      kittens: family.kittens ?? [],
    },
  });

  // Блокируем скролл страницы при открытом модальном окне
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // В списке показываем свободных котят плюс тех, кто уже в этой семье,
  // иначе при редактировании текущий помёт исчез бы из выбора
  const showKittens = useMemo(() => {
    const ownIds = new Set(family.kittens ?? []);
    return kittens.filter(
      (kitten) => !kitten.familyId || ownIds.has(kitten._id),
    );
  }, [kittens, family.kittens]);

  const sexParents = useMemo(() => {
    const mom = parents.filter((parent) => parent.sex === "female");
    const dad = parents.filter((parent) => parent.sex === "male");
    return { mom, dad };
  }, [parents]);

  const closeForm = () => {
    if (!isSubmitting) onClose();
  };

  const onSubmit = async (data: UpdateFamilyFormValues) => {
    setSubmitError(null);
    try {
      await dispatch(
        updateFamily({
          id: family._id,
          data: {
            name: data.name,
            breed: data.breed,
            kittens: data.kittens,
            // Пустую строку из селекта отправляем как null — родитель неизвестен
            mom: data.mom || null,
            dad: data.dad || null,
          },
        }),
      ).unwrap();

      // Привязка котят и родителей меняется на бэке — перечитываем их
      dispatch(fetchKittens());
      dispatch(fetchParents());

      onClose();
    } catch (error) {
      setSubmitError(
        typeof error === "string" ? error : "Не удалось сохранить семью",
      );
    }
  };

  return (
    <div className={formStyles.overlay} onClick={closeForm}>
      <div
        className={formStyles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Шапка модалки */}
        <div className={formStyles.header}>
          <div className={formStyles.headerText}>
            <h2>Edit Family</h2>
            <p>{family.name || "Untitled family"}</p>
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

        {/* Тело формы */}
        <form className={formStyles.formBody} onSubmit={handleSubmit(onSubmit)}>
          <RequiredLegend />

          {/* Секция: Общая информация */}
          <div className={formStyles.sectionBox}>
            <div className={formStyles.sectionHeader}>
              <span className={formStyles.sectionTitle}>General Details</span>
              <div className={formStyles.sectionLine}></div>
            </div>

            <div className={formStyles.gridRow}>
              <div className={formStyles.formGroup}>
                <label htmlFor="edit-family-name">
                  Family / Litter Name
                  <RequiredMark />
                </label>
                <input
                  id="edit-family-name"
                  type="text"
                  placeholder="e.g., Spring Litter 2026"
                  className={formStyles.input}
                  {...register("name")}
                  aria-invalid={Boolean(errors.name)}
                />
                <FieldHint>Как помёт будет называться в списке</FieldHint>
                {errors.name && (
                  <span className={formStyles.error}>
                    {errors.name.message}
                  </span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label htmlFor="edit-family-breed">
                  Breed
                  <RequiredMark />
                </label>
                <select
                  id="edit-family-breed"
                  className={formStyles.select}
                  {...register("breed")}
                  aria-invalid={Boolean(errors.breed)}
                >
                  <option value="">Select breed</option>
                  {breeds.map((breed) => (
                    <option key={breed._id} value={breed.name}>
                      {breed.name}
                    </option>
                  ))}
                  {/* Порода семьи могла быть удалена из справочника — не теряем её */}
                  {family.breed &&
                    !breeds.some((breed) => breed.name === family.breed) && (
                      <option value={family.breed}>{family.breed}</option>
                    )}
                </select>
                {errors.breed && (
                  <span className={formStyles.error}>
                    {errors.breed.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Секция: Отец */}
          <div className={formStyles.sectionBox}>
            <div className={formStyles.sectionHeader}>
              <span className={formStyles.sectionTitle}>♂ Father (Sire)</span>
              <div className={formStyles.sectionLine}></div>
            </div>
            <div className={formStyles.formGroup}>
              <label htmlFor="edit-family-dad">Select Father</label>
              <FieldHint>Необязательно — можно оставить Unknown</FieldHint>
              <select
                id="edit-family-dad"
                className={formStyles.select}
                {...register("dad")}
              >
                <option value="">Not selected (Unknown)</option>
                {sexParents.dad.map((parent) => (
                  <option key={parent._id} value={parent._id}>
                    {parent.nameEn || parent.nameUa}
                  </option>
                ))}
              </select>
              {errors.dad && (
                <span className={formStyles.error}>{errors.dad.message}</span>
              )}
            </div>
          </div>

          {/* Секция: Мать */}
          <div className={formStyles.sectionBox}>
            <div className={formStyles.sectionHeader}>
              <span className={formStyles.sectionTitle}>♀ Mother (Dam)</span>
              <div className={formStyles.sectionLine}></div>
            </div>
            <div className={formStyles.formGroup}>
              <label htmlFor="edit-family-mom">Select Mother</label>
              <FieldHint>Необязательно — можно оставить Unknown</FieldHint>
              <select
                id="edit-family-mom"
                className={formStyles.select}
                {...register("mom")}
              >
                <option value="">Not selected (Unknown)</option>
                {sexParents.mom.map((parent) => (
                  <option key={parent._id} value={parent._id}>
                    {parent.nameEn || parent.nameUa}
                  </option>
                ))}
              </select>
              {errors.mom && (
                <span className={formStyles.error}>{errors.mom.message}</span>
              )}
            </div>
          </div>

          {/* Секция: Котята */}
          <div className={formStyles.sectionBox}>
            <div className={formStyles.sectionHeader}>
              <span className={formStyles.sectionTitle}>Litter (Kittens)</span>
              <div className={formStyles.sectionLine}></div>
            </div>
            <div className={formStyles.formGroup}>
              <label>
                Select kittens belonging to this family
                <RequiredMark />
              </label>
              <FieldHint>
                Отметьте минимум одного котёнка. В списке котята этой семьи и
                все свободные — снятая галочка открепляет котёнка от семьи.
              </FieldHint>
              {showKittens.length > 0 ? (
                <div className={formStyles.checkboxGroup}>
                  {showKittens.map((kitten) => (
                    <label key={kitten._id} className={formStyles.checkboxLabel}>
                      <input
                        type="checkbox"
                        {...register("kittens")}
                        value={kitten._id}
                        className={formStyles.checkboxInput}
                      />
                      <span className={formStyles.checkboxText}>
                        {kitten.nameEn || kitten.nameUa}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className={formStyles.emptyKittens}>No kittens available.</p>
              )}
              {errors.kittens && (
                <span className={formStyles.error}>
                  {errors.kittens.message}
                </span>
              )}
            </div>
          </div>

          <MissingFieldsNotice errors={errors} labels={REQUIRED_LABELS} />

          {submitError && (
            <div className={styles.submitError}>{submitError}</div>
          )}

          {/* Подвал с кнопками */}
          <div className={formStyles.footer}>
            <button
              type="button"
              className={formStyles.cancelBtn}
              onClick={closeForm}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            {/* Кнопка активна всегда: клик показывает, чего не хватает */}
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

export default EditFamilyForm;
