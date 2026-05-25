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
  isOverlay?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const SortableFamilyItem: React.FC<SortableFamilyItemProps> = ({
  family,
  isReordering,
  isOverlay = false,
  isExpanded,
  onToggleExpand,
}) => {
  const dispatch = useAppDispatch();
  const { items: parents } = useSelector((state: RootState) => state.parents);
  const { items: kittens } = useSelector((state: RootState) => state.kittens);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: family._id,
    disabled: !isReordering || isOverlay,
  });

  const style = isOverlay
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 2 : 1,
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

  const father = parents.find((p) => p._id === family.parents?.dad);
  const mother = parents.find((p) => p._id === family.parents?.mom);

  const familyKittens =
    family.kittens
      ?.map((id: string) => kittens.find((k) => k._id === id))
      .filter(Boolean) || [];

  return (
    <>
      <tr
        ref={isOverlay ? undefined : setNodeRef}
        style={style}
        className={`${styles.familyRow} ${isExpanded ? styles.activeRow : ""} ${
          isReordering && !isOverlay ? styles.reorderingState : ""
        } ${isOverlay ? styles.overlay : ""}`}
        // ВНИМАНИЕ: Мы убрали attributes и listeners отсюда!
      >
        <td data-label="FAMILY">
          <div className={styles.familyInfo}>
            <span className={styles.familyName}>
              {family.name || "Untitled"}
            </span>
            <span className={styles.breedBadge}>
              {family.breed || "Not specified"}
            </span>
          </div>
        </td>

        <td data-label="PARENTS">
          <div className={styles.parentsPair}>
            <div className={styles.parentAvatarGroup}>
              {father ? (
                <img
                  className={styles.parentAvatar}
                  src={father.images?.[0]?.full || "placeholder.jpg"}
                  alt={father.nameEn || father.nameUa || "Father"}
                />
              ) : (
                <div
                  className={`${styles.parentAvatar} ${styles.parentUnknown}`}
                >
                  ?
                </div>
              )}

              {mother ? (
                <img
                  className={`${styles.parentAvatar} ${styles.motherAvatar}`}
                  src={mother.images?.[0]?.full || "placeholder.jpg"}
                  alt={mother.nameEn || mother.nameUa || "Mother"}
                />
              ) : (
                <div
                  className={`${styles.parentAvatar} ${styles.motherAvatar} ${styles.parentUnknown}`}
                >
                  ?
                </div>
              )}
            </div>
            <div className={styles.parentsNamesDesktop}>
              <div>{father ? father.nameEn || father.nameUa : "No dad"}</div>
              <div>{mother ? mother.nameEn || mother.nameUa : "No mom"}</div>
            </div>
          </div>
        </td>

        <td data-label="BREED" className={styles.breedCellDesktopOnly}>
          <span className={styles.breedText}>
            {family.breed || "Not specified"}
          </span>
        </td>

        <td data-label="KITTENS" className={styles.kittensTableCell}>
          <button
            className={styles.expandKittensBtn}
            onClick={onToggleExpand}
            type="button"
          >
            <span className={styles.kittensCountBadge}>
              {familyKittens.length}
            </span>
            <span className={styles.kittensText}>kittens</span>
            <span
              className={`${styles.chevron} ${isExpanded ? styles.open : ""}`}
            >
              ▼
            </span>
          </button>
        </td>

        <td data-label="ACTIONS" className={styles.actionsCell}>
          <div className={styles.actionButtons}>
            {isReordering ? (
              /* КНОПКА-РУЧКА ДЛЯ DRAG-AND-DROP */
              <button
                className={styles.dragHandleBtn}
                {...attributes}
                {...listeners}
                title="Drag to reorder"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="16" y2="6"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                  <line x1="8" y1="18" x2="16" y2="18"></line>
                </svg>
              </button>
            ) : (
              <button
                className={styles.actionBtn}
                onClick={() => handleDelete(family._id)}
                title="Delete family"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </td>
      </tr>

      {isExpanded && familyKittens.length > 0 && (
        <tr className={styles.expandedRow}>
          <td colSpan={5} className={styles.expandedCell}>
            <div className={styles.kittensContainer}>
              <div className={styles.kittensTitle}>
                KITTENS FROM {family.name?.toUpperCase() || "THIS FAMILY"}
              </div>
              <div className={styles.kittensList}>
                {familyKittens.map((kitten) => (
                  <div
                    key={(kitten as Kitten)._id}
                    className={styles.kittenChip}
                  >
                    <img
                      src={
                        (kitten as Kitten).images?.[0]?.mobile ||
                        "placeholder.jpg"
                      }
                      alt={
                        (kitten as Kitten).nameEn || (kitten as Kitten).nameUa
                      }
                      className={styles.kittenImg}
                    />
                    <div className={styles.kittenChipInfo}>
                      <div className={styles.kittenChipName}>
                        {(kitten as Kitten).nameEn || (kitten as Kitten).nameUa}
                      </div>
                      <div className={styles.kittenChipStatus}>
                        <span className={styles.statusDot}></span>
                        {(kitten as Kitten).status || "Unknown"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default SortableFamilyItem;
