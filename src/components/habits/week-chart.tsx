"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type WeekChartProps = {
  series: { date: string; active: number; done: number }[];
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: readonly { payload?: { done: number; active: number } }[];
};

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  const day = payload?.[0]?.payload;
  if (!active || !day) return null;
  return (
    <div className="rounded border bg-white px-2 py-1 text-xs shadow">
      {day.done} de {day.active} hábitos
    </div>
  );
}

const WEEKDAY_LABELS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function weekdayLabel(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return WEEKDAY_LABELS[new Date(year, month - 1, day).getDay()];
}

export function WeekChart({ series }: WeekChartProps) {
  const today = series.at(-1);
  const data = series.map((day) => ({ ...day, label: weekdayLabel(day.date) }));

  return (
    <section aria-label="Hábitos concluídos por dia nesta semana" className="rounded border p-4">
      <h2 className="text-lg font-semibold">Sua semana</h2>
      <div className="mt-2 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
            <Tooltip content={<ChartTooltip />} />
            <Line
              name="Concluídos"
              type="monotone"
              dataKey="done"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 3 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-sm text-neutral-500">
        {today && today.active > 0
          ? `Hoje: ${today.done} de ${today.active} hábitos`
          : "Nenhum hábito ativo ainda"}
      </p>
    </section>
  );
}
