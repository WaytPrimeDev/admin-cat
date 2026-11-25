import { useSelector } from "react-redux";
import { useAppDispatch, type RootState } from "../../store";
import { getPluralWeeks } from "../../utils/getPluralWeeks";
import { getKittenAgeInWeeks } from "../../utils/kittenAge";
import styles from "./KittenCard.module.css";
import { deleteKitten } from "../../store/slices/kittensSlice";
import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { Kitten } from "../../types";
import ViewKittenModal from "../ViewKittenModal/ViewKittenModal";

import TelegramPublishModal from "../TelegramPublishModal/TelegramPublishModal";
import { refNameUa } from "../../utils/referenceName";
import SlugLink from "../SlugLink/SlugLink";
import {
  useTableSort,
  type SortDirection,
  type SortState,
  type SortValue,
} from "../../hooks/useTableSort";

// Поля таблицы, по которым разрешена сортировка
type SortKey =
  | "name"
  | "breed"
  | "color"
  | "age"
  | "sex"
  | "parents"
  | "family"
  | "priceBreeding"
  | "pricePet";

const sortableColumns: { key: SortKey; label: string }[] = [
  { key: "name", label: "ИМЯ" },
  { key: "breed", label: "ПОРОДА" },
  { key: "color", label: "ОКРАС" },
  { key: "age", label: "ВОЗРАСТ" },
  { key: "sex", label: "ПОЛ" },
  { key: "parents", label: "РОДИТЕЛИ" },
  { key: "family", label: "СЕМЬЯ" },
  { key: "priceBreeding", label: "ЦЕНА РАЗВЕДЕНИЕ" },
  { key: "pricePet", label: "ЦЕНА ПИТОМЕЦ" },
];

// Панель сортировки для мобильной раскладки: заголовки таблицы там скрыты,
// поэтому поле выбирается селектом, а направление — кнопкой-стрелкой
const MobileSortBar = ({
  sort,
  onApply,
}: {
  sort: SortState<SortKey> | null;
  onApply: (key: SortKey | null, direction?: SortDirection) => void;
}) => (
  <div className={styles.mobileSortBar}>
    <label className={styles.mobileSortLabel} htmlFor="kittens-sort-field">
      Сортировка
    </label>
    <select
      id="kittens-sort-field"
      className={styles.mobileSortSelect}
      value={sort?.key ?? ""}
      onChange={(e) =>
        onApply(
          e.target.value ? (e.target.value as SortKey) : null,
          sort?.direction ?? "asc",
        )
      }
    >
      <option value="">Без сортировки</option>
      {sortableColumns.map(({ key, label }) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
    <button
      type="button"
      className={styles.mobileSortDirBtn}
      disabled={!sort}
      onClick={() =>
        sort && onApply(sort.key, sort.direction === "asc" ? "desc" : "asc")
      }
      title={
        sort?.direction === "desc"
          ? "По убыванию — клик для возрастания"
          : "По возрастанию — клик для убывания"
      }
    >
      <span aria-hidden="true">{sort?.direction === "desc" ? "▲" : "▼"}</span>
      <span className={styles.mobileSortDirText}>
        {sort?.direction === "desc" ? "По убыванию" : "По возрастанию"}
      </span>
    </button>
  </div>
);

// Заголовок-кнопка со стрелкой текущего направления сортировки
const SortableTh = ({
  label,
  sortKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  direction: SortDirection | null;
  onSort: (key: SortKey) => void;
}) => (
  <th
    className={`${styles.sortableTh} ${direction ? styles.sortedTh : ""}`}
    aria-sort={
      direction === "asc"
        ? "ascending"
        : direction === "desc"
          ? "descending"
          : "none"
    }
  >
    <button
      type="button"
      className={styles.sortBtn}
      onClick={() => onSort(sortKey)}
      title={
        direction === "asc"
          ? "Сортировка по возрастанию — клик для убывания"
          : direction === "desc"
            ? "Сортировка по убыванию — клик для сброса"
            : "Сортировать по возрастанию"
      }
    >
      <span>{label}</span>
      <span
        className={`${styles.sortArrow} ${direction ? styles.sortArrowActive : ""}`}
        aria-hidden="true"
      >
        {direction === "asc" ? "▼" : direction === "desc" ? "▲" : "↕"}
      </span>
    </button>
  </th>
);

// Микро-компонент кнопки публикации в Telegram
const TelegramPublishBtn = ({
  kitten,
  initialPublished = false,
}: {
  kitten: Kitten;
  initialPublished?: boolean;
}) => {
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`${styles.socialBtn} ${isPublished ? styles.published : ""}`}
        aria-label="Опубликовать в Telegram"
        title={isPublished ? "Уже в Telegram" : "Опубликовать в Telegram"}
      >
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
      </button>
      {isModalOpen && (
        <TelegramPublishModal
          kitten={kitten}
          isPublished={isPublished}
          onClose={() => setIsModalOpen(false)}
          onPublished={() => setIsPublished(true)}
          onUnpublished={() => setIsPublished(false)}
        />
      )}
    </>
  );
};

const CopyIdBtn = ({ kittenId }: { kittenId: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(kittenId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className={`${styles.iconBtn} ${copied ? styles.textSuccess : ""}`}
      onClick={handleCopy}
      title="Скопировать ID котёнка"
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
  // Предупреждение по итогам удаления: пост в Telegram мог остаться в канале
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);
  const { items: parents } = useSelector((state: RootState) => state.parents);
  const { items: families } = useSelector(
    (state: RootState) => state.families,
  );

  // Семью берём по familyId котёнка, а если поля нет — ищем по составу семьи
  const familyName = useCallback(
    (kitten: Kitten) => {
      const family =
        families.find((f) => f._id === kitten.familyId) ??
        families.find((f) => f.kittens?.includes(kitten._id));
      return family?.name?.trim() || "";
    },
    [families],
  );

  const parentName = useCallback(
    (parentId: string | undefined) => {
      const parent = parents.find((p) => p._id === parentId);
      return parent ? parent.nameUa : "-";
    },
    [parents],
  );

  // Как достать значение для сортировки из каждой колонки:
  // строки сравниваются по алфавиту, числа — по величине
  const sortAccessors = useMemo<
    Record<SortKey, (kitten: Kitten) => SortValue>
  >(
    () => ({
      name: (kitten) => kitten.nameUa,
      breed: (kitten) => refNameUa(kitten.breed, ""),
      color: (kitten) => refNameUa(kitten.color, ""),
      age: (kitten) =>
        kitten.birthDay ? getKittenAgeInWeeks(kitten.birthDay) : null,
      sex: (kitten) => (kitten.sex === "male" ? "Самец" : "Самка"),
      parents: (kitten) =>
        `${parentName(kitten.parentId?.dad)} ${parentName(kitten.parentId?.mom)}`,
      family: (kitten) => familyName(kitten),
      priceBreeding: (kitten) => kitten.price?.breeding ?? null,
      pricePet: (kitten) => kitten.price?.pet ?? null,
    }),
    [parentName, familyName],
  );

  const {
    sortedItems: sortedKittens,
    sort,
    toggleSort,
    applySort,
    directionFor,
  } = useTableSort<Kitten, SortKey>(queryKittens, sortAccessors);

  /*
   * Вместе с котёнком бэкенд снимает его пост и объявление из Telegram.
   * Отказ Telegram удаление не отменяет, но возвращает warning — показываем
   * его отдельным баннером, а не закрываем всё молча как «успешно».
   */
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Удалить этого котёнка?\n\nЕго пост и объявление в Telegram тоже будут удалены.",
    );
    if (!confirmed) return;

    setDeleteWarning(null);
    try {
      const result = await dispatch(deleteKitten(id)).unwrap();
      if (result.telegram?.warning) setDeleteWarning(result.telegram.warning);
    } catch (e) {
      console.error(e);
      setDeleteWarning(
        typeof e === "string" ? e : "Не удалось удалить котёнка.",
      );
    }
  };
  if (isLoading) return <div className={styles.loading}>Загрузка...</div>;

  return (
    <>
      {deleteWarning && (
        <div className={styles.deleteWarning} role="alert">
          <span>⚠️ {deleteWarning}</span>
          <button
            type="button"
            className={styles.deleteWarningClose}
            onClick={() => setDeleteWarning(null)}
            aria-label="Скрыть предупреждение"
          >
            ✕
          </button>
        </div>
      )}
      <MobileSortBar sort={sort} onApply={applySort} />
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.desktopOnlyCell}>ФОТО</th>
            {sortableColumns.map(({ key, label }) => (
              <SortableTh
                key={key}
                label={label}
                sortKey={key}
                direction={directionFor(key)}
                onSort={toggleSort}
              />
            ))}
            <th>СОЦСЕТИ</th>
            <th style={{ textAlign: "center" }}>ДЕЙСТВИЯ</th>
          </tr>
        </thead>
        <tbody>
          {sortedKittens.map((kitten) => (
            <tr key={kitten._id}>
              <td data-label="ФОТО" className={styles.desktopOnlyCell}>
                <div className={styles.avatarWrapper}>
                  <img
                    src={kitten.images[0]?.mobile || "placeholder.jpg"}
                    alt={kitten.nameUa}
                    className={styles.avatar}
                    onClick={() => setViewKitten(kitten)}
                  />
                </div>
              </td>
              <td data-label="ИМЯ" className={styles.nameText}>
                <div>
                  {kitten.nameUa}
                  {/* Видно сразу, у кого видео уже привязано */}
                  {kitten.videoId && (
                    <span
                      className={styles.videoMark}
                      title="Есть видео с YouTube"
                      aria-label="Есть видео с YouTube"
                    >
                      🎬
                    </span>
                  )}
                </div>
                <SlugLink kind="kittens" slug={kitten.slug} compact />
              </td>
              <td data-label="ПОРОДА" className={styles.mutedText}>
                {refNameUa(kitten.breed, "Не указана")}
              </td>
              <td data-label="ОКРАС" className={styles.mutedText}>
                {refNameUa(kitten.color, "Не указан")}
              </td>
              <td data-label="ВОЗРАСТ" className={styles.mutedText}>
                {kitten.birthDay
                  ? getPluralWeeks(getKittenAgeInWeeks(kitten.birthDay))
                  : "-"}
              </td>
              <td data-label="ПОЛ" className={styles.mutedText}>
                {kitten.sex === "male" ? "♂ Самец" : "♀ Самка"}
              </td>
              <td
                data-label="РОДИТЕЛИ"
                className={(styles.parentsCell, styles.mutedText)}
              >
                <div>{parentName(kitten.parentId?.dad)}</div>
                <div>{parentName(kitten.parentId?.mom)}</div>
              </td>
              <td data-label="СЕМЬЯ" className={styles.mutedText}>
                {familyName(kitten) || "Без семьи"}
              </td>
              <td data-label="ЦЕНА РАЗВЕДЕНИЕ" className={styles.priceText}>
                {kitten.price?.breeding != null
                  ? `$${kitten.price.breeding.toLocaleString("ru-RU")}`
                  : "—"}
              </td>
              <td data-label="ЦЕНА ПИТОМЕЦ" className={styles.priceText}>
                {kitten.price?.pet != null
                  ? `$${kitten.price.pet.toLocaleString("ru-RU")}`
                  : "—"}
              </td>

              <td data-label="СОЦСЕТИ">
                <div className={styles.socialsGroup}>
                  <TelegramPublishBtn
                    kitten={kitten}
                    initialPublished={kitten.isTelegramPublished}
                  />
                  <button
                    className={styles.socialBtn}
                    disabled
                    title="Instagram (в разработке)"
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
                    title="Facebook (в разработке)"
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

              <td data-label="ДЕЙСТВИЯ">
                <div className={styles.actions}>
                  <CopyIdBtn kittenId={kitten._id} />

                  <button
                    className={styles.iconBtn}
                    aria-label="Просмотр"
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
                    className={styles.iconBtn}
                    onClick={() => editKitten(kitten)}
                    aria-label="Редактировать"
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
                    aria-label="Удалить"
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
