import React, { useEffect, useMemo, useState } from "react";
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
import EditFamilyForm from "../../components/EditFamilyForm/EditFamilyForm";
import { fetchBreeds } from "../../store/slices/filterSlice";
import type { Family } from "../../types";
import { getPluralFamilies } from "../../utils/getPluralParents";

const FamiliesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: families, error: familiesError } = useSelector(
    (state: RootState) => state.families,
  );
  const [showForm, setShowForm] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [localFamilies, setLocalFamilies] = useState<Family[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    dispatch(fetchFamilies());
    dispatch(fetchKittens());
    dispatch(fetchParents());
    dispatch(fetchBreeds());
  }, [dispatch]);

  const handleStartReordering = () => {
    setLocalFamilies([...families]);
    setIsReordering(true);
  };

  const handleSaveOrder = async () => {
    try {
      const orderedIds = localFamilies.map((f) => f._id);

      await dispatch(updateFamiliesOrder(orderedIds)).unwrap();
      await dispatch(fetchFamilies()).unwrap();
      setIsReordering(false);
    } catch (error) {
      console.error("Ошибка при сохранении порядка:", error);
      setIsReordering(false);
    }
  };

  const displayFamilies = isReordering ? localFamilies : families;

  const queryFamilies = useMemo(() => {
    if (!searchQuery.trim()) return displayFamilies;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return displayFamilies.filter(
      (family) =>
        family.name?.toLowerCase().includes(lowerCaseQuery) ||
        family.breed?.nameUa?.toLowerCase().includes(lowerCaseQuery) ||
        family.breed?.nameEn?.toLowerCase().includes(lowerCaseQuery),
    );
  }, [displayFamilies, searchQuery]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>Семьи</h2>
          <p className={styles.subtitle}>Линии разведения и записи о помётах</p>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Отмена" : "+ Добавить семью"}
        </button>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchInputWrapper}>
          <span className={styles.searchIcon}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Поиск по названию или породе..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {families.length !== 0 && (
        <div className={styles.controls}>
          {!isReordering ? (
            <button className={styles.editBtn} onClick={handleStartReordering}>
              Изменить порядок
            </button>
          ) : (
            <div className={styles.reorderActions}>
              <button className={styles.submitBtn} onClick={handleSaveOrder}>
                Сохранить порядок
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setIsReordering(false)}
              >
                Отмена
              </button>
            </div>
          )}
        </div>
      )}

      {familiesError && <div className={styles.error}>{familiesError}</div>}
      {showForm && <AddFamilyForm editShowForm={setShowForm} />}

      {editingFamily && (
        <EditFamilyForm
          family={editingFamily}
          onClose={() => setEditingFamily(null)}
        />
      )}

      {queryFamilies.length > 0 ? (
        <div className={styles.tableContainer}>
          <FamilyCard
            editFamily={setEditingFamily}
            editLocalFamily={setLocalFamilies}
            localFamilies={queryFamilies}
            isReordering={isReordering}
          />
        </div>
      ) : (
        <p className={styles.emptyState}>
          {families.length === 0
            ? "Семьи пока не добавлены."
            : "По запросу ничего не найдено."}
        </p>
      )}

      {families.length > 0 && (
        <div className={styles.footer}>
          Показано {queryFamilies.length} из {families.length}{" "}
          {getPluralFamilies(families.length)}
        </div>
      )}
    </div>
  );
};

export default FamiliesPage;
