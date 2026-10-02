"use client";

import { useEffect, useRef } from "react";

/** Scrolls the page to the newest message on load and whenever `trigger` changes. */
export function ScrollToBottom({ trigger }: { trigger: string | number | null }) {
  const first = useRef(true);

  useEffect(() => {
    const behavior: ScrollBehavior = first.current ? "instant" : "smooth";
    first.current = false;
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior });
  }, [trigger]);

  return null;
}
