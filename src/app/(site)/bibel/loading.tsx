export default function BibleLoading() {
  return (
    <main
      className="mx-auto w-full max-w-6xl animate-pulse px-4 py-10 sm:px-6 md:py-14"
      aria-busy="true"
      aria-label="Lädt …"
    >
      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12">
        <div className="space-y-4">
          <div className="bg-surface-muted h-10 w-48 rounded-lg" />
          <div className="bg-surface-muted h-5 w-full max-w-md rounded" />
          <div className="bg-surface-muted mt-8 h-11 w-full rounded-xl" />
          <div className="bg-surface-muted h-9 w-56 rounded-xl" />
        </div>
        <div className="rounded-card bg-surface-muted h-48" />
      </div>
      <div className="mt-14 space-y-6">
        <div className="bg-surface-muted h-7 w-56 rounded" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="bg-surface-muted h-14 rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
