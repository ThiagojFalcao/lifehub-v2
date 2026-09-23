import { z } from "zod";
import { HABIT_COLOR_KEYS, type HabitColor } from "./colors";

export const habitInputSchema = z.object({
  name: z.string().trim().min(1, "Dê um nome ao hábito").max(60, "Máximo de 60 caracteres"),
  color: z.enum(HABIT_COLOR_KEYS as [HabitColor, ...HabitColor[]]),
  intention: z.string().trim().max(280, "Máximo de 280 caracteres").optional(),
});

export type HabitInput = z.infer<typeof habitInputSchema>;

export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida");
