import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AREAS, AREA_STYLE, type AreaKey } from "./areas";
import { AreaIcon } from "./area-icon";

/** Coloured icon tile for an area (Heute = Sonne, Bibel = Himmel, Gebet = Koralle, …). */
export function AreaTile({ area, size = "md", className }: { area: AreaKey; size?: "sm" | "md" | "lg"; className?: string }) {
  const def = AREAS.find((a) => a.key === area)!;
  const style = AREA_STYLE[area];
  const box = { sm: "size-8 rounded-[10px] [&_svg]:size-[18px]", md: "size-10 rounded-xl [&_svg]:size-[22px]", lg: "size-12 rounded-2xl [&_svg]:size-6" }[size];
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center", style.soft, style.text, box, className)}>
      <AreaIcon name={def.icon} strokeWidth={2.4} />
    </span>
  );
}

/**
 * A card that belongs to an area: icon tile, title, optional "Alle" link.
 * Used on the Heute page and in the area overviews.
 */
export function AreaCard({
  area,
  title,
  href,
  linkLabel = "Alle",
  children,
  className,
  tour,
  id,
}: {
  area: AreaKey;
  title: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
  className?: string;
  tour?: string;
  id?: string;
}) {
  const headingId = id ?? `card-${area}-${title.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <section aria-labelledby={headingId} data-tour={tour} className={cn("rounded-card bg-surface p-4 shadow-soft sm:p-5", className)}>
      <div className="flex items-center gap-3">
        <AreaTile area={area} size="sm" />
        <h2 id={headingId} className="min-w-0 flex-1 truncate text-[17px]">
          {title}
        </h2>
        {href ? (
          <Link href={href} className="inline-flex shrink-0 items-center gap-1 font-display text-sm font-extrabold text-primary hover:underline">
            {linkLabel} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
