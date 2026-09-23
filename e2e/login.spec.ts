import { expect, test } from "@playwright/test";

test("rota protegida sem sessão redireciona para /login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
});

test("login com a conta seed leva ao dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("e2e@test.local");
  await page.getByLabel("Senha").fill("e2e-password-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "LifeHub" })).toBeVisible();
});
