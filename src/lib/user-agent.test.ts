import { describe, expect, it } from "vitest";
import { describeUserAgent } from "./user-agent";

describe("describeUserAgent", () => {
  it("recognises common browsers and systems", () => {
    expect(
      describeUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"),
    ).toBe("Chrome auf Windows");
    expect(
      describeUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 Edg/124.0"),
    ).toBe("Edge auf Windows");
    expect(
      describeUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1"),
    ).toBe("Safari auf iPhone");
    expect(describeUserAgent("Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0")).toBe("Firefox auf Linux");
    expect(
      describeUserAgent("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36"),
    ).toBe("Chrome auf Android");
  });

  it("falls back gracefully", () => {
    expect(describeUserAgent(null)).toBe("Unbekanntes Gerät");
    expect(describeUserAgent("")).toBe("Unbekanntes Gerät");
    expect(describeUserAgent("curl/8.0")).toBe("Browser");
  });
});
