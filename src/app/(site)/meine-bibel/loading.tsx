export default function MeineBibelLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl animate-pulse px-4 py-10 sm:px-6 md:py-14" aria-busy="true" aria-label="Lädt …">
      <div className="bg-surface-muted h-9 w-56 rounded-lg" />
      <div className="bg-surface-muted mt-4 h-5 w-full max-w-lg rounded" />
      <div className="rounded-card bg-surface-muted mt-8 h-28" />
      <div className="mt-10 flex gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="bg-surface-muted h-8 w-28 rounded" />
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-card bg-surface-muted h-20" />
        ))}
      </div>
    </main>
  );
}
