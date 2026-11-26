/*
 * Иконки кнопок справочников (породы, окрасы).
 * Линейные SVG 1em — цвет наследуют от кнопки, размер от её шрифта.
 */

const base = {
  viewBox: "0 0 24 24",
  width: "1em",
  height: "1em",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export const PlusIcon = () => (
  <svg {...base} strokeWidth={2.4} style={{ fontSize: "1.15em" }}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const PencilIcon = () => (
  <svg {...base}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const TrashIcon = () => (
  <svg {...base}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    <path d="M10 11v5M14 11v5" />
  </svg>
);

export const ImageOffIcon = () => (
  <svg {...base} strokeWidth={1.8} style={{ fontSize: "1.25em" }}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="9" cy="9.5" r="1.6" />
    <path d="M21 16l-5-5-6 6" />
  </svg>
);
