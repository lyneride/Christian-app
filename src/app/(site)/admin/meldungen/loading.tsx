export default function ReportsLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Lädt …">
      <div className="bg-surface-muted h-8 w-40 rounded-lg" />
      <div className="bg-surface-muted mt-2 h-4 w-80 max-w-full rounded" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="bg-surface-muted h-9 w-24 rounded-lg" />
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-card bg-surface-muted h-36" />
        ))}
      </div>
    </div>
  );
}
