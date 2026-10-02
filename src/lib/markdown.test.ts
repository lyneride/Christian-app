import { describe, expect, it } from "vitest";
import { linkBibleReferences, markdownToText, renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders basic markdown and strips dangerous html", () => {
    const html = renderMarkdown("**fett** <script>alert(1)</script> <img src=x onerror=alert(1)>");
    expect(html).toContain("<strong>fett</strong>");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("onerror");
  });
  it("links external urls safely and bible references internally", () => {
    const html = renderMarkdown("Siehe [hier](https://example.org) und Joh 3,16.");
    expect(html).toContain('rel="noopener noreferrer nofollow ugc"');
    expect(html).toContain('href="/bibel/john/3?v=16"');
  });
  it("blocks javascript: urls", () => {
    const html = renderMarkdown("[x](javascript:alert(1))");
    expect(html).not.toContain("javascript:");
  });
  it("can disable headings", () => {
    expect(renderMarkdown("## Titel", { headings: false })).not.toContain("<h2");
    expect(renderMarkdown("## Titel")).toContain("<h2");
  });
});

describe("linkBibleReferences", () => {
  it("wraps references in markdown links", () => {
    expect(linkBibleReferences("Lies Röm 8,28!")).toBe("Lies [Röm 8,28](/bibel/rom/8?v=28)!");
  });
});

describe("markdownToText", () => {
  it("produces a plain excerpt", () => {
    expect(markdownToText("# Hallo\n\nDas ist **Text**.")).toBe("Hallo Das ist Text.");
    expect(markdownToText("wort ".repeat(100), 30).endsWith("…")).toBe(true);
  });
});
