"use client";

import { useState } from "react";
import Link from "next/link";
import { setArchived } from "@/lib/habits/actions";
import { habitColorHex, type HabitColor } from "@/lib/habits/colors";

type ArchivedListProps = {
  habits: { id: string; name: string; color: HabitColor }[];
};

export function ArchivedList({ habits }: ArchivedListProps) {
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReactivate(id: string) {
    setPendingId(id);
    setError(null);
    const result = await setArchived(id, false);
    setPendingId(null);
    if (!result.ok) setError(result.error);
  }

  if (habits.length === 0) return null;

  return (
    <section className="rounded border p-4">
      <button
        type="button"
        className="text-sm font-medium"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        Arquivados ({habits.length})
      </button>
      {open ? (
        <ul className="mt-3 space-y-2">
          {habits.map((habit) => (
            <li key={habit.id} className="flex items-center gap-3 rounded border p-3">
              <span
                aria-hidden
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: habitColorHex(habit.color) }}
              />
              <Link href={`/habits/${habit.id}`} className="flex-1 truncate">
                {habit.name}
              </Link>
              <button
                type="button"
                className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
                disabled={pendingId === habit.id}
                onClick={() => handleReactivate(habit.id)}
              >
                Reativar
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
