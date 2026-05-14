import { useSelector } from "react-redux";
import { useAppDispatch, type RootState } from "../../store";
import { getPluralWeeks } from "../../utils/getPluralWeeks";
import { getKittenAgeInWeeks } from "../../utils/kittenAge";
import styles from "./KittenCard.module.css";
import { deleteKitten } from "../../store/slices/kittensSlice";
import { useState, type Dispatch, type SetStateAction } from "react";
import type { Kitten } from "../../types";
import ViewKittenModal from "../ViewKittenModal/ViewKittenModal";

import api from "../../api/axiosInstance";

// Микро-компонент кнопки публикации в Telegram
const TelegramPublishBtn = ({
  kittenId,
  initialPublished = false,
}: {
  kittenId: string;
  initialPublished?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(initialPublished);

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      await api.post(`/tgbot/${kittenId}`);
      setIsPublished(true);
    } catch (error) {
      console.error(error);
      alert("Ошибка публикации");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePublish}
      disabled={isPublished || isLoading}
      className={`${styles.socialBtn} ${isPublished ? styles.published : ""}`}
      aria-label="Publish to Telegram"
      title={isPublished ? "Уже в Telegram" : "Опубликовать в Telegram"}
    >
      {isLoading ? (
        <span className={styles.spinner}>⏳</span>
      ) : (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21.2 2.4L2.2 9.7C1.1 10.1 1.1 10.8 2 11.1l4.9 1.5 1.4 4.5c.2.6.1.7.6.7.4 0 .6-.2.8-.4l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.7L22.3 3.6c.3-1.1-.4-1.6-1.1-1.2z"
            fill={isPublished ? "#16a34a" : "#8a8ab5"}
          />
        </svg>
      )}
    </button>
  );
};

// Микро-компонент копирования ID (приятная фича)
const CopyIdBtn = ({ kittenId }: { kittenId: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(kittenId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Возвращаем иконку через 2 сек
  };

  return (
    <button
      className={`${styles.iconBtn} ${copied ? styles.textSuccess : ""}`}
      onClick={handleCopy}
      title="Copy Kitten ID"
    >
      {copied ? (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16a34a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ) : (
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
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      )}
    </button>
  );
};

interface KittenCardProps {
  editKitten: Dispatch<SetStateAction<Kitten | null>>;
  queryKittens: Kitten[];
}

const KittensCard = ({ editKitten, queryKittens }: KittenCardProps) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useSelector((state: RootState) => state.kittens);
  const [viewKitten, setViewKitten] = useState<Kitten | null>(null);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this kitten?")) {
      dispatch(deleteKitten(id));
    }
  };

  if (isLoading) return <div className={styles.loading}>Loading...</div>;

  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.desktopOnlyCell}>PHOTO</th>
            <th>NAME</th>
            <th>BREED</th>
            <th>COLOR</th>
            <th>AGE</th>
            <th>SEX</th>
            <th>PARENTS</th>
            <th>STATUS</th>
            <th>PRICE</th>
            <th>SOCIALS</th>
            <th style={{ textAlign: "center" }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {queryKittens.map((kitten) => (
            <tr key={kitten._id}>
              <td data-label="PHOTO" className={styles.desktopOnlyCell}>
                <div className={styles.avatarWrapper}>
                  <img
                    src={kitten.images[0]?.mobile || "placeholder.jpg"}
                    alt={kitten.nameUa}
                    className={styles.avatar}
                    onClick={() => setViewKitten(kitten)}
                  />
                </div>
              </td>
              <td data-label="NAME" className={styles.nameText}>
                {kitten.nameUa}
              </td>
              <td data-label="BREED" className={styles.mutedText}>
                {kitten.breed || "Not specified"}
              </td>
              <td data-label="COLOR" className={styles.mutedText}>
                {kitten.color || "Not specified"}
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
                <div>{kitten.parentId?.dad || "-"}</div>
                <div>{kitten.parentId?.mom || "-"}</div>
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
                breeding: ${kitten.price?.breeding?.toLocaleString() || ""},
                pet: ${kitten.price?.pet?.toLocaleString() || ""}
              </td>

              <td data-label="SOCIALS">
                <div className={styles.socialsGroup}>
                  <TelegramPublishBtn
                    kittenId={kitten._id}
                    initialPublished={kitten.isTelegramPublished}
                  />
                  <button
                    className={styles.socialBtn}
                    disabled
                    title="Instagram (В разработке)"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="2"
                        y="2"
                        width="20"
                        height="20"
                        rx="5"
                        ry="5"
                        fill="none"
                        stroke="#8a8ab5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
                        fill="none"
                        stroke="#8a8ab5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="17.5"
                        y1="6.5"
                        x2="17.51"
                        y2="6.5"
                        fill="none"
                        stroke="#8a8ab5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className={styles.socialBtn}
                    disabled
                    title="Facebook (В разработке)"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
                        fill="none"
                        stroke="#8a8ab5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </td>

              <td data-label="ACTIONS">
                <div className={styles.actions}>
                  <CopyIdBtn kittenId={kitten._id} />

                  <button
                    className={styles.iconBtn}
                    aria-label="View"
                    onClick={() => setViewKitten(kitten)}
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
      {viewKitten && (
        <ViewKittenModal
          kitten={viewKitten}
          onClose={() => setViewKitten(null)}
        />
      )}
    </>
  );
};

export default KittensCard;
