import { useSelector } from "react-redux";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { DragOverlay, type DragStartEvent } from "@dnd-kit/core";
import { useState } from "react";

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
  const [activeFamily, setActiveFamily] = useState<Family | null>(null);
  const [expandedFamilyId, setExpandedFamilyId] = useState<string | null>(null);

  // Разделили сенсоры на мышь и тач для безупречной работы на мобилках
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100, // Микро-задержка, чтобы можно было скроллить, если пользователь просто листает страницу
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const current = localFamilies.find((f) => f._id === event.active.id);
    if (current) setActiveFamily(current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      editLocalFamily((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveFamily(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedFamilyId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      {familiesLoading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveFamily(null)}
        >
          <SortableContext
            items={localFamilies.map((f) => f._id)}
            strategy={rectSortingStrategy}
          >
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>FAMILY NAME</th>
                  <th>PARENTS</th>
                  <th>BREED</th>
                  <th>KITTENS</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {localFamilies.map((family) => (
                  <SortableFamilyItem
                    key={family._id}
                    family={family}
                    isReordering={isReordering}
                    isExpanded={expandedFamilyId === family._id}
                    onToggleExpand={() => toggleExpand(family._id)}
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>

          <DragOverlay>
            {activeFamily ? (
              <table
                className={styles.table}
                style={{ width: "100%", background: "transparent" }}
              >
                <tbody>
                  <SortableFamilyItem
                    family={activeFamily}
                    isReordering={isReordering}
                    isOverlay={true}
                    isExpanded={false}
                    onToggleExpand={() => {}}
                  />
                </tbody>
              </table>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </>
  );
};

export default FamilyCard;
