import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { fetchKittens } from "../../store/slices/kittensSlice";
import { useAppDispatch, type RootState } from "../../store";
import type { Kitten } from "../../types";

import styles from "./KittensPage.module.css";
import EditKittenForm from "../../components/EditKittensForm/EditKittenForm";
import KittensTable from "../../components/KittensCard/KittensCard";
import AddKittenForm from "../../components/AddKittenForm/AddKittenForm";
import { fetchBreeds, fetchColors } from "../../store/slices/filterSlice";
import { fetchParents } from "../../store/slices/parentsSlice";
import { fetchFamilies } from "../../store/slices/familiesSlice";

const KittensPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: kittens, error } = useSelector(
    (state: RootState) => state.kittens,
  );
  const [editingKitten, setEditingKitten] = useState<Kitten | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchKittens());
    dispatch(fetchColors());
    dispatch(fetchBreeds());
    dispatch(fetchParents());
    dispatch(fetchFamilies());
  }, [dispatch]);

  const queryKittens = useMemo(() => {
    if (!searchQuery.trim()) return kittens;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return kittens.filter(
      (kitten) =>
        kitten.nameUa?.toLowerCase().includes(lowerCaseQuery) ||
        kitten.nameEn?.toLowerCase().includes(lowerCaseQuery),
    );
  }, [kittens, searchQuery]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>Kittens</h2>
          <p className={styles.subtitle}>
            Manage available kittens and litters
          </p>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Kitten"}
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
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className={styles.clearSearchBtn}
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <svg
                width="14"
                height="14"
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
          )}
        </div>

        <button className={styles.filterSection} aria-label="Open filters">
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
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {showForm && <AddKittenForm editShowForm={setShowForm} />}

      {editingKitten && (
        <EditKittenForm
          kitten={editingKitten}
          onClose={() => setEditingKitten(null)}
        />
      )}

      <div className={styles.tableContainer}>
        {queryKittens && queryKittens.length > 0 ? (
          <KittensTable
            editKitten={setEditingKitten}
            queryKittens={queryKittens}
          />
        ) : (
          <div className={styles.emptyState}>
            <p>No kittens found</p>
            <span className={styles.emptyStateSub}>
              Try adjusting your search criteria
            </span>
          </div>
        )}
        <div className={styles.tableFooter}>
          Showing {queryKittens?.length} of {kittens?.length} kittens
        </div>
      </div>
    </div>
  );
};

export default KittensPage;
