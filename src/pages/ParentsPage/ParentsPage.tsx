import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import styles from "./ParentsPage.module.css";
import EditParentForm from "../../components/Parents/EditParentForm";
import ParentCard from "../../components/ParentCard/ParentCard";
import AddParentForm from "../../components/AddParentForm/AddParentForm";

import type { Parent } from "../../types";
import { fetchParents } from "../../store/slices/parentsSlice";
import { useAppDispatch, type RootState } from "../../store";
import { fetchBreeds, fetchColors } from "../../store/slices/filterSlice";

const ParentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: parents, error } = useSelector(
    (state: RootState) => state.parents,
  );
  const [showForm, setShowForm] = useState(false);

  const [editingParent, setEditingParent] = useState<Parent | null>(null);

  useEffect(() => {
    dispatch(fetchColors());
    dispatch(fetchBreeds());
    dispatch(fetchParents());
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Родители</h2>
        <button
          className={styles.addBtn}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Отмена" : "Добавить родителя"}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {showForm && <AddParentForm editShowForm={setShowForm} />}

      {editingParent && (
        <EditParentForm
          parent={editingParent}
          onClose={() => setEditingParent(null)}
        />
      )}

      {parents ? (
        <ParentCard editParent={setEditingParent} />
      ) : (
        <p>упс, родителя пока нет</p>
      )}
    </div>
  );
};

export default ParentsPage;
