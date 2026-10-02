export default function PlansLoading() {
  return (
    <main
      className="mx-auto w-full max-w-6xl animate-pulse px-4 py-10 sm:px-6 md:py-14"
      aria-busy="true"
      aria-label="Lädt …"
    >
      <div className="max-w-prose space-y-4">
        <div className="h-10 w-56 rounded-lg bg-surface-muted" />
        <div className="h-5 w-full rounded bg-surface-muted" />
        <div className="h-5 w-3/4 rounded bg-surface-muted" />
      </div>
      {Array.from({ length: 2 }, (_, s) => (
        <div key={s} className="mt-12 space-y-4">
          <div className="h-7 w-48 rounded bg-surface-muted" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-48 rounded-card bg-surface-muted" />
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
