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

test("gráfico mostra os 7 dias e o tooltip mostra X de Y hábitos", async ({ page }) => {
  await login(page);
  const chart = page.getByLabel("Hábitos concluídos por dia nesta semana");
  await expect(chart).toBeVisible();

  for (const label of ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]) {
    await expect(chart.getByText(label, { exact: true })).toBeVisible();
  }

  await chart.locator(".recharts-dot").last().hover();
  await expect(page.locator(".recharts-tooltip-wrapper")).toContainText(/de \d+ hábitos/);
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

test("detalhe: backfill, editar, arquivar e reativar", async ({ page }) => {
  const today = new Date();
  test.skip(today.getDate() <= 2, "início do mês: sem dias anteriores suficientes no calendário");

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  const pad = (value: number) => String(value).padStart(2, "0");
  const twoDaysAgoString = `${twoDaysAgo.getFullYear()}-${pad(twoDaysAgo.getMonth() + 1)}-${pad(twoDaysAgo.getDate())}`;

  backdateHabitCreatedAt("Exercício", twoDaysAgo);
  await login(page);
  await page.getByRole("link", { name: "Exercício" }).click();
  await expect(page.getByRole("heading", { name: "Exercício" })).toBeVisible({ timeout: 30_000 });

  // backfill de dois dias atrás direto no calendário do hábito
  await page.locator(`[data-date="${twoDaysAgoString}"]`).click();
  await expect(page.locator(`[data-date="${twoDaysAgoString}"]`)).toHaveAttribute(
    "data-done",
    "true",
  );

  await page.getByRole("button", { name: "Editar" }).click();
  await page.getByLabel("Nome").fill("Exercício físico");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByRole("heading", { name: "Exercício físico" })).toBeVisible();

  await page.getByRole("button", { name: "Arquivar" }).click();
  await page.getByRole("button", { name: "Arquivar mesmo assim" }).click();
  await expect(page.getByRole("button", { name: "Reativar" })).toBeVisible();

  await page.getByRole("link", { name: "LifeHub" }).click();
  await expect(page.getByText("Arquivados (1)")).toBeVisible();
  await expect(page.getByText("Todos os hábitos estão arquivados.")).toBeVisible();
  await page.getByRole("button", { name: "Arquivados (1)" }).click();
  await page.getByRole("link", { name: "Exercício físico" }).click();
  await page.getByRole("button", { name: "Reativar" }).click();
  await page.getByRole("link", { name: "LifeHub" }).click();
  await expect(page.getByText("Arquivados (1)")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Exercício físico" })).toBeVisible();
});
