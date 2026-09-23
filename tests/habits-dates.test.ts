import { describe, expect, it } from "vitest";
import {
  addDays,
  endOfMonth,
  formatLongDate,
  formatMonthLabel,
  isValidDateString,
  monthDates,
  parseDateString,
  startOfMonth,
  startOfWeek,
  toDateString,
  todayDateString,
  weekDates,
} from "@/lib/habits/dates";

describe("toDateString / todayDateString", () => {
  it("usa o dia local, não UTC", () => {
    expect(toDateString(new Date(2026, 8, 23, 23, 30))).toBe("2026-09-23");
    expect(todayDateString(new Date(2026, 0, 1, 0, 5))).toBe("2026-01-01");
  });
});

describe("parseDateString / isValidDateString", () => {
  it("faz roundtrip de datas válidas", () => {
    expect(toDateString(parseDateString("2026-09-23"))).toBe("2026-09-23");
    expect(isValidDateString("2026-09-23")).toBe(true);
    expect(isValidDateString("2026-02-29")).toBe(false);
    expect(isValidDateString("2028-02-29")).toBe(true);
    expect(isValidDateString("23/09/2026")).toBe(false);
    expect(isValidDateString("2026-9-3")).toBe(false);
  });
});

describe("addDays", () => {
  it("atravessa mês e ano", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("mês", () => {
  it("startOfMonth / endOfMonth", () => {
    expect(startOfMonth("2026-09-23")).toBe("2026-09-01");
    expect(endOfMonth("2026-09-23")).toBe("2026-09-30");
    expect(endOfMonth("2026-02-10")).toBe("2026-02-28");
    expect(endOfMonth("2028-02-10")).toBe("2028-02-29");
  });

  it("monthDates devolve todos os dias do mês", () => {
    expect(monthDates("2026-09")).toHaveLength(30);
    expect(monthDates("2026-02")).toHaveLength(28);
    expect(monthDates("2026-09")[0]).toBe("2026-09-01");
    expect(monthDates("2026-09").at(-1)).toBe("2026-09-30");
  });
});

describe("semana", () => {
  it("começa no domingo", () => {
    expect(startOfWeek("2026-09-23")).toBe("2026-09-20");
    expect(weekDates("2026-09-23")).toEqual([
      "2026-09-20",
      "2026-09-21",
      "2026-09-22",
      "2026-09-23",
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
    ]);
  });
});

describe("formatação pt-BR", () => {
  it("formata data por extenso e mês/ano", () => {
    expect(formatLongDate("2026-09-23")).toBe("quarta-feira, 23 de setembro");
    expect(formatMonthLabel("2026-09")).toBe("setembro de 2026");
  });
});
