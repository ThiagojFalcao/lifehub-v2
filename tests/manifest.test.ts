import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";

describe("manifest", () => {
  it("declara o app como instalável", () => {
    const result = manifest();
    expect(result.name).toBe("LifeHub");
    expect(result.display).toBe("standalone");
    expect(result.icons?.length).toBeGreaterThan(0);
  });
});
