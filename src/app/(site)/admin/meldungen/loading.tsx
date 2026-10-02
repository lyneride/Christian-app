export default function ReportsLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Lädt …">
      <div className="h-8 w-40 rounded-lg bg-surface-muted" />
      <div className="mt-2 h-4 w-80 max-w-full rounded bg-surface-muted" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-9 w-24 rounded-lg bg-surface-muted" />
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-36 rounded-card bg-surface-muted" />
        ))}
      </div>
    </div>
  );
}
