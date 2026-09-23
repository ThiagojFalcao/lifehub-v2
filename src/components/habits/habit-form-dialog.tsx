"use client";

import { useState } from "react";
import { createHabit, updateHabit } from "@/lib/habits/actions";
import {
  HABIT_COLORS,
  HABIT_COLOR_KEYS,
  habitColorHex,
  type HabitColor,
} from "@/lib/habits/colors";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type HabitFormValue = {
  id: string;
  name: string;
  color: HabitColor;
  intention: string | null;
};

export function HabitFormDialog({ habit }: { habit?: HabitFormValue }) {
  const editing = habit !== undefined;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(habit?.name ?? "");
  const [color, setColor] = useState<HabitColor>(habit?.color ?? "green");
  const [intention, setIntention] = useState(habit?.intention ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const input = { name, color, intention };
    const result = editing ? await updateHabit(habit.id, input) : await createHabit(input);

    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOpen(false);
    if (!editing) {
      setName("");
      setColor("green");
      setIntention("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant={editing ? "outline" : "default"} />}>
        {editing ? "Editar" : "Adicionar hábito"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar hábito" : "Novo hábito"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="habit-name">Nome</Label>
            <Input
              id="habit-name"
              value={name}
              maxLength={60}
              required
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Cor</legend>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLOR_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-label={HABIT_COLORS[key].label}
                  aria-pressed={color === key}
                  className={`h-8 w-8 rounded-full ${color === key ? "ring-2 ring-offset-2" : ""}`}
                  style={{ backgroundColor: habitColorHex(key) }}
                  onClick={() => setColor(key)}
                />
              ))}
            </div>
          </fieldset>

          <div className="space-y-1">
            <Label htmlFor="habit-intention">Intenção (opcional)</Label>
            <Textarea
              id="habit-intention"
              value={intention}
              maxLength={280}
              placeholder="Se [gatilho], então [ação]"
              onChange={(event) => setIntention(event.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" disabled={saving}>
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
