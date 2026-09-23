import { eq } from "drizzle-orm";
import { afterEach, beforeEach, expect, it } from "vitest";
import { user } from "@/db/auth-schema";
import { habitEntries } from "@/db/schema";
import { ensureSeedUser } from "@/lib/seed";
import { seedDemo } from "@/lib/habits/demo";
import { listHabits } from "@/lib/habits/queries";
import { createTempDb } from "./helpers/temp-db";

let ctx: ReturnType<typeof createTempDb>;
let userId = "";

beforeEach(async () => {
  ctx = createTempDb();
  await ensureSeedUser(ctx.db, {
    email: "demo@test.local",
    password: "senha-de-teste-123",
    name: "Demo",
  });
  userId = ctx.db.select().from(user).where(eq(user.email, "demo@test.local")).get()!.id;
});

afterEach(() => {
  ctx.cleanup();
});

it("cria 4 hábitos e 180 registros (~75%) de forma determinística", () => {
  const result = seedDemo(ctx.db, userId, { now: new Date(2026, 8, 23, 12, 0) });

  expect(result).toEqual({ habits: 4, entries: 180 });
  expect(listHabits(ctx.db, userId, { includeArchived: true })).toHaveLength(4);
  expect(ctx.db.select().from(habitEntries).all()).toHaveLength(180);
});

it("é idempotente: rodar de novo não duplica", () => {
  seedDemo(ctx.db, userId, { now: new Date(2026, 8, 23, 12, 0) });
  const second = seedDemo(ctx.db, userId, { now: new Date(2026, 8, 23, 12, 0) });

  expect(second).toEqual({ habits: 0, entries: 0 });
  expect(ctx.db.select().from(habitEntries).all()).toHaveLength(180);
});
