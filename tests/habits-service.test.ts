import { eq } from "drizzle-orm";
import { afterEach, beforeEach, expect, it } from "vitest";
import { user } from "@/db/auth-schema";
import { habitEntries, habits } from "@/db/schema";
import { ensureSeedUser } from "@/lib/seed";
import { createHabit, setArchived, setEntry, updateHabit } from "@/lib/habits/service";
import { createTempDb } from "./helpers/temp-db";

let ctx: ReturnType<typeof createTempDb>;
let userId = "";

beforeEach(async () => {
  ctx = createTempDb();
  await ensureSeedUser(ctx.db, {
    email: "service@test.local",
    password: "senha-de-teste-123",
    name: "Service",
  });
  userId = ctx.db.select().from(user).where(eq(user.email, "service@test.local")).get()!.id;
});

afterEach(() => {
  ctx.cleanup();
});

it("createHabit normaliza intenção vazia para null", () => {
  expect(
    createHabit(ctx.db, userId, { name: "Exercício", color: "green", intention: "  " }),
  ).toEqual({ ok: true });
  const [habit] = ctx.db.select().from(habits).all();
  expect(habit).toMatchObject({ name: "Exercício", intention: null });
});

it("updateHabit edita e respeita o dono", () => {
  createHabit(ctx.db, userId, { name: "Exercício", color: "green" });
  const [habit] = ctx.db.select().from(habits).all();

  expect(
    updateHabit(ctx.db, userId, habit.id, {
      name: "Exercício físico",
      color: "orange",
      intention: "Se acordar, então me movo",
    }),
  ).toEqual({ ok: true });
  expect(ctx.db.select().from(habits).get()).toMatchObject({
    name: "Exercício físico",
    color: "orange",
    intention: "Se acordar, então me movo",
  });

  expect(updateHabit(ctx.db, "outro-usuario", habit.id, { name: "X", color: "green" })).toEqual({
    ok: false,
    error: "Hábito não encontrado.",
  });
});

it("setArchived arquiva e reativa (idempotente)", () => {
  createHabit(ctx.db, userId, { name: "Leitura", color: "blue" });
  const [habit] = ctx.db.select().from(habits).all();
  const now = new Date(2026, 8, 10, 8, 0);

  expect(setArchived(ctx.db, userId, habit.id, true, now)).toEqual({ ok: true });
  expect(ctx.db.select().from(habits).get()?.archivedAt).toEqual(now);
  expect(setArchived(ctx.db, userId, habit.id, true, new Date(2026, 8, 11, 8, 0))).toEqual({
    ok: true,
  });
  expect(ctx.db.select().from(habits).get()?.archivedAt).toEqual(now);

  expect(setArchived(ctx.db, userId, habit.id, false)).toEqual({ ok: true });
  expect(ctx.db.select().from(habits).get()?.archivedAt).toBeNull();
});

it("setEntry é idempotente e valida o período do hábito", () => {
  const now = new Date(2026, 8, 23, 10, 0);
  createHabit(ctx.db, userId, { name: "Água", color: "teal" }, new Date(2026, 8, 20, 9, 0));
  const [habit] = ctx.db.select().from(habits).all();

  expect(setEntry(ctx.db, userId, habit.id, "2026-09-23", true, now)).toEqual({ ok: true });
  expect(setEntry(ctx.db, userId, habit.id, "2026-09-23", true, now)).toEqual({ ok: true });
  expect(ctx.db.select().from(habitEntries).all()).toHaveLength(1);

  expect(setEntry(ctx.db, userId, habit.id, "2026-09-23", false, now)).toEqual({ ok: true });
  expect(setEntry(ctx.db, userId, habit.id, "2026-09-23", false, now)).toEqual({ ok: true });
  expect(ctx.db.select().from(habitEntries).all()).toHaveLength(0);

  expect(setEntry(ctx.db, userId, habit.id, "2026-09-24", true, now)).toEqual({
    ok: false,
    error: "Não dá para registrar um dia futuro.",
  });
  expect(setEntry(ctx.db, userId, habit.id, "2026-09-19", true, now)).toEqual({
    ok: false,
    error: "Esse dia está fora do período do hábito.",
  });
  expect(setEntry(ctx.db, userId, habit.id, "23/09/2026", true, now)).toEqual({
    ok: false,
    error: "Data inválida.",
  });
});

it("setEntry recusa dia em que o hábito já estava arquivado", () => {
  const now = new Date(2026, 8, 23, 10, 0);
  createHabit(ctx.db, userId, { name: "Meditar", color: "purple" }, new Date(2026, 8, 1, 9, 0));
  const [habit] = ctx.db.select().from(habits).all();
  setArchived(ctx.db, userId, habit.id, true, new Date(2026, 8, 10, 8, 0));

  expect(setEntry(ctx.db, userId, habit.id, "2026-09-09", true, now)).toEqual({ ok: true });
  expect(setEntry(ctx.db, userId, habit.id, "2026-09-10", true, now)).toEqual({
    ok: false,
    error: "Esse dia está fora do período do hábito.",
  });
});
