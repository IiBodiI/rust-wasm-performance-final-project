import { describe, expect, it } from "vitest";
import { compareBuffers, speedup } from "../benchmark";
import { formatBytes, formatMs, formatRatio } from "../formatters";
import { grayscaleJs } from "../image";

describe("formatters", () => {
  it("formats timings and ratios", () => {
    expect(formatMs(0.1234)).toBe("0.123 ms");
    expect(formatRatio(2.25)).toBe("2.25x");
    expect(formatBytes(2048)).toBe("2.0 KB");
  });
});

describe("benchmark helpers", () => {
  it("computes speedup", () => {
    expect(speedup(20, 10)).toBe(2);
  });

  it("compares buffers", () => {
    expect(compareBuffers(new Uint8Array([1, 2]), new Uint8Array([1, 2]))).toBe(true);
  });
});

describe("image helpers", () => {
  it("grayscale keeps RGBA length", () => {
    const out = grayscaleJs(new Uint8Array([255, 0, 0, 200]));
    expect(out.length).toBe(4);
    expect(out[3]).toBe(200);
  });
});

