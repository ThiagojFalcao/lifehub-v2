import { notFound, redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { ArchivedList } from "@/components/habits/archived-list";
import { DetailActions } from "@/components/habits/detail-actions";
import { DetailCalendar } from "@/components/habits/detail-calendar";
import { habitColorHex, toHabitColor } from "@/lib/habits/colors";
import { endOfMonth, startOfMonth, todayDateString } from "@/lib/habits/dates";
import { eligibleDates, habitStats } from "@/lib/habits/domain";
import { getHabit, listHabitEntries, listHabits } from "@/lib/habits/queries";
import { getSessionOrNull } from "@/lib/session";

export default async function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionOrNull();
  if (!session) redirect("/login");

  const { id } = await params;
  const { db } = getDb();
  const userId = session.user.id;
  const habit = getHabit(db, userId, id);
  if (!habit) notFound();

  const today = todayDateString();
  const month = today.slice(0, 7);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const entryDates = listHabitEntries(db, userId, habit.id, "0000-01-01", today);
  const monthEntries = entryDates.filter((date) => date >= monthStart && date <= monthEnd);

  const monthStats = habitStats(habit, entryDates, { start: monthStart, end: monthEnd }, today);
  const totalStats = habitStats(habit, entryDates, { start: "0000-01-01", end: today }, today);

  const calendarDays = eligibleDates(habit, today)
    .filter((date) => date >= monthStart && date <= monthEnd)
    .map((date) => ({ date, active: true, done: monthEntries.includes(date) }));

  const archivedHabits = listHabits(db, userId, { includeArchived: true })
    .filter((item) => item.archivedAt !== null && item.id !== habit.id)
    .map((item) => ({ id: item.id, name: item.name, color: toHabitColor(item.color) }));

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: habitColorHex(toHabitColor(habit.color)) }}
          />
          <h2 className="text-xl font-semibold">{habit.name}</h2>
        </div>
        {habit.intention ? <p className="text-sm text-neutral-600">{habit.intention}</p> : null}
        {habit.archivedAt ? (
          <p className="text-sm text-neutral-500">Arquivado — os registros continuam guardados.</p>
        ) : null}
        <p className="text-sm text-neutral-600">
          Este mês: {monthStats.done}/{monthStats.eligible} dias · Desde a criação:{" "}
          {totalStats.done}/{totalStats.eligible} dias
        </p>
        <DetailActions
          habit={{
            id: habit.id,
            name: habit.name,
            color: toHabitColor(habit.color),
            intention: habit.intention,
          }}
          archived={habit.archivedAt !== null}
        />
      </section>

      <DetailCalendar
        habitId={habit.id}
        color={toHabitColor(habit.color)}
        month={month}
        today={today}
        days={calendarDays}
      />

      <ArchivedList habits={archivedHabits} />
    </div>
  );
}
