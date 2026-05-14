import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import styles from "./ParentsPage.module.css";
import EditParentForm from "../../components/Parents/EditParentForm";
import ParentCard from "../../components/ParentCard/ParentCard";
import AddParentForm from "../../components/AddParentForm/AddParentForm";
import ViewParentModal from "../../components/ViewParentModal/ViewParentModal"; // <-- ИМПОРТ ВАШЕГО НОВОГО МОДАЛЬНОГО ОКНА

import type { Parent } from "../../types";
import { fetchParents } from "../../store/slices/parentsSlice";
import { fetchKittens } from "../../store/slices/kittensSlice";
import { useAppDispatch, type RootState } from "../../store";
import { fetchBreeds, fetchColors } from "../../store/slices/filterSlice";

const ParentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: parents, error } = useSelector(
    (state: RootState) => state.parents,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const queryParents = useMemo(() => {
    if (!searchQuery.trim()) return parents;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return parents.filter(
      (parent) =>
        parent.nameUa?.toLowerCase().includes(lowerCaseQuery) ||
        parent.nameEn?.toLowerCase().includes(lowerCaseQuery),
    );
  }, [parents, searchQuery]);

  const [showForm, setShowForm] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);

  // <-- НОВОЕ СОСТОЯНИЕ ДЛЯ ПРОСМОТРА РОДИТЕЛЯ (ГЛАЗИК)
  const [viewingParent, setViewingParent] = useState<Parent | null>(null);

  useEffect(() => {
    dispatch(fetchColors());
    dispatch(fetchBreeds());
    dispatch(fetchParents());
    dispatch(fetchKittens());
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>Parents</h2>
          <p className={styles.subtitle}>Breeding cats and their offspring</p>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Parent"}
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
            placeholder="Search by name, breed, or title..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.filterSection}>
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
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
          <span className={styles.filterText}>Filters</span>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Модальное окно добавления */}
      {showForm && <AddParentForm editShowForm={setShowForm} />}

      {/* Модальное окно редактирования (Карандаш) */}
      {editingParent && (
        <EditParentForm
          parent={editingParent}
          onClose={() => setEditingParent(null)}
        />
      )}

      {/* <-- НОВОЕ МОДАЛЬНОЕ ОКНО ПРОСМОТРА (Глазик) --> */}
      {viewingParent && (
        <ViewParentModal
          parent={viewingParent}
          onClose={() => setViewingParent(null)}
        />
      )}

      <div className={styles.tableContainer}>
        {queryParents && queryParents.length > 0 ? (
          <ParentCard
            editParent={setEditingParent}
            viewParent={setViewingParent}
            queryParents={queryParents} /* <-- ПЕРЕДАЕМ ФУНКЦИЮ В КАРТОЧКУ */
          />
        ) : (
          <p className={styles.emptyState}>No parents found</p>
        )}
        <div className={styles.tableFooter}>
          {queryParents?.length} of {parents?.length} parents
        </div>
      </div>
    </div>
  );
};

export default ParentsPage;
