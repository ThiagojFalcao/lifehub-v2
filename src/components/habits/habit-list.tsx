import { HabitRow } from "@/components/habits/habit-row";
import type { HabitColor } from "@/lib/habits/colors";

type HabitListProps = {
  habits: { id: string; name: string; color: HabitColor }[];
  date: string;
  doneIds: string[];
};

export function HabitList({ habits, date, doneIds }: HabitListProps) {
  const done = new Set(doneIds);
  return (
    <ul className="space-y-2">
      {habits.map((habit) => (
        <HabitRow key={habit.id} habit={habit} date={date} done={done.has(habit.id)} />
      ))}
    </ul>
  );
}
