import { and, eq } from "drizzle-orm";
import type { createDb } from "@/db/client";
import { habitEntries, habits } from "@/db/schema";
import { isValidDateString, todayDateString } from "./dates";
import { isHabitActiveOn } from "./domain";
import { getHabit } from "./queries";
import type { HabitInput } from "./schemas";

type Db = ReturnType<typeof createDb>["db"];

export type ActionResult = { ok: true } | { ok: false; error: string };

function normalizedIntention(intention: string | undefined): string | null {
  const trimmed = intention?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function createHabit(
  db: Db,
  userId: string,
  input: HabitInput,
  now: Date = new Date(),
): ActionResult {
  db.insert(habits)
    .values({
      id: crypto.randomUUID(),
      userId,
      name: input.name,
      color: input.color,
      intention: normalizedIntention(input.intention),
      createdAt: now,
      archivedAt: null,
    })
    .run();
  return { ok: true };
}

export function updateHabit(
  db: Db,
  userId: string,
  habitId: string,
  input: HabitInput,
): ActionResult {
  const habit = getHabit(db, userId, habitId);
  if (!habit) return { ok: false, error: "Hábito não encontrado." };

  db.update(habits)
    .set({
      name: input.name,
      color: input.color,
      intention: normalizedIntention(input.intention),
    })
    .where(eq(habits.id, habitId))
    .run();
  return { ok: true };
}

export function setArchived(
  db: Db,
  userId: string,
  habitId: string,
  archived: boolean,
  now: Date = new Date(),
): ActionResult {
  const habit = getHabit(db, userId, habitId);
  if (!habit) return { ok: false, error: "Hábito não encontrado." };
  if (archived === (habit.archivedAt !== null)) return { ok: true };

  db.update(habits)
    .set({ archivedAt: archived ? now : null })
    .where(eq(habits.id, habitId))
    .run();
  return { ok: true };
}

export function setEntry(
  db: Db,
  userId: string,
  habitId: string,
  date: string,
  done: boolean,
  now: Date = new Date(),
): ActionResult {
  const habit = getHabit(db, userId, habitId);
  if (!habit) return { ok: false, error: "Hábito não encontrado." };
  if (!isValidDateString(date)) return { ok: false, error: "Data inválida." };

  const today = todayDateString(now);
  if (date > today) return { ok: false, error: "Não dá para registrar um dia futuro." };
  if (!isHabitActiveOn(habit, date)) {
    return { ok: false, error: "Esse dia está fora do período do hábito." };
  }

  if (done) {
    db.insert(habitEntries)
      .values({ id: crypto.randomUUID(), habitId, date, createdAt: now })
      .onConflictDoNothing()
      .run();
  } else {
    db.delete(habitEntries)
      .where(and(eq(habitEntries.habitId, habitId), eq(habitEntries.date, date)))
      .run();
  }
  return { ok: true };
}
