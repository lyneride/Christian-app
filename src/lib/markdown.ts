import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { findReferencesInText, referencePath } from "@/lib/bible/reference";

/**
 * Renders user-written Markdown to sanitised HTML. Only a small, safe subset
 * of HTML survives sanitize-html (pure JS, no jsdom – runs in any serverless
 * runtime); links open in a new tab with rel=noopener.
 * Bible references like "Joh 3,16" are automatically linked to the reader.
 */

const ALLOWED_TAGS = ["p", "br", "strong", "em", "b", "i", "u", "s", "a", "ul", "ol", "li", "blockquote", "code", "pre", "h2", "h3", "h4", "hr"];

const BASE_OPTIONS: sanitizeHtml.IOptions = {
  allowedAttributes: { a: ["href", "title", "target", "rel"], code: ["class"] },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href ?? "";
      if (/^https?:\/\//i.test(href)) {
        return { tagName, attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow ugc" } };
      }
      const rest = { ...attribs };
      delete rest.target;
      delete rest.rel;
      return { tagName, attribs: rest };
    },
  },
};

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
  const allowedTags = options.headings === false ? ALLOWED_TAGS.filter((t) => !/^h\d$/.test(t)) : ALLOWED_TAGS;
  return sanitizeHtml(html, { ...BASE_OPTIONS, allowedTags });
}

/** Plain-text excerpt for previews and meta descriptions. */
export function markdownToText(markdown: string, max = 200): string {
  const html = marked.parse(markdown, { async: false }) as string;
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + " …";
}
