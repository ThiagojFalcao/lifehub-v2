import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env";

const valid = {
  DATABASE_PATH: "./data/lifehub.db",
  BETTER_AUTH_SECRET: "0123456789abcdef0123456789abcdef",
  BETTER_AUTH_URL: "http://localhost:3000",
};

describe("parseEnv", () => {
  it("aceita um ambiente válido", () => {
    const env = parseEnv(valid);
    expect(env.DATABASE_PATH).toBe("./data/lifehub.db");
    expect(env.BETTER_AUTH_SECRET).toBe(valid.BETTER_AUTH_SECRET);
  });

  it("usa default de DATABASE_PATH e BETTER_AUTH_URL quando ausentes", () => {
    const env = parseEnv({ BETTER_AUTH_SECRET: valid.BETTER_AUTH_SECRET });
    expect(env.DATABASE_PATH).toBe("./data/lifehub.db");
    expect(env.BETTER_AUTH_URL).toBe("http://localhost:3000");
  });

  it("falha se BETTER_AUTH_SECRET estiver ausente ou curto", () => {
    expect(() => parseEnv({})).toThrow();
    expect(() => parseEnv({ BETTER_AUTH_SECRET: "curto" })).toThrow();
  });
});
