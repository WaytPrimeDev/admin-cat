import { useSelector } from "react-redux";
import { useAppDispatch, type RootState } from "../../store";
import { getPluralWeeks } from "../../utils/getPluralWeeks";
import { getKittenAgeInWeeks } from "../../utils/kittenAge";
import styles from "./KittenCard.module.css";
import { deleteKitten } from "../../store/slices/kittensSlice";
import type { Dispatch, SetStateAction } from "react";
import type { Kitten } from "../../types";

interface KittenCardProps {
  editKitten: Dispatch<SetStateAction<Kitten | null>>;
}

const KittensCard = ({ editKitten }: KittenCardProps) => {
  const dispatch = useAppDispatch();
  const { items: kittens, isLoading } = useSelector(
    (state: RootState) => state.kittens,
  );

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this kitten?")) {
      dispatch(deleteKitten(id));
    }
  };

  if (isLoading) return <div className={styles.loading}>Loading...</div>;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.desktopOnlyCell}>PHOTO</th>
          <th>NAME</th>
          <th>BREED</th>
          <th>AGE</th>
          <th>SEX</th>
          <th>PARENTS</th>
          <th>STATUS</th>
          <th>PRICE</th>
          <th style={{ textAlign: "center" }}>ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {kittens.map((kitten) => (
          <tr key={kitten._id}>
            {/* Добавлены data-label ко всем td */}
            <td data-label="PHOTO" className={styles.desktopOnlyCell}>
              <div className={styles.avatarWrapper}>
                <img
                  src={kitten.images[0]?.mobile || "placeholder.jpg"}
                  alt={kitten.nameUa}
                  className={styles.avatar}
                />
              </div>
            </td>
            <td data-label="NAME" className={styles.nameText}>
              {kitten.nameUa}
            </td>
            <td data-label="BREED" className={styles.mutedText}>
              {kitten.breed || "Not specified"}
            </td>
            <td data-label="AGE" className={styles.mutedText}>
              {kitten.birthDay
                ? getPluralWeeks(getKittenAgeInWeeks(kitten.birthDay))
                : "-"}
            </td>
            <td data-label="SEX" className={styles.mutedText}>
              {kitten.sex === "male" ? "♂ Male" : "♀ Female"}
            </td>
            <td data-label="PARENTS" className={styles.parentsCell}>
              <div>{kitten.parentId.dad || "-"}</div>
              <div>{kitten.parentId.mom || "-"}</div>
            </td>
            <td data-label="STATUS">
              <span
                className={`${styles.statusBadge} ${
                  styles[kitten.status?.toLowerCase() || "available"]
                }`}
              >
                {kitten.status || "Available"}
              </span>
            </td>
            <td data-label="PRICE" className={styles.priceText}>
              ${kitten.price?.toLocaleString()}
            </td>
            <td data-label="ACTIONS">
              <div className={styles.actions}>
                <button className={styles.iconBtn} aria-label="View">
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
                  className={styles.iconBtn}
                  onClick={() => editKitten(kitten)}
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
                  onClick={() => handleDelete(kitten._id)}
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
        ))}
      </tbody>
    </table>
  );
};

export default KittensCard;
