import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  fetchFamilies,
  createFamily,
  deleteFamily,
} from "../../store/slices/familiesSlice";
import { fetchKittens } from "../../store/slices/kittensSlice";
import { fetchParents } from "../../store/slices/parentsSlice";
import { useAppDispatch, type RootState } from "../../store";
import styles from "./FamiliesPage.module.css";
import {
  familySchema,
  type FamilyFormValues,
} from "../../validation/familySchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import EditFamilyForm from "../../components/Families/EditFamilyForm";
// import type { Family } from "../../types";

const FamiliesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: families,
    isLoading: familiesLoading,
    error: familiesError,
  } = useSelector((state: RootState) => state.families);
  const { items: kittens } = useSelector((state: RootState) => state.kittens);
  const { items: parents } = useSelector((state: RootState) => state.parents);
  const [showForm, setShowForm] = useState(false);
  const showKittens = useMemo(
    () => kittens.filter((kitten) => kitten.familyId === null),
    [kittens],
  );
  // const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const sexParents = useMemo(() => {
    const mom = parents.filter((parent) => parent.sex === "female");
    const dad = parents.filter((parent) => parent.sex === "male");
    return {
      mom,
      dad,
    };
  }, [parents]);

  useEffect(() => {
    dispatch(fetchFamilies());
    dispatch(fetchKittens());
    dispatch(fetchParents());
  }, [dispatch]);

  const {
    register,
    handleSubmit,

    reset,
    formState: { errors },
  } = useForm<FamilyFormValues>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      dad: undefined,
      mom: undefined,
    },
  });

  const onSubmit = async (data: FamilyFormValues) => {
    try {
      // Дожидаемся создания семьи
      await dispatch(createFamily(data)).unwrap();

      // Перезапрашиваем связанные данные, так как они изменились на сервере
      dispatch(fetchKittens());
      dispatch(fetchParents());

      setShowForm(false);
      reset();
    } catch (error) {
      console.error("Ошибка при создании:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (window.confirm("Вы уверены, что хотите удалить эту семью?")) {
        await dispatch(deleteFamily(id));
        dispatch(fetchKittens());
        dispatch(fetchParents());
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Семьи / Пометы</h2>
        <button
          className={styles.addBtn}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Отмена" : "Создать семью"}
        </button>
      </div>

      {familiesError && <div className={styles.error}>{familiesError}</div>}

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label>Название помета:</label>
            <input type="text" {...register("name")} required />
            {errors.name && <span>{errors.name.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Котята (выберите минимум одного):</label>
            <div className={styles.checkboxGroup}>
              {showKittens.map((kitten) => (
                <label key={kitten._id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    {...register("kittens")}
                    value={kitten._id}
                  />
                  {kitten.nameUa}
                </label>
              ))}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Мама (опционально):</label>
            <select {...register("mom")}>
              <option value="">Не выбрана</option>
              {sexParents.mom.map((parent) => (
                <option key={parent._id} value={parent._id}>
                  {parent.nameUa}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Папа (опционально):</label>
            <select {...register("dad")}>
              <option value="">Не выбран</option>
              {sexParents.dad.map((parent) => (
                <option key={parent._id} value={parent._id}>
                  {parent.nameUa}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className={styles.submitBtn}
            // disabled={formData.kittens.length === 0}
          >
            Создать
          </button>
        </form>
      )}
      {/* 
      {editingFamily && (
        <EditFamilyForm
          family={editingFamily}
          onClose={() => setEditingFamily(null)}
        />
      )} */}

      {familiesLoading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : (
        <div className={styles.list}>
          {families.map((family) => (
            <div key={family._id} className={styles.card}>
              <div className={styles.info}>
                <h3>{family.name}</h3>
                <p>
                  Котята:{" "}
                  {family.kittens
                    .map((id) => kittens.find((k) => k._id === id)?.nameUa)
                    .join(", ")}
                </p>
                <p>
                  Мама:{" "}
                  {family.parents.mom
                    ? parents.find((p) => p._id === family.parents.mom)?.nameUa
                    : "Не указана"}
                </p>
                <p>
                  Папа:{" "}
                  {family.parents.dad
                    ? parents.find((p) => p._id === family.parents.dad)?.nameUa
                    : "Не указан"}
                </p>
              </div>
              <button
                className={styles.editBtn}
                // onClick={() => setEditingFamily(family)}
              >
                Редактировать
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(family._id)}
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

export default FamiliesPage;
