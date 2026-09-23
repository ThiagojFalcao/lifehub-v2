export const HABIT_COLORS = {
  green: { label: "Verde", hex: "#22c55e" },
  blue: { label: "Azul", hex: "#3b82f6" },
  purple: { label: "Roxo", hex: "#a855f7" },
  pink: { label: "Rosa", hex: "#ec4899" },
  orange: { label: "Laranja", hex: "#f97316" },
  yellow: { label: "Amarelo", hex: "#eab308" },
  teal: { label: "Turquesa", hex: "#14b8a6" },
  red: { label: "Vermelho", hex: "#ef4444" },
} as const;

export type HabitColor = keyof typeof HABIT_COLORS;

export const HABIT_COLOR_KEYS = Object.keys(HABIT_COLORS) as HabitColor[];

export function habitColorHex(color: HabitColor): string {
  return HABIT_COLORS[color].hex;
}

export function toHabitColor(value: string): HabitColor {
  return (HABIT_COLOR_KEYS as string[]).includes(value) ? (value as HabitColor) : "green";
}
