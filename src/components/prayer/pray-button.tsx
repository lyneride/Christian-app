"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { Check, HandHeart } from "lucide-react";
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
        className={buttonClasses("outline", size, className)}
      >
        <HandHeart aria-hidden="true" />
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
        className={cn(
          buttonClasses(optimistic ? "secondary" : "outline", size),
          optimistic && "text-success",
          className,
        )}
      >
        {optimistic ? <Check aria-hidden="true" /> : <HandHeart aria-hidden="true" />}
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
