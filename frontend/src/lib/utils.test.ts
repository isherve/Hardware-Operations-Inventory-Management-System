import { describe, it, expect } from "vitest";
import { formatRwf } from "@/lib/utils";

describe("formatRwf", () => {
  it("formats amounts without decimals", () => {
    const formatted = formatRwf(18500);
    expect(formatted).toContain("18");
    expect(formatted).toMatch(/RWF|RF|Fr/);
  });
});
