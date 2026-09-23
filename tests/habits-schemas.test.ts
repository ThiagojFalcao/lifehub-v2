import { describe, expect, it } from "vitest";
import { habitInputSchema } from "@/lib/habits/schemas";

describe("habitInputSchema", () => {
  it("aceita entrada válida e faz trim", () => {
    const parsed = habitInputSchema.parse({ name: "  Exercício  ", color: "green", intention: "" });
    expect(parsed.name).toBe("Exercício");
    expect(parsed.color).toBe("green");
  });

  it("rejeita nome vazio ou longo demais", () => {
    expect(habitInputSchema.safeParse({ name: "   ", color: "green" }).success).toBe(false);
    expect(habitInputSchema.safeParse({ name: "a".repeat(61), color: "green" }).success).toBe(
      false,
    );
  });

  it("rejeita cor fora da paleta e intenção longa demais", () => {
    expect(habitInputSchema.safeParse({ name: "X", color: "rosa-choque" }).success).toBe(false);
    expect(
      habitInputSchema.safeParse({ name: "X", color: "green", intention: "a".repeat(281) }).success,
    ).toBe(false);
  });
});
