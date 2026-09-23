import { describe, expect, it } from "vitest";
import { HABIT_COLORS, HABIT_COLOR_KEYS, habitColorHex, toHabitColor } from "@/lib/habits/colors";

describe("paleta de hábitos", () => {
  it("tem 8 cores com rótulo e hex válidos", () => {
    expect(HABIT_COLOR_KEYS).toHaveLength(8);
    for (const key of HABIT_COLOR_KEYS) {
      expect(HABIT_COLORS[key].hex).toMatch(/^#[0-9a-f]{6}$/);
      expect(HABIT_COLORS[key].label.length).toBeGreaterThan(0);
    }
  });

  it("habitColorHex devolve o hex da cor", () => {
    expect(habitColorHex("green")).toBe("#22c55e");
  });

  it("toHabitColor aceita a paleta e cai no verde para valor desconhecido", () => {
    expect(toHabitColor("blue")).toBe("blue");
    expect(toHabitColor("rosa-choque")).toBe("green");
  });
});
