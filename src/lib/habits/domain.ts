import { addDays, monthDates, toDateString, weekDates } from "./dates";

export type HabitLike = {
  id: string;
  createdAt: Date;
  archivedAt: Date | null;
};

export type EntryLike = {
  habitId: string;
  date: string;
};

export type DayOverview = {
  date: string;
  active: number;
  done: number;
  ratio: number;
  level: 0 | 1 | 2 | 3;
};

export type WeekDay = DayOverview & {
  future: boolean;
};

export type HabitStats = {
  done: number;
  eligible: number;
};

export function isHabitActiveOn(habit: HabitLike, date: string): boolean {
  if (date < toDateString(habit.createdAt)) return false;
  if (habit.archivedAt !== null && date >= toDateString(habit.archivedAt)) return false;
  return true;
}

export function eligibleDates(habit: HabitLike, today: string): string[] {
  const start = toDateString(habit.createdAt);
  const archivedEnd = habit.archivedAt ? addDays(toDateString(habit.archivedAt), -1) : today;
  const end = archivedEnd > today ? today : archivedEnd;
  const dates: string[] = [];
  for (let date = start; date <= end; date = addDays(date, 1)) dates.push(date);
  return dates;
}

export function buildDayOverview(
  habits: HabitLike[],
  entries: EntryLike[],
  date: string,
): DayOverview {
  const activeIds = new Set(
    habits.filter((habit) => isHabitActiveOn(habit, date)).map((habit) => habit.id),
  );
  const done = entries.filter(
    (entry) => entry.date === date && activeIds.has(entry.habitId),
  ).length;
  const active = activeIds.size;
  const ratio = active === 0 ? 0 : done / active;
  return { date, active, done, ratio, level: intensityLevel(ratio) };
}

export function buildMonthOverview(
  habits: HabitLike[],
  entries: EntryLike[],
  month: string,
): DayOverview[] {
  return monthDates(month).map((date) => buildDayOverview(habits, entries, date));
}

export function buildWeekSeries(
  habits: HabitLike[],
  entries: EntryLike[],
  today: string,
): WeekDay[] {
  return weekDates(today).map((date) => ({
    ...buildDayOverview(habits, entries, date),
    future: date > today,
  }));
}

export function habitStats(
  habit: HabitLike,
  entryDates: string[],
  range: { start: string; end: string },
  today: string,
): HabitStats {
  const eligible = eligibleDates(habit, today).filter(
    (date) => date >= range.start && date <= range.end,
  );
  const eligibleSet = new Set(eligible);
  const done = entryDates.filter((date) => eligibleSet.has(date)).length;
  return { done, eligible: eligible.length };
}

export function intensityLevel(ratio: number): 0 | 1 | 2 | 3 {
  if (ratio <= 0) return 0;
  if (ratio < 0.5) return 1;
  if (ratio < 1) return 2;
  return 3;
}
