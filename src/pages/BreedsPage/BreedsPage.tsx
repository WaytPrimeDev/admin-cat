import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import styles from "./BreedsPage.module.css";
import { useAppDispatch, type RootState } from "../../store";
import {
  clearError,
  deleteBreed,
  fetchBreeds,
} from "../../store/slices/filterSlice";
import AddBreedForm from "../../components/AddBreedForm/AddBreedForm";
import EditBreedForm from "../../components/EditBreedForm/EditBreedForm";
import SlugLink from "../../components/SlugLink/SlugLink";
import {
  ImageOffIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "../../components/ReferenceIcons/ReferenceIcons";
import { compareRefNameUa, refNameUa } from "../../utils/referenceName";
import type { BreedRef } from "../../types";

const BreedsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { breeds, isLoading, errorBreed } = useSelector(
    (state: RootState) => state.filters,
  );
  const [showForm, setShowForm] = useState(false);
  const [editingBreed, setEditingBreed] = useState<BreedRef | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchBreeds());
  }, [dispatch]);

  const queryBreeds = useMemo(() => {
    const sorted = [...breeds].sort(compareRefNameUa);
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sorted;

    return sorted.filter(
      (breed) =>
        breed.nameUa?.toLowerCase().includes(query) ||
        breed.nameEn?.toLowerCase().includes(query),
    );
  }, [breeds, searchQuery]);

  // Бэкенд отвечает 409, если порода уже используется котятами,
  // родителями или семьями — текст показываем пользователю как есть
  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(`Удалить породу «${name}» из базы?`);
    if (!confirmed) return;

    setDeletingId(id);
    dispatch(clearError());
    try {
      await dispatch(deleteBreed(id)).unwrap();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>Породы</h2>
          <p className={styles.subtitle}>
            Справочник пород: названия по языкам и фото породы
          </p>
        </div>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => setShowForm(true)}
        >
          <span className={styles.btnIcon}>
            <PlusIcon />
          </span>
          Добавить породу
        </button>
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Поиск по названию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className={styles.clearSearchBtn}
            onClick={() => setSearchQuery("")}
            aria-label="Очистить поиск"
          >
            ✕
          </button>
        )}
      </div>

      {errorBreed && <div className={styles.error}>{errorBreed}</div>}

      {showForm && <AddBreedForm onClose={() => setShowForm(false)} />}

      {editingBreed && (
        <EditBreedForm
          breed={editingBreed}
          onClose={() => setEditingBreed(null)}
        />
      )}

      {isLoading && breeds.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Загрузка...</p>
        </div>
      ) : queryBreeds.length > 0 ? (
        <div className={styles.grid}>
          {queryBreeds.map((breed) => (
            <article key={breed._id} className={styles.card}>
              <div className={styles.photoBox}>
                {breed.image?.thumbnail || breed.image?.full ? (
                  <img
                    src={breed.image.thumbnail || breed.image.full}
                    alt={refNameUa(breed, "")}
                    className={styles.photo}
                    loading="lazy"
                  />
                ) : (
                  <span className={styles.noPhoto}>
                    <ImageOffIcon />
                    Нет фото
                  </span>
                )}
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{refNameUa(breed)}</h3>

                <div className={styles.langList}>
                  <p className={styles.langRow}>
                    <span className={styles.langTag}>en</span>
                    <span
                      className={
                        breed.nameEn
                          ? styles.langValue
                          : `${styles.langValue} ${styles.langEmpty}`
                      }
                    >
                      {breed.nameEn || "не заполнено"}
                    </span>
                  </p>
                  {breed.nameLang3 && (
                    <p className={styles.langRow}>
                      <span className={styles.langTag}>л3</span>
                      <span className={styles.langValue}>
                        {breed.nameLang3}
                      </span>
                    </p>
                  )}
                  {breed.nameLang4 && (
                    <p className={styles.langRow}>
                      <span className={styles.langTag}>л4</span>
                      <span className={styles.langValue}>
                        {breed.nameLang4}
                      </span>
                    </p>
                  )}
                </div>

                <div className={styles.slugRow}>
                  <SlugLink kind="breeds" slug={breed.slug} />
                </div>
              </div>

              <div className={styles.cardFooter}>
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => setEditingBreed(breed)}
                >
                  <span className={styles.btnIcon}>
                    <PencilIcon />
                  </span>
                  Изменить
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(breed._id, refNameUa(breed))}
                  disabled={deletingId === breed._id}
                >
                  <span className={styles.btnIcon}>
                    <TrashIcon />
                  </span>
                  {deletingId === breed._id ? "Удаляем..." : "Удалить"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>Породы не найдены</p>
          <span className={styles.emptyStateSub}>
            Добавьте породу кнопкой «+ Добавить породу»
          </span>
        </div>
      )}

      <div className={styles.footerCount}>
        Показано {queryBreeds.length} из {breeds.length} пород
      </div>
    </div>
  );
};

export default BreedsPage;
