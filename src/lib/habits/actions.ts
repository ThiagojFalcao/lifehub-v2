"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db/client";
import { getSessionOrNull } from "@/lib/session";
import { habitInputSchema } from "./schemas";
import * as service from "./service";
import type { ActionResult } from "./service";

async function withSession(
  handler: (userId: string) => ActionResult | Promise<ActionResult>,
): Promise<ActionResult> {
  try {
    const session = await getSessionOrNull();
    if (!session) return { ok: false, error: "Sessão expirada. Entre novamente." };
    return await handler(session.user.id);
  } catch {
    return { ok: false, error: "Algo deu errado. Tente de novo." };
  }
}

export async function createHabit(input: unknown): Promise<ActionResult> {
  return withSession((userId) => {
    const parsed = habitInputSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
    }
    const result = service.createHabit(getDb().db, userId, parsed.data);
    if (result.ok) revalidatePath("/");
    return result;
  });
}

export async function updateHabit(id: string, input: unknown): Promise<ActionResult> {
  return withSession((userId) => {
    const parsed = habitInputSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
    }
    const result = service.updateHabit(getDb().db, userId, id, parsed.data);
    if (result.ok) {
      revalidatePath("/");
      revalidatePath(`/habits/${id}`);
    }
    return result;
  });
}

export async function setArchived(id: string, archived: boolean): Promise<ActionResult> {
  return withSession((userId) => {
    const result = service.setArchived(getDb().db, userId, id, archived);
    if (result.ok) {
      revalidatePath("/");
      revalidatePath(`/habits/${id}`);
    }
    return result;
  });
}

export async function setEntry(
  habitId: string,
  date: string,
  done: boolean,
): Promise<ActionResult> {
  return withSession((userId) => {
    const result = service.setEntry(getDb().db, userId, habitId, date, done);
    if (result.ok) {
      revalidatePath("/");
      revalidatePath(`/habits/${habitId}`);
    }
    return result;
  });
}
