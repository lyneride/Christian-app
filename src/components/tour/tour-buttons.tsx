"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AREAS } from "@/components/layout/areas";
import { startTour } from "./tour-events";

/** Buttons on the Ich page: replay the welcome tour or one area tour. */
export function TourButtons() {
  const router = useRouter();
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={() => startTour("welcome")}>
        Tour mit Rebi
      </Button>
      {AREAS.filter((a) => a.key !== "ich").map((a) => (
        <Button key={a.key} size="sm" variant="outline" onClick={() => router.push(`${a.key === "heute" ? "/start" : a.href}?tour=1`)}>
          {a.label}
        </Button>
      ))}
    </div>
  );
}
