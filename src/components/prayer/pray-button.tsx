"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { Check, Heart } from "lucide-react";
import { togglePrayed } from "@/app/(site)/gebet/actions";
import { buttonClasses, type ButtonSize } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PrayButtonProps {
  requestId: string;
  /** Whether the viewer already prayed today (server truth). */
  prayed: boolean;
  signedIn: boolean;
  /** Where to return after signing in. */
  nextPath: string;
  size?: ButtonSize;
  className?: string;
}

/**
 * "Ich bete mit" – toggles today's support optimistically and settles on the
 * server result. Guests get a link to the login page instead.
 */
export function PrayButton({ requestId, prayed, signedIn, nextPath, size = "sm", className }: PrayButtonProps) {
  const [optimistic, setOptimistic] = useOptimistic(prayed);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <Link
        href={`/anmelden?next=${encodeURIComponent(nextPath)}`}
        data-tour="prayer-pray"
        className={buttonClasses("ghost", size, cn("bg-area-gebet-soft hover:bg-area-gebet-soft", className))}
      >
        <Heart aria-hidden="true" className="text-area-gebet" />
        Ich bete mit
      </Link>
    );
  }

  function toggle() {
    setError(null);
    startTransition(async () => {
      setOptimistic(!optimistic);
      const result = await togglePrayed(requestId);
      if (result.ok === false) setError(result.message ?? "Das hat leider nicht geklappt.");
    });
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={optimistic}
        aria-busy={pending || undefined}
        data-tour="prayer-pray"
        className={cn(
          buttonClasses("ghost", size),
          optimistic ? "bg-area-gebet text-[#2b2340] hover:bg-area-gebet" : "bg-area-gebet-soft text-foreground hover:bg-area-gebet-soft",
          className,
        )}
      >
        {optimistic ? <Check aria-hidden="true" /> : <Heart aria-hidden="true" className="text-area-gebet" />}
        {optimistic ? "Heute gebetet" : "Ich bete mit"}
      </button>
      {error ? (
        <span role="alert" className="text-danger text-xs font-medium">
          {error}
        </span>
      ) : null}
    </span>
  );
}
