export default function EventsLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl animate-pulse px-4 py-10 sm:px-6 md:py-14" aria-busy="true" aria-label="Lädt …">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <div className="h-10 w-40 rounded-lg bg-surface-muted" />
          <div className="h-5 w-full max-w-md rounded bg-surface-muted" />
        </div>
        <div className="h-12 w-44 rounded-full bg-surface-muted" />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <div className="h-10 w-48 rounded-full bg-surface-muted" />
        <div className="h-10 w-64 rounded-full bg-surface-muted" />
      </div>
      <div className="mt-8 space-y-4">
        <div className="h-4 w-32 rounded bg-surface-muted" />
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex gap-4 rounded-card border border-border bg-surface p-5">
            <div className="h-20 w-16 rounded-xl bg-surface-muted" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-2/3 rounded bg-surface-muted" />
              <div className="h-4 w-1/2 rounded bg-surface-muted" />
              <div className="h-4 w-1/3 rounded bg-surface-muted" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
