import { useSelector } from "react-redux";

import styles from "./ParentCard.module.css";
import { useAppDispatch, type RootState } from "../../store";
import type { Dispatch, SetStateAction } from "react";
import type { Parent } from "../../types";
import { deleteParent } from "../../store/slices/parentsSlice";

interface ParentCardProps {
  editParent: Dispatch<SetStateAction<Parent | null>>;
}

const ParentCard = ({ editParent }: ParentCardProps) => {
  const dispatch = useAppDispatch();
  const { items: parents, isLoading } = useSelector(
    (state: RootState) => state.parents,
  );

  const handleDelete = (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этого родителя?")) {
      dispatch(deleteParent(id));
    }
  };

  return (
    <>
      {isLoading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : (
        <div className={styles.grid}>
          {parents.map((parent) => (
            <div key={parent._id} className={styles.card}>
              <div className={styles.photos}>
                {parent.images.map((photo, index) => (
                  <img
                    key={index}
                    src={photo.full}
                    alt={`${parent.nameEn} ${index + 1}`}
                  />
                ))}
              </div>
              <div className={styles.info}>
                <h3>{parent.nameUa}</h3>
                <p>Порода: {parent.breed || "Не указана"}</p>
              </div>
              <button
                className={styles.editBtn}
                onClick={() => editParent(parent)}
              >
                Редактировать
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(parent._id)}
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ParentCard;
