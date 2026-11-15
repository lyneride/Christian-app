"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { areaForPath } from "@/components/layout/areas";
import { TOUR_EVENT, type TourKind } from "./tour-events";
import { tourFor, type Tour } from "./tours";

type Rect = { top: number; left: number; width: number; height: number };

const noopSubscribe = () => () => {};

const OFF_KEY = "bleibe:tours:off";
const SKIP_PATH_KEY = "bleibe:tour:skip-path";

function storageKey(userId: string, kind: TourKind) {
  return `bleibe:tour:${userId}:${kind}`;
}
function isDone(userId: string, kind: TourKind) {
  try {
    return localStorage.getItem(storageKey(userId, kind)) === "done" || localStorage.getItem(OFF_KEY) === "1";
  } catch {
    return true;
  }
}
function markDone(userId: string, kind: TourKind) {
  try {
    localStorage.setItem(storageKey(userId, kind), "done");
  } catch {}
}

function findTarget(target: string | string[] | undefined): HTMLElement | null {
  if (!target) return null;
  for (const name of Array.isArray(target) ? target : [target]) {
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`))) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden") return el;
    }
  }
  return null;
}

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Runs Rebi's tours: the welcome tour after the first sign-in and one detailed tour per area
 * on the first visit of that area. Remembered per user on this device; restart via the „?“ menu,
 * the Ich page or `?tour=1` in the URL.
 */
export function TourHost({ userId }: { userId: string | null }) {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const router = useRouter();
  const [active, setActive] = useState<{ tour: Tour; step: number } | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  // Portals need document.body: false on the server, true once hydrated.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const start = useCallback((kind: TourKind) => {
    restoreFocus.current = document.activeElement as HTMLElement | null;
    setActive({ tour: tourFor(kind), step: 0 });
  }, []);

  const close = useCallback(
    () => {
      setActive((cur) => {
        if (cur && userId) {
          markDone(userId, cur.tour.kind);
          if (cur.tour.kind === "welcome") {
            try {
              sessionStorage.setItem(SKIP_PATH_KEY, window.location.pathname);
            } catch {}
          }
        }
        return null;
      });
      setRect(null);
      restoreFocus.current?.focus?.();
    },
    [userId],
  );

  // Start on request (help menu, Ich page).
  useEffect(() => {
    const onStart = (e: Event) => start((e as CustomEvent<TourKind>).detail);
    window.addEventListener(TOUR_EVENT, onStart);
    return () => window.removeEventListener(TOUR_EVENT, onStart);
  }, [start]);

  // Automatic start: welcome tour first, then each area's tour on its first visit.
  useEffect(() => {
    if (!userId || active) return;
    const area = areaForPath(pathname);
    if (searchParams?.get("tour") === "1" && area) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("tour");
      router.replace((pathname + (params.size ? `?${params}` : "")) as never, { scroll: false });
      const t = setTimeout(() => start(area.key), 500);
      return () => clearTimeout(t);
    }
    if (!area) return;
    let skipPath: string | null = null;
    try {
      skipPath = sessionStorage.getItem(SKIP_PATH_KEY);
    } catch {}
    if (!isDone(userId, "welcome")) {
      const t = setTimeout(() => start("welcome"), 900);
      return () => clearTimeout(t);
    }
    if (skipPath === pathname) return;
    if (!isDone(userId, area.key)) {
      const t = setTimeout(() => start(area.key), 900);
      return () => clearTimeout(t);
    }
  }, [pathname, searchParams, userId, active, start, router]);

  const step = active ? active.tour.steps[active.step] : null;

  // Find and follow the spotlighted element.
  useLayoutEffect(() => {
    if (!step) return;
    const el = findTarget(step.target);
    let raf = 0;
    const measure = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
      if (!el) return setRect(null);
      const r = el.getBoundingClientRect();
      const pad = 6;
      setRect({ top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 });
    };
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.top < 70 || r.bottom > window.innerHeight - 90) el.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
    }
    measure();
    const onChange = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    const settle = setTimeout(measure, 450);
    window.addEventListener("scroll", onChange, true);
    window.addEventListener("resize", onChange);
    return () => {
      clearTimeout(settle);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onChange, true);
      window.removeEventListener("resize", onChange);
    };
  }, [step]);

  // Keyboard + focus.
  useEffect(() => {
    if (!active) return;
    primaryRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, close]);

  if (!mounted || !active || !step) return null;

  const { tour } = active;
  const total = tour.steps.length;
  const isFirst = active.step === 0;
  const isLast = active.step === total - 1;
  const next = () => (isLast ? close() : setActive({ tour, step: active.step + 1 }));
  const back = () => setActive({ tour, step: Math.max(0, active.step - 1) });

  // Bubble placement: next to a narrow target on wide screens, otherwise below or above it.
  const vw = viewport.w || window.innerWidth;
  const vh = viewport.h || window.innerHeight;
  const width = Math.min(400, vw - 24);
  let style: React.CSSProperties;
  if (!rect) {
    style = { left: (vw - width) / 2, top: "50%", transform: "translateY(-45%)", width };
  } else if (vw >= 768 && rect.left + rect.width + width + 32 < vw && rect.width < vw / 2) {
    style = { left: rect.left + rect.width + 16, top: Math.min(Math.max(12, rect.top + rect.height / 2 - 110), vh - 260), width };
  } else {
    const left = Math.min(Math.max(12, rect.left + rect.width / 2 - width / 2), vw - width - 12);
    style =
      rect.top + rect.height + 250 < vh
        ? { left, top: rect.top + rect.height + 14, width }
        : { left, bottom: Math.max(12, vh - rect.top + 14), width };
  }

  const chip = tour.area ? tour.label : "Willkommen";

  return createPortal(
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      {rect ? (
        <div
          aria-hidden="true"
          className="absolute rounded-[20px] ring-4 ring-white transition-all duration-300 motion-reduce:transition-none"
          style={{ ...rect, boxShadow: "0 0 0 9999px rgba(23, 19, 31, 0.64)" }}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-[rgba(23,19,31,0.64)]" />
      )}

      <div className="absolute" style={style}>
        {!rect ? (
          <div className="relative z-10 -mb-5 flex justify-center">
            <Image src={`/rebi/${step.pose}.svg`} alt="" width={150} height={150} unoptimized priority />
          </div>
        ) : null}
        <div className="rounded-[26px] bg-surface p-4 text-foreground shadow-pop">
          <div className="flex gap-3">
            {rect ? <Image src={`/rebi/${step.pose}.svg`} alt="" width={64} height={64} unoptimized className="-my-1 -ml-1 shrink-0" /> : null}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 items-center rounded-full bg-primary-soft px-2.5 font-display text-xs font-black">{chip}</span>
                <span className="text-xs font-bold text-muted-foreground">
                  {active.step + 1} / {total}
                </span>
                {step.isNew ? (
                  <span className="inline-flex h-5 items-center rounded-full bg-primary px-2 font-display text-[10px] font-black text-primary-foreground">
                    NEU
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => close()}
                  className="ml-auto h-8 px-1 text-xs font-bold text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Überspringen
                </button>
              </div>
              <h2 id={titleId} className="mt-1.5 text-lg leading-tight">
                {step.title}
              </h2>
              <p className="mt-1 text-[15px] leading-snug">{step.text}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            {isFirst ? (
              <button type="button" onClick={() => close()} className="h-11 px-3 font-display text-[15px] font-black text-primary">
                Später
              </button>
            ) : (
              <button type="button" onClick={back} className="h-11 px-3 font-display text-[15px] font-black text-primary">
                Zurück
              </button>
            )}
            <div className="flex gap-1.5" aria-hidden="true">
              {tour.steps.map((_, i) => (
                <span key={i} className={cn("h-1.5 rounded-full transition-all", i === active.step ? "w-4 bg-primary" : "w-1.5 bg-border")} />
              ))}
            </div>
            <button
              ref={primaryRef}
              type="button"
              onClick={next}
              className="h-11 rounded-full bg-primary px-5 font-display text-[15px] font-black text-primary-foreground shadow-[0_4px_0_var(--primary-press)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--primary-press)]"
            >
              {isFirst ? "Los geht’s" : isLast ? "Fertig" : "Weiter"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
