import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

/**
 * Сенсоры для перетаскивания фото.
 *
 * PointerSensor один на всё не годится: на телефоне и планшете он требует
 * touch-action: none, иначе браузер забирает жест себе и фото не двигаются.
 * Поэтому мышь и тач разделены:
 * - мышь тянет сразу (после 5px, чтобы клик по "×" оставался кликом);
 * - палец тянет после долгого нажатия, так страница внутри списка
 *   по-прежнему скроллится, а tolerance отменяет захват, если палец поехал.
 */
export const usePhotoDndSensors = () =>
  useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
