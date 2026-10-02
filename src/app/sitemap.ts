import type { MetadataRoute } from "next";
import { BOOKS } from "@/lib/bible/books";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const now = new Date();
  const statics = ["", "/bibel", "/bibel/suche", "/leseplaene", "/gebet", "/gemeinschaft", "/gruppen", "/veranstaltungen", "/zeugnisse", "/ueber", "/hilfe", "/datenschutz", "/impressum", "/nutzungsbedingungen"].map(
    (path) => ({ url: `${base}${path}`, lastModified: now, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.7 }),
  );
  const books = BOOKS.map((b) => ({ url: `${base}/bibel/${b.id.toLowerCase()}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.5 }));
  const chapters = BOOKS.flatMap((b) =>
    Array.from({ length: b.chapters }, (_, i) => ({
      url: `${base}/bibel/${b.id.toLowerCase()}/${i + 1}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  );
  return [...statics, ...books, ...chapters];
}
