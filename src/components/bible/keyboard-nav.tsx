"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  prevHref: string | null;
  nextHref: string | null;
}

/** Binds ← / → to the previous / next chapter. Renders nothing. */
export function KeyboardNav({ prevHref, nextHref }: Props) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      const href = e.key === "ArrowLeft" ? prevHref : nextHref;
      if (!href) return;
      e.preventDefault();
      router.push(href);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [prevHref, nextHref, router]);

  return null;
}
