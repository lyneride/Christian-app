export default function TagebuchLoading() {
  return (
    <main
      className="mx-auto w-full max-w-3xl animate-pulse px-4 py-10 sm:px-6 md:py-14"
      aria-busy="true"
      aria-label="Lädt …"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="bg-surface-muted h-9 w-44 rounded-lg" />
          <div className="bg-surface-muted h-5 w-72 max-w-full rounded" />
        </div>
        <div className="bg-surface-muted h-10 w-36 rounded-full" />
      </div>
      <div className="mt-10 space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-card bg-surface-muted h-28" />
        ))}
      </div>
    </main>
  );
}
