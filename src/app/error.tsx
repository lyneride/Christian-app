"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Rebi } from "@/components/rebi/rebi";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <Rebi pose="think" size={130} priority />
      <h1 className="mt-4 text-[28px] leading-tight font-black">Da ist etwas schiefgelaufen.</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Der Fehler wurde protokolliert. Versuch es einfach noch einmal.
        {error.digest ? <span className="mt-2 block text-xs">Fehlercode: {error.digest}</span> : null}
      </p>
      <div className="mt-8 grid w-full max-w-sm gap-3 sm:flex sm:w-auto sm:max-w-none">
        <Button size="lg" onClick={() => retry()}>
          Noch einmal versuchen
        </Button>
        <ButtonLink href="/" variant="outline" size="lg">
          Zur Startseite
        </ButtonLink>
      </div>
    </main>
  );
}
