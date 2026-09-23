import { defineConfig } from "@playwright/test";

const PORT = 3210;

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `npm run e2e:prepare && npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_PATH: "./data/e2e.db",
      BETTER_AUTH_SECRET: "e2e-secret-e2e-secret-e2e-secret-1234",
      BETTER_AUTH_URL: `http://localhost:${PORT}`,
      SEED_EMAIL: "e2e@test.local",
      SEED_PASSWORD: "e2e-password-123",
    },
  },
});
