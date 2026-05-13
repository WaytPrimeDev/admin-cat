import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  fetchFamilies,
  updateFamiliesOrder,
} from "../../store/slices/familiesSlice";
import { fetchKittens } from "../../store/slices/kittensSlice";
import { fetchParents } from "../../store/slices/parentsSlice";
import { useAppDispatch, type RootState } from "../../store";
import styles from "./FamiliesPage.module.css";

import FamilyCard from "../../components/FamilyCard/FamilyCard";
import AddFamilyForm from "../../components/AddFamilyForm/AddFamily";
import { fetchBreeds } from "../../store/slices/filterSlice";
// import EditFamilyForm from "../../components/Families/EditFamilyForm";
// import type { Family } from "../../types";

const FamiliesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: families, error: familiesError } = useSelector(
    (state: RootState) => state.families,
  );
  const [showForm, setShowForm] = useState(false);

  const [localFamilies, setLocalFamilies] = useState([...families]);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    dispatch(fetchFamilies());
    dispatch(fetchKittens());
    dispatch(fetchParents());

    dispatch(fetchBreeds());
  }, [dispatch]);

  // Синхронизируем локальный стейт с Redux при загрузке или изменении
  useEffect(() => {
    setLocalFamilies([...families]);
  }, [families]);

  // Сохранение нового порядка
  const handleSaveOrder = async () => {
    try {
      const orderedIds = localFamilies.map((f) => f._id);
      console.log(orderedIds);

      await dispatch(updateFamiliesOrder(orderedIds)).unwrap();
      setIsReordering(false);
      // Опционально: можно заново запросить семьи, но если сервер ответил "ок", то Redux уже обновлен
    } catch (error) {
      console.error("Ошибка при сохранении порядка:", error);
      // Возвращаем старый порядок в случае ошибки
      setLocalFamilies([...families]);
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
      {families.length !== 0 && (
        <>
          {!isReordering ? (
            <button
              className={styles.editBtn}
              onClick={() => setIsReordering(true)}
            >
              Изменить порядок
            </button>
          ) : (
            <>
              <button className={styles.submitBtn} onClick={handleSaveOrder}>
                Сохранить порядок
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => {
                  setIsReordering(false);
                  setLocalFamilies([...families]);
                }}
              >
                Отмена
              </button>
            </>
          )}
        </>
      )}
      {familiesError && <div className={styles.error}>{familiesError}</div>}
      {showForm && <AddFamilyForm editShowForm={setShowForm} />}
      {/* {editingFamily && (
        <EditFamilyForm
          family={editingFamily}
          onClose={() => setEditingFamily(null)}
        />
      )} */}
      {families.length ? (
        <FamilyCard
          editLocalFamily={setLocalFamilies}
          localFamilies={localFamilies}
          isReordering={isReordering}
        />
      ) : (
        <p>упс, семей пока нет</p>
      )}
    </div>
  );
};

export default FamiliesPage;
