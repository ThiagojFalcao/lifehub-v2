import { afterEach, beforeEach, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { user } from "@/db/auth-schema";
import { habitEntries, habits } from "@/db/schema";
import { ensureSeedUser } from "@/lib/seed";
import { createTempDb } from "./helpers/temp-db";
import { getHabit, listEntriesBetween, listHabitEntries, listHabits } from "@/lib/habits/queries";

let ctx: ReturnType<typeof createTempDb>;
let userA = "";
let userB = "";

beforeEach(async () => {
  ctx = createTempDb();
  await ensureSeedUser(ctx.db, {
    email: "a@test.local",
    password: "senha-de-teste-123",
    name: "A",
  });
  await ensureSeedUser(ctx.db, {
    email: "b@test.local",
    password: "senha-de-teste-123",
    name: "B",
  });
  userA = ctx.db.select().from(user).where(eq(user.email, "a@test.local")).get()!.id;
  userB = ctx.db.select().from(user).where(eq(user.email, "b@test.local")).get()!.id;

  ctx.db
    .insert(habits)
    .values([
      {
        id: "h1",
        userId: userA,
        name: "Exercício",
        color: "green",
        intention: null,
        createdAt: new Date(2026, 8, 1, 12, 0),
        archivedAt: null,
      },
      {
        id: "h2",
        userId: userA,
        name: "Leitura",
        color: "blue",
        intention: "Se deitar, então leio 10 páginas",
        createdAt: new Date(2026, 8, 2, 12, 0),
        archivedAt: new Date(2026, 8, 10, 8, 0),
      },
      {
        id: "h3",
        userId: userB,
        name: "Água",
        color: "teal",
        intention: null,
        createdAt: new Date(2026, 8, 1, 12, 0),
        archivedAt: null,
      },
    ])
    .run();

  ctx.db
    .insert(habitEntries)
    .values([
      { id: "e1", habitId: "h1", date: "2026-09-02", createdAt: new Date() },
      { id: "e2", habitId: "h3", date: "2026-09-02", createdAt: new Date() },
    ])
    .run();
});

afterEach(() => {
  ctx.cleanup();
});

it("lista hábitos ativos e, opcionalmente, arquivados", () => {
  expect(listHabits(ctx.db, userA).map((habit) => habit.id)).toEqual(["h1"]);
  expect(listHabits(ctx.db, userA, { includeArchived: true }).map((habit) => habit.id)).toEqual([
    "h1",
    "h2",
  ]);
});

it("getHabit respeita o dono", () => {
  expect(getHabit(ctx.db, userA, "h1")?.name).toBe("Exercício");
  expect(getHabit(ctx.db, userB, "h1")).toBeUndefined();
});

it("listEntriesBetween escopa por usuário e intervalo", () => {
  expect(listEntriesBetween(ctx.db, userA, "2026-09-01", "2026-09-30")).toEqual([
    { habitId: "h1", date: "2026-09-02" },
  ]);
  expect(listEntriesBetween(ctx.db, userB, "2026-09-01", "2026-09-30")).toEqual([
    { habitId: "h3", date: "2026-09-02" },
  ]);
  expect(listEntriesBetween(ctx.db, userA, "2026-09-03", "2026-09-30")).toEqual([]);
});

it("listHabitEntries devolve as datas do hábito", () => {
  expect(listHabitEntries(ctx.db, userA, "h1", "2026-09-01", "2026-09-30")).toEqual(["2026-09-02"]);
  expect(listHabitEntries(ctx.db, userB, "h1", "2026-09-01", "2026-09-30")).toEqual([]);
});
