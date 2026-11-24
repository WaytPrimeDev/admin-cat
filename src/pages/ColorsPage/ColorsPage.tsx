import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

// Раскладка та же, что у справочника пород — переиспользуем её стили
import styles from "../BreedsPage/BreedsPage.module.css";
import { useAppDispatch, type RootState } from "../../store";
import {
  clearError,
  deleteColor,
  fetchColors,
} from "../../store/slices/filterSlice";
import ColorFormModal from "../../components/ColorFormModal/ColorFormModal";
import type { ColorRef } from "../../types";
import { compareRefNameUa, refNameUa } from "../../utils/referenceName";

const ColorsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { colors, isLoading, errorColor } = useSelector(
    (state: RootState) => state.filters,
  );
  const [showForm, setShowForm] = useState(false);
  const [editingColor, setEditingColor] = useState<ColorRef | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchColors());
  }, [dispatch]);

  const queryColors = useMemo(() => {
    const sorted = [...colors].sort(compareRefNameUa);
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sorted;

    return sorted.filter(
      (color) =>
        color.nameUa?.toLowerCase().includes(query) ||
        color.nameEn?.toLowerCase().includes(query),
    );
  }, [colors, searchQuery]);

  // Бэкенд отвечает 409, если окрас используется котятами или родителями —
  // текст показываем пользователю как есть
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Удалить окрас «${name}» из базы?`)) return;

    setDeletingId(id);
    dispatch(clearError());
    try {
      await dispatch(deleteColor(id)).unwrap();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>Окрасы</h2>
          <p className={styles.subtitle}>
            Справочник окрасов: названия по языкам
          </p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm(true)}>
          + Добавить окрас
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

      {errorColor && <div className={styles.error}>{errorColor}</div>}

      {showForm && <ColorFormModal onClose={() => setShowForm(false)} />}

      {editingColor && (
        <ColorFormModal
          color={editingColor}
          onClose={() => setEditingColor(null)}
        />
      )}

      {isLoading && colors.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Загрузка...</p>
        </div>
      ) : queryColors.length > 0 ? (
        <div className={styles.grid}>
          {queryColors.map((color) => (
            <article key={color._id} className={styles.card}>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{refNameUa(color)}</h3>
                <p className={styles.cardSubtitle}>{color.nameEn || ""}</p>
                {(color.nameLang3 || color.nameLang4) && (
                  <p className={styles.cardLangs}>
                    {[color.nameLang3, color.nameLang4]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>

              <div className={styles.cardFooter}>
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => setEditingColor(color)}
                >
                  Изменить
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(color._id, refNameUa(color))}
                  disabled={deletingId === color._id}
                >
                  {deletingId === color._id ? "Удаляем..." : "Удалить"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>Окрасы не найдены</p>
          <span className={styles.emptyStateSub}>
            Добавьте окрас кнопкой «+ Добавить окрас»
          </span>
        </div>
      )}

      <div className={styles.footerCount}>
        Показано {queryColors.length} из {colors.length} окрасов
      </div>
    </div>
  );
};

export default ColorsPage;
