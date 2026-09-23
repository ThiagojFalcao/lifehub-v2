import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({ getSessionOrNull: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/db/client", () => ({ getDb: () => ({ db: { fake: true } }) }));
vi.mock("@/lib/habits/service", () => ({
  createHabit: vi.fn(() => ({ ok: true })),
  updateHabit: vi.fn(() => ({ ok: true })),
  setArchived: vi.fn(() => ({ ok: true })),
  setEntry: vi.fn(() => ({ ok: true })),
}));

import { getSessionOrNull } from "@/lib/session";
import * as service from "@/lib/habits/service";
import { createHabit, setEntry } from "@/lib/habits/actions";

const session = { user: { id: "user-1" } };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Server Actions", () => {
  it("recusa sem sessão e não chama o serviço", async () => {
    vi.mocked(getSessionOrNull).mockResolvedValue(null);

    await expect(createHabit({ name: "Exercício", color: "green" })).resolves.toEqual({
      ok: false,
      error: "Sessão expirada. Entre novamente.",
    });
    expect(service.createHabit).not.toHaveBeenCalled();
  });

  it("recusa entrada inválida com mensagem do zod", async () => {
    vi.mocked(getSessionOrNull).mockResolvedValue(session as never);

    const result = await createHabit({ name: "", color: "green" });
    expect(result).toEqual({ ok: false, error: "Dê um nome ao hábito" });
    expect(service.createHabit).not.toHaveBeenCalled();
  });

  it("chama o serviço com o usuário da sessão", async () => {
    vi.mocked(getSessionOrNull).mockResolvedValue(session as never);

    await expect(setEntry("h1", "2026-09-23", true)).resolves.toEqual({ ok: true });
    expect(service.setEntry).toHaveBeenCalledWith(
      { fake: true },
      "user-1",
      "h1",
      "2026-09-23",
      true,
    );
  });

  it("captura erro inesperado do serviço", async () => {
    vi.mocked(getSessionOrNull).mockResolvedValue(session as never);
    vi.mocked(service.createHabit).mockImplementationOnce(() => {
      throw new Error("boom");
    });

    await expect(createHabit({ name: "Exercício", color: "green" })).resolves.toEqual({
      ok: false,
      error: "Algo deu errado. Tente de novo.",
    });
  });
});
