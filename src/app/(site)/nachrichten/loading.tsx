export default function MessagesLoading() {
  return (
    <main className="mx-auto w-full max-w-3xl animate-pulse px-4 py-10 sm:px-6 md:py-14" aria-busy="true" aria-label="Lädt …">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="h-9 w-48 rounded-lg bg-surface-muted" />
          <div className="h-4 w-72 max-w-full rounded bg-surface-muted" />
        </div>
        <div className="h-10 w-40 rounded-full bg-surface-muted" />
      </div>
      <div className="mt-8 space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-card border border-border px-4 py-3">
            <div className="size-10 rounded-full bg-surface-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-surface-muted" />
              <div className="h-3 w-2/3 rounded bg-surface-muted" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
