import { marked } from "marked";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { findReferencesInText, referencePath } from "@/lib/bible/reference";

/**
 * Renders user-written Markdown to sanitised HTML. Only a small, safe subset
 * of HTML survives DOMPurify; links open in a new tab with rel=noopener.
 * Bible references like "Joh 3,16" are automatically linked to the reader.
 */

const window = new JSDOM("").window;
const purify = DOMPurify(window);

purify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    const href = node.getAttribute("href") ?? "";
    if (/^https?:\/\//i.test(href)) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer nofollow ugc");
    }
  }
});

const ALLOWED_TAGS = ["p", "br", "strong", "em", "b", "i", "u", "s", "a", "ul", "ol", "li", "blockquote", "code", "pre", "h2", "h3", "h4", "hr"];
const ALLOWED_ATTR = ["href", "title", "target", "rel", "class"];

marked.setOptions({ gfm: true, breaks: true });

export function linkBibleReferences(text: string): string {
  const hits = findReferencesInText(text);
  if (hits.length === 0) return text;
  let out = "";
  let pos = 0;
  for (const hit of hits) {
    out += text.slice(pos, hit.start);
    out += `[${hit.raw}](${referencePath(hit.ref)})`;
    pos = hit.end;
  }
  return out + text.slice(pos);
}

export function renderMarkdown(markdown: string, options: { linkReferences?: boolean; headings?: boolean } = {}): string {
  const source = options.linkReferences === false ? markdown : linkBibleReferences(markdown);
  const html = marked.parse(source, { async: false }) as string;
  const tags = options.headings === false ? ALLOWED_TAGS.filter((t) => !/^h\d$/.test(t)) : ALLOWED_TAGS;
  return purify.sanitize(html, { ALLOWED_TAGS: tags, ALLOWED_ATTR, ALLOW_DATA_ATTR: false });
}

/** Plain-text excerpt for previews and meta descriptions. */
export function markdownToText(markdown: string, max = 200): string {
  const html = marked.parse(markdown, { async: false }) as string;
  const text = purify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + " …";
}
