import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonClasses } from "./button";
import { pageCount, pageHref } from "@/lib/pagination";

export function Pagination({
  basePath,
  params,
  page,
  perPage,
  total,
}: {
  basePath: string;
  params?: Record<string, string | undefined>;
  page: number;
  perPage: number;
  total: number;
}) {
  const pages = pageCount(total, perPage);
  if (pages <= 1) return null;
  const p = params ?? {};
  return (
    <nav aria-label="Seiten" className="mt-8 flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={pageHref(basePath, p, page - 1)} className={buttonClasses("outline", "sm")} rel="prev">
          <ChevronLeft aria-hidden="true" /> Zurück
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted-foreground">
        Seite {page} von {pages}
      </span>
      {page < pages ? (
        <Link href={pageHref(basePath, p, page + 1)} className={buttonClasses("outline", "sm")} rel="next">
          Weiter <ChevronRight aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
