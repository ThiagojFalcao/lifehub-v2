import { describe, expect, it } from "vitest";
import {
  buildMonthOverview,
  buildWeekSeries,
  eligibleDates,
  habitStats,
  intensityLevel,
  isHabitActiveOn,
  type HabitLike,
} from "@/lib/habits/domain";

function habit(overrides: Partial<HabitLike> = {}): HabitLike {
  return {
    id: "h1",
    createdAt: new Date(2026, 8, 1, 12, 0),
    archivedAt: null,
    ...overrides,
  };
}

describe("isHabitActiveOn", () => {
  it("não é ativo antes da criação", () => {
    expect(isHabitActiveOn(habit(), "2026-08-31")).toBe(false);
    expect(isHabitActiveOn(habit(), "2026-09-01")).toBe(true);
  });

  it("não é ativo a partir do dia do arquivamento", () => {
    const archived = habit({ archivedAt: new Date(2026, 8, 10, 8, 0) });
    expect(isHabitActiveOn(archived, "2026-09-09")).toBe(true);
    expect(isHabitActiveOn(archived, "2026-09-10")).toBe(false);
    expect(isHabitActiveOn(archived, "2026-09-11")).toBe(false);
  });
});

describe("eligibleDates", () => {
  it("vai da criação até hoje", () => {
    expect(eligibleDates(habit(), "2026-09-03")).toEqual([
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
    ]);
  });

  it("termina no dia anterior ao arquivamento", () => {
    const archived = habit({ archivedAt: new Date(2026, 8, 3, 8, 0) });
    expect(eligibleDates(archived, "2026-09-10")).toEqual(["2026-09-01", "2026-09-02"]);
  });
});

describe("buildMonthOverview", () => {
  it("conta ativos e concluídos por dia, ignorando entradas fora do período", () => {
    const active = habit();
    const archived = habit({
      id: "h2",
      createdAt: new Date(2026, 7, 20, 12, 0),
      archivedAt: new Date(2026, 8, 5, 8, 0),
    });
    const entries = [
      { habitId: "h1", date: "2026-09-02" },
      { habitId: "h2", date: "2026-09-02" },
      { habitId: "h2", date: "2026-09-06" }, // fora do período (arquivado em 05)
    ];

    const overview = buildMonthOverview([active, archived], entries, "2026-09");
    const byDate = new Map(overview.map((day) => [day.date, day]));

    expect(byDate.get("2026-09-01")).toMatchObject({ active: 2, done: 0 });
    expect(byDate.get("2026-09-02")).toMatchObject({ active: 2, done: 2 });
    expect(byDate.get("2026-09-05")).toMatchObject({ active: 1, done: 0 });
    expect(byDate.get("2026-09-06")).toMatchObject({ active: 1, done: 0 });
    expect(overview).toHaveLength(30);
  });
});

describe("buildWeekSeries", () => {
  it("vai de domingo a sábado, marcando os dias futuros", () => {
    const series = buildWeekSeries(
      [habit({ createdAt: new Date(2026, 8, 21, 12, 0) })],
      [],
      "2026-09-23",
    );
    expect(series.map((day) => day.date)).toEqual([
      "2026-09-20",
      "2026-09-21",
      "2026-09-22",
      "2026-09-23",
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
    ]);
    expect(series.map((day) => day.future)).toEqual([false, false, false, false, true, true, true]);
    expect(series[0]).toMatchObject({ active: 0, done: 0, future: false });
    expect(series[4]).toMatchObject({ future: true });
  });
});

describe("habitStats", () => {
  it("conta apenas dias elegíveis dentro do recorte", () => {
    const stats = habitStats(
      habit(),
      ["2026-09-01", "2026-09-02", "2026-09-04"],
      { start: "2026-09-01", end: "2026-09-30" },
      "2026-09-03",
    );
    expect(stats).toEqual({ done: 2, eligible: 3 });
  });

  it("respeita o arquivamento", () => {
    const archived = habit({ archivedAt: new Date(2026, 8, 3, 8, 0) });
    const stats = habitStats(
      archived,
      ["2026-09-01", "2026-09-03"],
      {
        start: "2026-09-01",
        end: "2026-09-30",
      },
      "2026-09-10",
    );
    expect(stats).toEqual({ done: 1, eligible: 2 });
  });
});

describe("intensityLevel", () => {
  it("mapeia a fração para 4 níveis", () => {
    expect(intensityLevel(0)).toBe(0);
    expect(intensityLevel(0.33)).toBe(1);
    expect(intensityLevel(0.5)).toBe(2);
    expect(intensityLevel(0.99)).toBe(2);
    expect(intensityLevel(1)).toBe(3);
  });
});
