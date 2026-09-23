"use client";

import { useState } from "react";
import { setArchived } from "@/lib/habits/actions";
import { HabitFormDialog } from "@/components/habits/habit-form-dialog";
import { Button } from "@/components/ui/button";
import type { HabitColor } from "@/lib/habits/colors";

type DetailActionsProps = {
  habit: { id: string; name: string; color: HabitColor; intention: string | null };
  archived: boolean;
};

export function DetailActions({ habit, archived }: DetailActionsProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function toggleArchive(archive: boolean) {
    setPending(true);
    setError(null);
    const result = await setArchived(habit.id, archive);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setConfirming(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <HabitFormDialog habit={habit} />
      {archived ? (
        <Button variant="outline" disabled={pending} onClick={() => toggleArchive(false)}>
          Reativar
        </Button>
      ) : confirming ? (
        <>
          <Button variant="destructive" disabled={pending} onClick={() => toggleArchive(true)}>
            Arquivar mesmo assim
          </Button>
          <Button variant="ghost" onClick={() => setConfirming(false)}>
            Cancelar
          </Button>
        </>
      ) : (
        <Button variant="outline" onClick={() => setConfirming(true)}>
          Arquivar
        </Button>
      )}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
