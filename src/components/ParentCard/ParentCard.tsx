import React, { useState } from "react";
import { useSelector } from "react-redux";
import styles from "./ParentCard.module.css";
import { useAppDispatch, type RootState } from "../../store";
import type { Dispatch, SetStateAction } from "react";
import type { Parent } from "../../types";
import { deleteParent } from "../../store/slices/parentsSlice";

interface ParentCardProps {
  editParent: Dispatch<SetStateAction<Parent | null>>;
  viewParent: Dispatch<SetStateAction<Parent | null>>;
  queryParents: Parent[];
}

const ParentCard = ({
  editParent,
  viewParent,
  queryParents,
}: ParentCardProps) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useSelector((state: RootState) => state.parents);
  const { items: kittens } = useSelector((state: RootState) => state.kittens);

  // Состояние для хранения ID раскрытого родителя (открыт может быть только один)
  const [expandedParentId, setExpandedParentId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedParentId((prev) => (prev === id ? null : id));
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this parent?")) {
      dispatch(deleteParent(id));
    }
  };

  if (isLoading) return <div className={styles.loading}>Loading...</div>;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.desktopOnlyCell}>PHOTO</th>
          <th>NAME & TITLE</th>
          <th>BREED</th>
          <th>SEX</th>
          <th>KITTENS</th>
          <th style={{ textAlign: "center" }}>ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {queryParents.map((parent) => {
          const isExpanded = expandedParentId === parent._id;

          // Фильтруем котят на основе обновленной схемы Mongoose (k.parentId.mom / k.parentId.dad)
          const parentKittens = kittens.filter((k) => {
            if (!k.parentId) return false;

            // Обрабатываем случаи, когда приходят просто ID (строки) или уже populated объекты с _id
            const momId = k.parentId.mom;
            const dadId = k.parentId.dad;

            return momId === parent._id || dadId === parent._id;
          });

          return (
            <React.Fragment key={parent._id}>
              <tr
                className={`${styles.parentRow} ${isExpanded ? styles.activeRow : ""}`}
              >
                <td data-label="PHOTO" className={styles.desktopOnlyCell}>
                  <div className={styles.avatarWrapper}>
                    <img
                      src={parent.images[0]?.full || "placeholder.jpg"}
                      alt={parent.nameEn || parent.nameUa}
                      className={styles.avatar}
                      onClick={() => viewParent(parent)}
                    />
                  </div>
                </td>

                <td data-label="NAME & TITLE" className={styles.nameCell}>
                  <div className={styles.nameText}>
                    {parent.nameEn || parent.nameUa}
                  </div>
                </td>

                <td data-label="BREED" className={styles.mutedText}>
                  {parent.breed || "Not specified"}
                </td>

                <td data-label="SEX" className={styles.mutedText}>
                  {parent.sex === "male" ? "♂ Male" : "♀ Female"}
                </td>

                {/* Колонка с котятами, клик по которой раскрывает список */}
                <td data-label="KITTENS" className={styles.kittensCell}>
                  <div
                    className={styles.kittensTrigger}
                    onClick={() => toggleExpand(parent._id)}
                  >
                    {parentKittens.length > 0 ? (
                      <>
                        <div className={styles.avatarStack}>
                          {parentKittens.slice(0, 4).map((k) => (
                            <img
                              key={k._id}
                              src={k.images[0]?.mobile || "placeholder.jpg"}
                              alt={k.nameEn || k.nameUa}
                              className={styles.stackAvatar}
                            />
                          ))}
                        </div>
                        <span className={styles.kittenCount}>
                          {parentKittens.length} kittens{" "}
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </>
                    ) : (
                      <span className={styles.noKittens}>No kittens</span>
                    )}
                  </div>
                </td>

                <td data-label="ACTIONS">
                  <div className={styles.actions}>
                    <button
                      className={styles.iconBtn}
                      aria-label="View"
                      onClick={() => viewParent(parent)}
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
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button
                      disabled
                      className={styles.iconBtn}
                      onClick={() => editParent(parent)}
                      aria-label="Edit"
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
                      className={styles.iconBtn}
                      onClick={() => handleDelete(parent._id)}
                      aria-label="Delete"
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
                </td>
              </tr>

              {/* Раскрывающийся блок с котятами */}
              {isExpanded && (
                <tr className={styles.expandedRow}>
                  <td colSpan={6} className={styles.expandedTd}>
                    <div className={styles.expandedContent}>
                      <div className={styles.expandedHeader}>
                        KITTENS FROM{" "}
                        {parent.nameEn?.toUpperCase() ||
                          parent.nameUa?.toUpperCase()}
                      </div>
                      <div className={styles.kittenChipsContainer}>
                        {parentKittens.map((kitten) => (
                          <div key={kitten._id} className={styles.kittenChip}>
                            <img
                              src={
                                kitten.images[0]?.mobile || "placeholder.jpg"
                              }
                              alt={kitten.nameEn || kitten.nameUa}
                              className={styles.chipAvatar}
                            />
                            <div className={styles.chipInfo}>
                              <div className={styles.chipName}>
                                {kitten.nameEn || kitten.nameUa}
                              </div>
                              <div className={styles.chipStatus}>
                                <span
                                  className={`${styles.statusDot} ${styles[kitten.status?.toLowerCase() || "offline"]}`}
                                ></span>
                                {kitten.status || "Offline"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

export default ParentCard;
