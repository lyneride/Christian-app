import type { ReactNode } from "react";

/** Layout for long-form static pages (legal, help). */
export function ProsePage({ title, lead, updated, children }: { title: string; lead?: string; updated?: string; children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {lead ? <p className="mt-3 text-lg text-muted-foreground">{lead}</p> : null}
        {updated ? <p className="mt-2 text-sm text-muted-foreground">Stand: {updated}</p> : null}
      </header>
      <div className="prose-static space-y-6 leading-relaxed [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_p]:text-foreground/90">
        {children}
      </div>
    </main>
  );
}
