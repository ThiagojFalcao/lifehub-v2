"use client";

import { useOptimistic, useState, useTransition } from "react";
import { setEntry } from "@/lib/habits/actions";
import { habitColorHex, type HabitColor } from "@/lib/habits/colors";
import { formatLongDate } from "@/lib/habits/dates";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type DayPanelHabit = { id: string; name: string; color: HabitColor };

type DayPanelProps = {
  date: string | null;
  habits: DayPanelHabit[];
  doneIds: string[];
  onClose: () => void;
};

export function DayPanel({ date, habits, doneIds, onClose }: DayPanelProps) {
  const [done, setDone] = useOptimistic(doneIds);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(habitId: string) {
    if (!date) return;
    const isDone = done.includes(habitId);
    setError(null);
    startTransition(async () => {
      setDone(isDone ? done.filter((id) => id !== habitId) : [...done, habitId]);
      const result = await setEntry(habitId, date, !isDone);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <Sheet open={date !== null} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <SheetContent aria-label="Painel do dia" aria-labelledby={undefined}>
        <SheetHeader>
          <SheetTitle>{date ? formatLongDate(date) : ""}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {habits.length === 0 ? (
            <p className="text-sm text-neutral-500">Nenhum hábito ativo neste dia.</p>
          ) : (
            habits.map((habit) => {
              const isDone = done.includes(habit.id);
              return (
                <div key={habit.id} className="flex items-center gap-3 rounded border p-3">
                  <span
                    aria-hidden
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: habitColorHex(habit.color) }}
                  />
                  <span className="flex-1 truncate">{habit.name}</span>
                  <button
                    type="button"
                    aria-label={`${isDone ? "Desmarcar" : "Marcar"} ${habit.name} como feito`}
                    aria-pressed={isDone}
                    disabled={pending}
                    className={`h-9 w-9 rounded-full border text-sm ${
                      isDone ? "bg-green-600 text-white" : "bg-transparent"
                    }`}
                    onClick={() => toggle(habit.id)}
                  >
                    ✓
                  </button>
                </div>
              );
            })
          )}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
