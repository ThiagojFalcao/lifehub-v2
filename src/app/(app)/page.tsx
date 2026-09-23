import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { ArchivedList } from "@/components/habits/archived-list";
import { HabitFormDialog } from "@/components/habits/habit-form-dialog";
import { HabitList } from "@/components/habits/habit-list";
import { MonthCalendar } from "@/components/habits/month-calendar";
import { WeekChart } from "@/components/habits/week-chart";
import { toHabitColor } from "@/lib/habits/colors";
import { endOfMonth, startOfMonth, startOfWeek, todayDateString } from "@/lib/habits/dates";
import { buildMonthOverview, buildWeekSeries, isHabitActiveOn } from "@/lib/habits/domain";
import { listEntriesBetween, listHabits } from "@/lib/habits/queries";
import { getSessionOrNull } from "@/lib/session";

export default async function HomePage() {
  const session = await getSessionOrNull();
  if (!session) redirect("/login");

  const { db } = getDb();
  const userId = session.user.id;
  const today = todayDateString();
  const allHabits = listHabits(db, userId, { includeArchived: true });
  const activeHabits = allHabits.filter((habit) => habit.archivedAt === null);
  const monthEntries = listEntriesBetween(db, userId, startOfMonth(today), endOfMonth(today));
  const doneToday = monthEntries
    .filter((entry) => entry.date === today)
    .map((entry) => entry.habitId);
  const habitSummaries = activeHabits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    color: toHabitColor(habit.color),
  }));
  const archivedHabits = allHabits.filter((habit) => habit.archivedAt !== null);
  const archivedSummaries = archivedHabits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    color: toHabitColor(habit.color),
  }));
  const weekEntries = listEntriesBetween(db, userId, startOfWeek(today), today);
  const weekSeries = buildWeekSeries(allHabits, weekEntries, today);
  const month = today.slice(0, 7);
  const monthOverview = buildMonthOverview(allHabits, monthEntries, month);
  const calendarHabits = allHabits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    color: toHabitColor(habit.color),
  }));

  const habitsByDate: Record<string, string[]> = {};
  const entriesByDate: Record<string, string[]> = {};
  for (const entry of monthEntries) {
    entriesByDate[entry.date] = [...(entriesByDate[entry.date] ?? []), entry.habitId];
  }
  for (const day of monthOverview) {
    habitsByDate[day.date] = allHabits
      .filter((habit) => isHabitActiveOn(habit, day.date))
      .map((habit) => habit.id);
  }

  return (
    <div className="space-y-6">
      <WeekChart series={weekSeries} />
      <MonthCalendar
        month={month}
        today={today}
        days={monthOverview}
        habits={calendarHabits}
        habitsByDate={habitsByDate}
        entriesByDate={entriesByDate}
      />
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Hábitos</h2>
          <HabitFormDialog />
        </div>
        {activeHabits.length === 0 ? (
          <div className="rounded border border-dashed p-6 text-center text-sm text-neutral-500">
            <p className="font-medium text-neutral-700">Nenhum hábito ainda</p>
            <p className="mt-1">Comece pequeno: um hábito, um dia de cada vez.</p>
          </div>
        ) : (
          <HabitList habits={habitSummaries} date={today} doneIds={doneToday} />
        )}
      </section>
      <ArchivedList habits={archivedSummaries} />
    </div>
  );
}
