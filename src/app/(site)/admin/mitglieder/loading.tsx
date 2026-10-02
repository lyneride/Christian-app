export default function MembersLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Lädt …">
      <div className="h-8 w-40 rounded-lg bg-surface-muted" />
      <div className="mt-2 h-4 w-72 max-w-full rounded bg-surface-muted" />
      <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_10rem_auto]">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-11 rounded-xl bg-surface-muted" />
        ))}
      </div>
      <div className="mt-6 space-y-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-14 rounded-xl bg-surface-muted" />
        ))}
      </div>
    </div>
  );
}
