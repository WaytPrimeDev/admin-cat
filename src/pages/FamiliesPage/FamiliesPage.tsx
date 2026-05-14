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
import type { Family } from "../../types";

const FamiliesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: families, error: familiesError } = useSelector(
    (state: RootState) => state.families,
  );
  const [showForm, setShowForm] = useState(false);

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
      setIsReordering(false);
    } catch (error) {
      console.error("Ошибка при сохранении порядка:", error);
      setIsReordering(false);
    }
  };

  const displayFamilies = isReordering ? localFamilies : families;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>Families</h2>
          <p className={styles.subtitle}>Breeding lines and litter records</p>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Family"}
        </button>
      </div>

      {families.length !== 0 && (
        <div className={styles.controls}>
          {!isReordering ? (
            <button className={styles.editBtn} onClick={handleStartReordering}>
              Reorder Families
            </button>
          ) : (
            <div className={styles.reorderActions}>
              <button className={styles.submitBtn} onClick={handleSaveOrder}>
                Save Order
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setIsReordering(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {familiesError && <div className={styles.error}>{familiesError}</div>}
      {showForm && <AddFamilyForm editShowForm={setShowForm} />}

      {families.length > 0 ? (
        <div className={styles.cardGrid}>
          <FamilyCard
            editLocalFamily={setLocalFamilies}
            localFamilies={displayFamilies}
            isReordering={isReordering}
          />
        </div>
      ) : (
        <p className={styles.emptyState}>No families found.</p>
      )}
    </div>
  );
};

export default FamiliesPage;
