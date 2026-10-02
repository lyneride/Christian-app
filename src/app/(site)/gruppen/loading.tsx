export default function GroupsLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl animate-pulse px-4 py-10 sm:px-6 md:py-14" aria-busy="true" aria-label="Lädt …">
      <div className="h-10 w-40 rounded-lg bg-surface-muted" />
      <div className="mt-3 h-5 w-full max-w-lg rounded bg-surface-muted" />
      <div className="mt-8 flex gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-surface-muted" />
        ))}
      </div>
      <div className="mt-3 h-11 w-full rounded-xl bg-surface-muted" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-44 rounded-card bg-surface-muted" />
        ))}
      </div>
    </main>
  );
}
