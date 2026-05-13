import { useSelector } from "react-redux";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,

} from "@dnd-kit/sortable";

import styles from "./FamilyCard.module.css";

import SortableFamilyItem from "../SortableFamilyItem/SortableFamilyItem";

import type { RootState } from "../../store";
import type { Dispatch, SetStateAction } from "react";
import type { Family } from "../../types";

interface FamilyCardProps {
  editLocalFamily: Dispatch<SetStateAction<Family[]>>;
  localFamilies: Family[];
  isReordering: boolean;
}

const FamilyCard = ({
  editLocalFamily,
  localFamilies,
  isReordering,
}: FamilyCardProps) => {
  const { isLoading: familiesLoading } = useSelector(
    (state: RootState) => state.families,
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      editLocalFamily((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <>
      {familiesLoading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localFamilies.map((f) => f._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className={styles.list}>
              {localFamilies.map((family) => (
                <SortableFamilyItem
                  key={family._id}
                  family={family}
                  isReordering={isReordering}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </>
  );
};
export default FamilyCard;
