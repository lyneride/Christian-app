"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Da ist etwas schiefgelaufen.</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Der Fehler wurde protokolliert. Du kannst es noch einmal versuchen.
        {error.digest ? <span className="mt-2 block text-xs">Fehlercode: {error.digest}</span> : null}
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={() => retry()}>Noch einmal versuchen</Button>
        <ButtonLink href="/" variant="outline">
          Zur Startseite
        </ButtonLink>
      </div>
    </main>
  );
}
