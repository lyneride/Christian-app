function CardSkeleton() {
  return (
    <div className="rounded-card border-border bg-surface shadow-soft border p-5" aria-hidden="true">
      <div className="flex gap-2">
        <div className="bg-surface-muted h-5 w-20 rounded-full" />
        <div className="bg-surface-muted h-5 w-14 rounded-full" />
      </div>
      <div className="bg-surface-muted mt-3 h-6 w-2/3 rounded" />
      <div className="mt-3 space-y-2">
        <div className="bg-surface-muted h-4 w-full rounded" />
        <div className="bg-surface-muted h-4 w-5/6 rounded" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="bg-surface-muted size-6 rounded-full" />
        <div className="bg-surface-muted h-3 w-32 rounded" />
      </div>
      <div className="border-border mt-4 flex items-center justify-between border-t pt-3">
        <div className="bg-surface-muted h-4 w-40 rounded" />
        <div className="bg-surface-muted h-8 w-28 rounded-full" />
      </div>
    </div>
  );
}

export default function GebetLoading() {
  return (
    <main className="mx-auto w-full max-w-3xl animate-pulse px-4 py-8 sm:px-6" aria-busy="true">
      <p className="sr-only">Lädt …</p>
      <div className="flex items-end justify-between">
        <div>
          <div className="bg-surface-muted h-9 w-32 rounded" />
          <div className="bg-surface-muted mt-3 h-4 w-72 rounded" />
        </div>
        <div className="bg-surface-muted h-10 w-36 rounded-full" />
      </div>
      <div className="bg-surface-muted mt-6 h-10 w-64 rounded-full" />
      <div className="mt-3 flex gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="bg-surface-muted h-7 w-20 rounded-full" />
        ))}
      </div>
      <div className="mt-6 space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </main>
  );
}
