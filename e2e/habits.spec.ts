import { expect, test, type Page } from "@playwright/test";
import Database from "better-sqlite3";

function backdateHabitCreatedAt(name: string, date: Date) {
  const db = new Database(process.env.DATABASE_PATH ?? "./data/e2e.db");
  db.prepare("UPDATE habits SET created_at = ? WHERE name = ?").run(date.getTime(), name);
  db.close();
}

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("e2e@test.local");
  await page.getByLabel("Senha").fill("e2e-password-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("button", { name: "Adicionar hábito" })).toBeVisible({
    timeout: 30_000,
  });
}

test("home sem hábitos mostra convite acolhedor", async ({ page }) => {
  await login(page);
  await expect(page.getByText("Nenhum hábito ainda")).toBeVisible();
});

test("cria hábito, registra hoje e persiste após reload", async ({ page }) => {
  await login(page);

  await page.getByRole("button", { name: "Adicionar hábito" }).click();
  await page.getByLabel("Nome").fill("Exercício");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByRole("link", { name: "Exercício" })).toBeVisible();

  await page.getByRole("button", { name: "Marcar Exercício como feito hoje" }).click();
  await expect(
    page.getByRole("button", { name: "Desmarcar Exercício como feito hoje" }),
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("button", { name: "Desmarcar Exercício como feito hoje" }),
  ).toBeVisible();
});

test("gráfico da semana mostra o resumo de hoje", async ({ page }) => {
  await login(page);
  await expect(page.getByLabel("Hábitos concluídos por dia nesta semana")).toBeVisible();
  await expect(page.getByText(/Hoje: \d+ de \d+ hábitos/)).toBeVisible();
});

test("registra ontem pelo painel do dia no calendário", async ({ page }) => {
  const today = new Date();
  test.skip(today.getDate() === 1, "primeiro dia do mês: não há dia anterior no calendário");

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const pad = (value: number) => String(value).padStart(2, "0");
  const yesterdayString = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

  backdateHabitCreatedAt("Exercício", yesterday);
  await login(page);
  await page.locator(`[data-date="${yesterdayString}"]`).click();
  await expect(page.getByLabel("Painel do dia")).toBeVisible();
  await page.getByRole("button", { name: "Marcar Exercício como feito" }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator(`[data-date="${yesterdayString}"]`)).toHaveAttribute("data-level", "3");

  await page.reload();
  await expect(page.locator(`[data-date="${yesterdayString}"]`)).toHaveAttribute("data-level", "3");
});
