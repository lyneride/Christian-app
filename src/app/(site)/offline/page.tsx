import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <WifiOff className="size-10 text-muted-foreground" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Du bist offline.</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Bereits geöffnete Bibelkapitel sind weiterhin lesbar. Sobald du wieder verbunden bist, geht es hier weiter.
      </p>
      <Link href="/bibel" className={`${buttonClasses("outline")} mt-8`}>
        Zur Bibel
      </Link>
    </main>
  );
}
