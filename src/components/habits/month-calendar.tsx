"use client";

import { useState } from "react";
import type { DayOverview } from "@/lib/habits/domain";
import { formatLongDate, formatMonthLabel, monthDates } from "@/lib/habits/dates";
import { DayPanel } from "@/components/habits/day-panel";
import type { HabitColor } from "@/lib/habits/colors";

type CalendarHabit = { id: string; name: string; color: HabitColor };

type MonthCalendarProps = {
  month: string;
  today: string;
  days: DayOverview[];
  habits: CalendarHabit[];
  habitsByDate: Record<string, string[]>;
  entriesByDate: Record<string, string[]>;
};

const LEVEL_CLASSES = [
  "bg-neutral-100",
  "bg-green-100",
  "bg-green-300",
  "bg-green-600 text-white",
] as const;

export function MonthCalendar({
  month,
  today,
  days,
  habits,
  habitsByDate,
  entriesByDate,
}: MonthCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const overviewByDate = new Map(days.map((day) => [day.date, day]));
  const dates = monthDates(month);
  const leadingBlanks = new Date(
    Number(month.slice(0, 4)),
    Number(month.slice(5, 7)) - 1,
    1,
  ).getDay();
  const habitById = new Map(habits.map((habit) => [habit.id, habit]));

  const selectedHabits = selectedDate
    ? (habitsByDate[selectedDate] ?? [])
        .map((id) => habitById.get(id))
        .filter((habit) => habit !== undefined)
    : [];

  return (
    <section aria-label="Calendário do mês" className="rounded border p-4">
      <h2 className="text-lg font-semibold capitalize">{formatMonthLabel(month)}</h2>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-neutral-500">
        {["dom", "seg", "ter", "qua", "qui", "sex", "sáb"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }, (_, index) => (
          <span key={`blank-${index}`} />
        ))}
        {dates.map((date) => {
          const overview = overviewByDate.get(date) ?? {
            date,
            active: 0,
            done: 0,
            ratio: 0,
            level: 0 as const,
          };
          const disabled = date > today || overview.active === 0;
          return (
            <button
              key={date}
              type="button"
              data-date={date}
              data-level={overview.level}
              aria-label={formatLongDate(date)}
              disabled={disabled}
              onClick={() => setSelectedDate(date)}
              className={`aspect-square rounded text-xs ${LEVEL_CLASSES[overview.level]} ${
                date === today ? "ring-2 ring-neutral-900" : ""
              } ${disabled ? "opacity-40" : ""}`}
            >
              {Number(date.slice(8, 10))}
            </button>
          );
        })}
      </div>

      <DayPanel
        date={selectedDate}
        habits={selectedHabits}
        doneIds={selectedDate ? (entriesByDate[selectedDate] ?? []) : []}
        onClose={() => setSelectedDate(null)}
      />
    </section>
  );
}
