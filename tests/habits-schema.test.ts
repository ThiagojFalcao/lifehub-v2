import { eq } from "drizzle-orm";
import { afterEach, expect, it } from "vitest";
import { user } from "@/db/auth-schema";
import { habitEntries, habits } from "@/db/schema";
import { ensureSeedUser } from "@/lib/seed";
import { createTempDb } from "./helpers/temp-db";

const cleanups: (() => void)[] = [];

afterEach(() => {
  for (const cleanup of cleanups) cleanup();
  cleanups.length = 0;
});

it("cria hábito e registro, e o unique (habitId, date) bloqueia duplicata", async () => {
  const { db, cleanup } = createTempDb();
  cleanups.push(cleanup);

  await ensureSeedUser(db, {
    email: "schema@test.local",
    password: "senha-de-teste-123",
    name: "Schema",
  });
  const [seededUser] = db.select().from(user).where(eq(user.email, "schema@test.local")).all();

  db.insert(habits)
    .values({
      id: "h1",
      userId: seededUser.id,
      name: "Exercício",
      color: "green",
      intention: null,
      createdAt: new Date(2026, 8, 1, 12, 0),
      archivedAt: null,
    })
    .run();

  db.insert(habitEntries)
    .values({ id: "e1", habitId: "h1", date: "2026-09-01", createdAt: new Date() })
    .run();

  expect(() =>
    db
      .insert(habitEntries)
      .values({ id: "e2", habitId: "h1", date: "2026-09-01", createdAt: new Date() })
      .run(),
  ).toThrow();

  const stored = db.select().from(habitEntries).all();
  expect(stored).toHaveLength(1);
});
