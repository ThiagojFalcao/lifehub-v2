"use client";

import { useOptimistic, useState, useTransition } from "react";
import { setEntry } from "@/lib/habits/actions";
import { habitColorHex, type HabitColor } from "@/lib/habits/colors";
import { formatLongDate, formatMonthLabel, monthDates } from "@/lib/habits/dates";

type DetailDay = { date: string; active: boolean; done: boolean };

type DetailCalendarProps = {
  habitId: string;
  color: HabitColor;
  month: string;
  today: string;
  days: DetailDay[];
};

export function DetailCalendar({ habitId, color, month, today, days }: DetailCalendarProps) {
  const [optimisticDays, setOptimisticDays] = useOptimistic(
    days,
    (state, change: { date: string; done: boolean }) =>
      state.map((day) => (day.date === change.date ? { ...day, done: change.done } : day)),
  );
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const byDate = new Map(optimisticDays.map((day) => [day.date, day]));
  const leadingBlanks = new Date(
    Number(month.slice(0, 4)),
    Number(month.slice(5, 7)) - 1,
    1,
  ).getDay();

  function toggle(day: DetailDay) {
    setError(null);
    startTransition(async () => {
      setOptimisticDays({ date: day.date, done: !day.done });
      const result = await setEntry(habitId, day.date, !day.done);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <section aria-label="Calendário do hábito" className="rounded border p-4">
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
        {monthDates(month).map((date) => {
          const day = byDate.get(date) ?? { date, active: false, done: false };
          const disabled = !day.active || date > today;
          return (
            <button
              key={date}
              type="button"
              data-date={date}
              data-done={day.done ? "true" : "false"}
              aria-label={formatLongDate(date)}
              disabled={disabled}
              onClick={() => toggle(day)}
              className={`aspect-square rounded text-xs ${
                day.done ? "text-white" : "bg-neutral-100"
              } ${disabled ? "opacity-40" : ""}`}
              style={day.done ? { backgroundColor: habitColorHex(color) } : undefined}
            >
              {Number(date.slice(8, 10))}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
