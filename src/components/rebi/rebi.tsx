import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Rebi – Bleibes Maskottchen: eine kleine Traube mit Weinblatt (Johannes 15).
 * Jede Pose hat einen festen Einsatz:
 * - wave: Begrüßung, Start der Tour
 * - point: Tour-Schritte und Tipps
 * - read: Bibel, Lesepläne
 * - heart: Gebet, „Ich bete mit“
 * - celebrate: geschafft (Leseplan-Tag, Tour fertig, Gebet erhört)
 * - sleep: leere Seiten, offline
 * - think: Suche ohne Treffer, Fehler
 * Die SVGs liegen in public/rebi und werden von scripts/rebi/generate.py erzeugt.
 * Die kleinen Animationen stecken im SVG und schalten sich bei „Bewegung reduzieren“ ab.
 */
export type RebiPose = "wave" | "point" | "read" | "heart" | "celebrate" | "sleep" | "think";

export function Rebi({
  pose = "wave",
  size = 96,
  label,
  className,
  priority,
}: {
  pose?: RebiPose;
  size?: number;
  /** Accessible name; leave empty when Rebi is decoration next to text. */
  label?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={`/rebi/${pose}.svg`}
      width={size}
      height={size}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      unoptimized
      priority={priority}
      draggable={false}
      className={cn("pointer-events-none shrink-0 select-none", className)}
    />
  );
}

/** Speech bubble next to Rebi. `tail` points towards Rebi. */
export function RebiBubble({
  children,
  tail = "left",
  className,
}: {
  children: React.ReactNode;
  tail?: "left" | "right" | "bottom" | "none";
  className?: string;
}) {
  const tailClass = {
    left: "-left-2 top-5",
    right: "-right-2 top-5",
    bottom: "bottom-[-8px] left-8",
    none: "hidden",
  }[tail];
  return (
    <div className={cn("relative rounded-[22px] bg-surface px-4 py-3 font-display text-[15px] leading-snug font-extrabold shadow-soft", className)}>
      <span aria-hidden="true" className={cn("absolute size-4 rotate-45 rounded-[3px] bg-surface", tailClass)} />
      <span className="relative">{children}</span>
    </div>
  );
}
