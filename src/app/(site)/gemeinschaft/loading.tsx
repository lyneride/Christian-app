export default function CommunityLoading() {
  return (
    <main className="mx-auto w-full max-w-3xl animate-pulse px-4 py-10 sm:px-6 md:py-14" aria-busy="true" aria-label="Lädt …">
      <div className="h-10 w-56 rounded-lg bg-surface-muted" />
      <div className="mt-3 h-5 w-full max-w-md rounded bg-surface-muted" />
      <div className="mt-8 h-40 rounded-card bg-surface-muted" />
      <div className="mt-8 flex gap-3 border-b border-border pb-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-6 w-16 rounded bg-surface-muted" />
        ))}
      </div>
      <div className="mt-6 space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="rounded-card border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-surface-muted" />
              <div className="h-4 w-40 rounded bg-surface-muted" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full rounded bg-surface-muted" />
              <div className="h-4 w-11/12 rounded bg-surface-muted" />
              <div className="h-4 w-2/3 rounded bg-surface-muted" />
            </div>
            <div className="mt-5 flex gap-2">
              <div className="h-8 w-16 rounded-full bg-surface-muted" />
              <div className="h-8 w-16 rounded-full bg-surface-muted" />
              <div className="h-8 w-16 rounded-full bg-surface-muted" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
