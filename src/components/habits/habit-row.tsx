"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { setEntry } from "@/lib/habits/actions";
import { habitColorHex, type HabitColor } from "@/lib/habits/colors";

type HabitRowProps = {
  habit: { id: string; name: string; color: HabitColor };
  date: string;
  done: boolean;
};

export function HabitRow({ habit, date, done }: HabitRowProps) {
  const [optimisticDone, setOptimisticDone] = useOptimistic(done);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    startTransition(async () => {
      setOptimisticDone(!optimisticDone);
      const result = await setEntry(habit.id, date, !optimisticDone);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <li className="flex items-center gap-3 rounded border p-3">
      <span
        aria-hidden
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: habitColorHex(habit.color) }}
      />
      <Link href={`/habits/${habit.id}`} className="flex-1 truncate">
        {habit.name}
      </Link>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
      <button
        type="button"
        aria-label={`${optimisticDone ? "Desmarcar" : "Marcar"} ${habit.name} como feito hoje`}
        aria-pressed={optimisticDone}
        disabled={pending}
        className={`h-9 w-9 rounded-full border text-sm ${
          optimisticDone ? "bg-green-600 text-white" : "bg-transparent"
        }`}
        onClick={toggle}
      >
        ✓
      </button>
    </li>
  );
}
