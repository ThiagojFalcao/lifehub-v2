import { and, asc, eq, gte, isNull, lte } from "drizzle-orm";
import type { createDb } from "@/db/client";
import { habitEntries, habits } from "@/db/schema";

type Db = ReturnType<typeof createDb>["db"];

export function listHabits(db: Db, userId: string, options: { includeArchived?: boolean } = {}) {
  const where = options.includeArchived
    ? eq(habits.userId, userId)
    : and(eq(habits.userId, userId), isNull(habits.archivedAt));

  return db.select().from(habits).where(where).orderBy(asc(habits.createdAt), asc(habits.id)).all();
}

export function getHabit(db: Db, userId: string, habitId: string) {
  return db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .get();
}

export function listEntriesBetween(db: Db, userId: string, startDate: string, endDate: string) {
  return db
    .select({ habitId: habitEntries.habitId, date: habitEntries.date })
    .from(habitEntries)
    .innerJoin(habits, eq(habitEntries.habitId, habits.id))
    .where(
      and(
        eq(habits.userId, userId),
        gte(habitEntries.date, startDate),
        lte(habitEntries.date, endDate),
      ),
    )
    .orderBy(asc(habitEntries.date))
    .all();
}

export function listHabitEntries(
  db: Db,
  userId: string,
  habitId: string,
  startDate: string,
  endDate: string,
): string[] {
  return db
    .select({ date: habitEntries.date })
    .from(habitEntries)
    .innerJoin(habits, eq(habitEntries.habitId, habits.id))
    .where(
      and(
        eq(habits.id, habitId),
        eq(habits.userId, userId),
        gte(habitEntries.date, startDate),
        lte(habitEntries.date, endDate),
      ),
    )
    .orderBy(asc(habitEntries.date))
    .all()
    .map((row) => row.date);
}
