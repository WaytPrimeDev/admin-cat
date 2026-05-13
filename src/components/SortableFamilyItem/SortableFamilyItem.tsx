import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSelector } from "react-redux";

import styles from "./SortableFamily.module.css";

import { useAppDispatch, type RootState } from "../../store";
import { deleteFamily } from "../../store/slices/familiesSlice";
import { fetchKittens } from "../../store/slices/kittensSlice";
import { fetchParents } from "../../store/slices/parentsSlice";
import type { Family } from "../../types";

interface SortableFamilyItemProps {
  family: Family;
  isReordering: boolean;
}

const SortableFamilyItem = ({
  family,
  isReordering,
}: SortableFamilyItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: family._id });

  const dispatch = useAppDispatch();

  const { items: parents } = useSelector((state: RootState) => state.parents);

  const { items: kittens } = useSelector((state: RootState) => state.kittens);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isReordering ? "grab" : "default",
    opacity: isReordering ? 0.9 : 1,
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.card}
      {...(isReordering ? attributes : {})}
      {...(isReordering ? listeners : {})}
    >
      <div className={styles.info}>
        <h3>
          {isReordering && "↕️ "} {/* Индикатор перетаскивания */}
          {family.name}
        </h3>
        <p>
          Котята:{" "}
          {family.kittens
            .map((id: string) => kittens.find((k) => k._id === id)?.nameUa)
            .join(", ")}
        </p>
        <p>
          Мама:{" "}
          {family.parents.mom
            ? parents.find((p) => p._id === family.parents.mom)?.nameUa
            : "Не указана"}
        </p>
        <p>
          Папа:{" "}
          {family.parents.dad
            ? parents.find((p) => p._id === family.parents.dad)?.nameUa
            : "Не указан"}
        </p>
      </div>

      {/* Прячем кнопки редактирования/удаления во время сортировки, чтобы они не мешали */}
      {!isReordering && (
        <>
          <button className={styles.editBtn}>Редактировать</button>
          <button
            className={styles.deleteBtn}
            onClick={() => handleDelete(family._id)}
          >
            Удалить
          </button>
        </>
      )}
    </div>
  );
};
export default SortableFamilyItem;
