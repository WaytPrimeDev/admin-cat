import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useEffect, type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

import styles from "./AddFamily.module.css";
import { useAppDispatch, type RootState } from "../../store";
import {
  familySchema,
  type FamilyFormInput,
  type FamilyFormValues,
} from "../../validation/familySchema";
import { createFamily } from "../../store/slices/familiesSlice";
import { fetchKittens } from "../../store/slices/kittensSlice";
import { fetchParents } from "../../store/slices/parentsSlice";
import {
  FieldHint,
  MissingFieldsNotice,
  RequiredLegend,
  RequiredMark,
} from "../RequiredField/RequiredField";

interface AddFamilyFormProps {
  editShowForm: Dispatch<SetStateAction<boolean>>;
}

// Названия обязательных полей для сводки под формой
const REQUIRED_LABELS: Record<string, string> = {
  name: "Family / Litter Name",
  breed: "Breed",
  kittens: "Litter (Kittens)",
};

const AddFamilyForm = ({ editShowForm }: AddFamilyFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FamilyFormInput, undefined, FamilyFormValues>({
    resolver: zodResolver(familySchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      breed: "",
      dad: undefined,
      mom: undefined,
      kittens: [],
    },
  });

  const { items: kittens } = useSelector((state: RootState) => state.kittens);
  const { items: parents } = useSelector((state: RootState) => state.parents);
  const { breeds } = useSelector((state: RootState) => state.filters);
  const dispatch = useAppDispatch();

  // Блокируем скролл страницы при открытом модальном окне
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Свободным считаем котёнка без семьи в любом виде: null, undefined или пустая строка.
  // Строгая проверка === null теряла только что добавленных котят,
  // у которых поля familyId в ответе нет вовсе
  const showKittens = useMemo(
    () => kittens.filter((kitten) => !kitten.familyId),
    [kittens],
  );

  const sexParents = useMemo(() => {
    const mom = parents.filter((parent) => parent.sex === "female");
    const dad = parents.filter((parent) => parent.sex === "male");
    return { mom, dad };
  }, [parents]);

  const onSubmit = async (data: FamilyFormValues) => {
    try {
      // Если селекты вернули пустую строку, превращаем ее в undefined для корректной валидации
      const payload = {
        ...data,
        mom: data.mom,
        dad: data.dad,
      };

      await dispatch(createFamily(payload)).unwrap();
      dispatch(fetchKittens());
      dispatch(fetchParents());

      editShowForm(false);
      reset();
    } catch (error) {
      console.error("Ошибка при создании:", error);
    }
  };

  return (
    <div className={styles.overlay} onClick={() => editShowForm(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Шапка модалки */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h2>Add New Family</h2>
            <p>Register a mating pair and litter record</p>
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
        <form className={styles.formBody} onSubmit={handleSubmit(onSubmit)}>
          <RequiredLegend />

          {/* Секция: Общая информация */}
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>General Details</span>
              <div className={styles.sectionLine}></div>
            </div>

            <div className={styles.gridRow}>
              <div className={styles.formGroup}>
                <label>
                  Family / Litter Name
                  <RequiredMark />
                </label>
                <input
                  type="text"
                  placeholder="e.g., Spring Litter 2026"
                  className={styles.input}
                  {...register("name")}
                  aria-invalid={Boolean(errors.name)}
                />
                <FieldHint>Как помёт будет называться в списке</FieldHint>
                {errors.name && (
                  <span className={styles.error}>{errors.name.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>
                  Breed
                  <RequiredMark />
                </label>
                <select
                  className={styles.select}
                  {...register("breed")}
                  aria-invalid={Boolean(errors.breed)}
                >
                  <option value="">Select breed</option>
                  {breeds.map((breed) => (
                    <option key={breed._id} value={breed.name}>
                      {breed.name}
                    </option>
                  ))}
                </select>
                {errors.breed && (
                  <span className={styles.error}>{errors.breed.message}</span>
                )}
              </div>
            </div>
          </div>

          {/* Секция: Отец */}
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>♂ Father (Sire)</span>
              <div className={styles.sectionLine}></div>
            </div>
            <div className={styles.formGroup}>
              <label>Select Father</label>
              <FieldHint>Необязательно — можно оставить «Unknown»</FieldHint>
              <select className={styles.select} {...register("dad")}>
                <option value="">Not selected (Unknown)</option>
                {sexParents.dad.map((parent) => (
                  <option key={parent._id} value={parent._id}>
                    {parent.nameEn || parent.nameUa}
                  </option>
                ))}
              </select>
              {errors.dad && (
                <span className={styles.error}>{errors.dad.message}</span>
              )}
            </div>
          </div>

          {/* Секция: Мать */}
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>♀ Mother (Dam)</span>
              <div className={styles.sectionLine}></div>
            </div>
            <div className={styles.formGroup}>
              <label>Select Mother</label>
              <FieldHint>Необязательно — можно оставить «Unknown»</FieldHint>
              <select className={styles.select} {...register("mom")}>
                <option value="">Not selected (Unknown)</option>
                {sexParents.mom.map((parent) => (
                  <option key={parent._id} value={parent._id}>
                    {parent.nameEn || parent.nameUa}
                  </option>
                ))}
              </select>
              {errors.mom && (
                <span className={styles.error}>{errors.mom.message}</span>
              )}
            </div>
          </div>

          {/* Секция: Котята */}
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Litter (Kittens)</span>
              <div className={styles.sectionLine}></div>
            </div>
            <div className={styles.formGroup}>
              <label>
                Select kittens belonging to this family
                <RequiredMark />
              </label>
              <FieldHint>
                Отметьте минимум одного котёнка. В списке только котята без
                семьи — если нужного нет, сначала открепите его от текущей
                семьи.
              </FieldHint>
              {showKittens.length > 0 ? (
                <div className={styles.checkboxGroup}>
                  {showKittens.map((kitten) => (
                    <label key={kitten._id} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        {...register("kittens")}
                        value={kitten._id}
                        className={styles.checkboxInput}
                      />
                      <span className={styles.checkboxText}>
                        {kitten.nameEn || kitten.nameUa}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyKittens}>
                  No unassigned kittens available.
                </p>
              )}
              {errors.kittens && (
                <span className={styles.error}>{errors.kittens.message}</span>
              )}
            </div>
          </div>

          <MissingFieldsNotice errors={errors} labels={REQUIRED_LABELS} />

          {/* Подвал с кнопками */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => editShowForm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            {/* Кнопка активна всегда: клик по ней показывает, чего не хватает,
                вместо молчаливо заблокированной кнопки */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Family"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFamilyForm;
