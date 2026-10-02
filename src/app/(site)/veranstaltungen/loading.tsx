export default function EventsLoading() {
  return (
    <main
      className="mx-auto w-full max-w-5xl animate-pulse px-4 py-10 sm:px-6 md:py-14"
      aria-busy="true"
      aria-label="Lädt …"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <div className="bg-surface-muted h-10 w-40 rounded-lg" />
          <div className="bg-surface-muted h-5 w-full max-w-md rounded" />
        </div>
        <div className="bg-surface-muted h-12 w-44 rounded-full" />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <div className="bg-surface-muted h-10 w-48 rounded-full" />
        <div className="bg-surface-muted h-10 w-64 rounded-full" />
      </div>
      <div className="mt-8 space-y-4">
        <div className="bg-surface-muted h-4 w-32 rounded" />
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-card border-border bg-surface flex gap-4 border p-5">
            <div className="bg-surface-muted h-20 w-16 rounded-xl" />
            <div className="flex-1 space-y-3">
              <div className="bg-surface-muted h-6 w-2/3 rounded" />
              <div className="bg-surface-muted h-4 w-1/2 rounded" />
              <div className="bg-surface-muted h-4 w-1/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
