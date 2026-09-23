import { and, eq } from "drizzle-orm";
import type { createDb } from "@/db/client";
import { habitEntries, habits } from "@/db/schema";
import type { HabitColor } from "./colors";
import { addDays, todayDateString } from "./dates";

type Db = ReturnType<typeof createDb>["db"];

const DEMO_HABITS: { name: string; color: HabitColor; intention: string | null }[] = [
  { name: "Exercício", color: "green", intention: "Se acordar, então me movo por 20 minutos" },
  { name: "Leitura", color: "blue", intention: "Se deitar, então leio 10 páginas" },
  { name: "Beber água", color: "teal", intention: null },
  { name: "Meditar", color: "purple", intention: "Se sentar no sofá, então respiro por 5 minutos" },
];

const DEMO_DAYS = 60;

export function seedDemo(
  db: Db,
  userId: string,
  options: { now?: Date } = {},
): { habits: number; entries: number } {
  const now = options.now ?? new Date();
  const today = todayDateString(now);
  const start = addDays(today, -(DEMO_DAYS - 1));

  let createdHabits = 0;
  let createdEntries = 0;

  DEMO_HABITS.forEach((demo, habitIndex) => {
    const existing = db
      .select({ id: habits.id })
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.name, demo.name)))
      .get();
    if (existing) return;

    const habitId = crypto.randomUUID();
    db.insert(habits)
      .values({
        id: habitId,
        userId,
        name: demo.name,
        color: demo.color,
        intention: demo.intention,
        createdAt: new Date(start + "T00:00:00"),
        archivedAt: null,
      })
      .run();
    createdHabits += 1;

    for (let dayIndex = 0; dayIndex < DEMO_DAYS; dayIndex += 1) {
      if ((dayIndex + habitIndex) % 4 === 0) continue; // ~75% de conclusão, determinístico
      db.insert(habitEntries)
        .values({
          id: crypto.randomUUID(),
          habitId,
          date: addDays(start, dayIndex),
          createdAt: now,
        })
        .onConflictDoNothing()
        .run();
      createdEntries += 1;
    }
  });

  return { habits: createdHabits, entries: createdEntries };
}
