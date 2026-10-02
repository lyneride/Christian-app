export default function ChapterLoading() {
  return (
    <main className="flex-1" aria-busy="true" aria-label="Kapitel lädt …">
      <div className="border-border/80 bg-background/90 sticky top-14 z-30 border-b backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2 sm:px-6">
          <div className="bg-surface-muted h-9 w-9 animate-pulse rounded-full" />
          <div className="bg-surface-muted h-9 w-40 animate-pulse rounded-xl" />
          <div className="bg-surface-muted h-9 w-20 animate-pulse rounded-xl" />
          <div className="bg-surface-muted h-9 w-9 animate-pulse rounded-full" />
          <div className="bg-surface-muted ml-auto h-9 w-40 animate-pulse rounded-xl" />
        </div>
      </div>
      <div className="prose-reader animate-pulse px-4 py-8 sm:px-6 md:py-12">
        <div className="bg-surface-muted h-3 w-48 rounded" />
        <div className="bg-surface-muted mt-3 h-9 w-56 rounded-lg" />
        <div className="mt-10 space-y-3">
          {Array.from({ length: 14 }, (_, i) => (
            <div key={i} className="bg-surface-muted h-5 rounded" style={{ width: `${70 + ((i * 37) % 30)}%` }} />
          ))}
        </div>
      </div>
    </main>
  );
}
