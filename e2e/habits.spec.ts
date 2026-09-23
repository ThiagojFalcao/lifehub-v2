import { expect, test, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("e2e@test.local");
  await page.getByLabel("Senha").fill("e2e-password-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "LifeHub" })).toBeVisible();
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
