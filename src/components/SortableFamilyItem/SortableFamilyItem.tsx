import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSelector } from "react-redux";

import styles from "./SortableFamilyItem.module.css";
import { useAppDispatch, type RootState } from "../../store";
import { deleteFamily } from "../../store/slices/familiesSlice";
import { fetchKittens } from "../../store/slices/kittensSlice";
import { fetchParents } from "../../store/slices/parentsSlice";
import type { Family, Kitten } from "../../types";

interface SortableFamilyItemProps {
  family: Family;
  isReordering: boolean;
  // onEdit?: (family: Family) => void; // Раскомментируйте и передайте функцию для редактирования
}

const SortableFamilyItem: React.FC<SortableFamilyItemProps> = ({
  family,
  isReordering,
}) => {
  const dispatch = useAppDispatch();
  const { items: parents } = useSelector((state: RootState) => state.parents);
  const { items: kittens } = useSelector((state: RootState) => state.kittens);

  // DND Настройки
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: family._id,
    disabled: !isReordering,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  // Удаление семьи
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

  const handleEdit = () => {
    // Здесь будет вызов модалки редактирования
    // onEdit?.(family);
    console.log("Редактировать семью:", family._id);
  };

  // Поиск родителей
  const father = parents.find((p) => p._id === family.parents?.dad);
  const mother = parents.find((p) => p._id === family.parents?.mom);

  // Сбор котят по ID из массива family.kittens
  const familyKittens =
    family.kittens
      ?.map((id: string) => {
        return kittens.find((k) => k._id === id);
      })
      .filter(Boolean) || [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${styles.card} 
        ${isReordering ? styles.reordering : ""} 
        ${isDragging ? styles.dragging : ""}
      `}
      {...(isReordering ? attributes : {})}
      {...(isReordering ? listeners : {})}
    >
      {/* Шапка Карточки */}
      <div className={styles.cardHeader}>
        <h3 className={styles.matingPairTitle}>
          {family.name || "Mating Pair"}
        </h3>
        <div className={styles.lineDivider}></div>

        {/* Кнопки действий (прячем во время сортировки) */}
        {!isReordering && (
          <div className={styles.actions}>
            <button
              disabled
              className={styles.editBtn}
              onClick={handleEdit}
              title="Редактировать семью"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => handleDelete(family._id)}
              title="Удалить семью"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className={styles.mainBreedBadge}>
        {family.breed || father?.breed || mother?.breed || "Порода не указана"}
      </div>

      {/* Сетка Родителей (ВСЕГДА 2 КОЛОНКИ) */}
      <div className={styles.parentsGrid}>
        {/* ОТЕЦ */}
        <div className={styles.parentColumn}>
          <div
            className={`${styles.parentImageWrapper} ${!father ? styles.emptyImageWrapper : ""}`}
          >
            {father ? (
              <img
                src={father.images?.[0]?.full || "placeholder.jpg"}
                alt={father.nameEn || "Father"}
                className={styles.parentImage}
              />
            ) : (
              <span className={styles.emptyIcon}>?</span>
            )}
          </div>
          <div className={styles.parentInfo}>
            <div className={styles.parentTitle}>♂ Папа</div>
            <div
              className={`${styles.parentName} ${!father ? styles.unknownText : ""}`}
            >
              {father ? father.nameEn || father.nameUa : "Ушел за хлебом"}
            </div>
            {father && (
              <div className={styles.parentChips}>
                <span className={styles.chipPurple}>{father.breed}</span>
                <span className={styles.chipGold}>{father.color}</span>
              </div>
            )}
          </div>
        </div>

        {/* МАТЬ */}
        <div className={styles.parentColumn}>
          <div
            className={`${styles.parentImageWrapper} ${!mother ? styles.emptyImageWrapper : ""}`}
          >
            {mother ? (
              <img
                src={mother.images?.[0]?.full || "placeholder.jpg"}
                alt={mother.nameEn || "Mother"}
                className={styles.parentImage}
              />
            ) : (
              <span className={styles.emptyIcon}>?</span>
            )}
          </div>
          <div className={styles.parentInfo}>
            <div className={styles.parentTitle}>♀ Мама</div>
            <div
              className={`${styles.parentName} ${!mother ? styles.unknownText : ""}`}
            >
              {mother ? mother.nameEn || mother.nameUa : "Нерадивая мать"}
            </div>
            {mother && (
              <div className={styles.parentChips}>
                <span className={styles.chipPurple}>{mother.breed}</span>
                <span className={styles.chipGold}>{mother.color}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <hr className={styles.separator} />

      {/* Котята */}
      <div className={styles.litterPreviewHeader}>
        <h4>Котята</h4>
        <span>{familyKittens.length} kittens</span>
      </div>

      <div className={styles.kittensList}>
        {familyKittens.length > 0 ? (
          (familyKittens as Kitten[]).map((kitten) => (
            <div key={kitten._id} className={styles.kittenItem}>
              <img
                src={
                  kitten.images?.[0]?.thumbnail ||
                  kitten.images?.[0]?.mobile ||
                  "placeholder.jpg"
                }
                alt={kitten.nameEn || kitten.nameUa}
                className={styles.kittenImage}
              />
              <span className={styles.kittenName}>
                {kitten.nameEn || kitten.nameUa}
              </span>
            </div>
          ))
        ) : (
          <p className={styles.noKittensText}>В этом помете пока нет котят.</p>
        )}
      </div>
    </div>
  );
};

export default SortableFamilyItem;
