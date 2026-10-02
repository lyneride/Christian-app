export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-10" aria-busy="true" aria-label="Lädt …">
      <div className="h-8 w-40 rounded-lg bg-surface-muted" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-28 rounded-card bg-surface-muted" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-32 rounded-card bg-surface-muted" />
        ))}
      </div>
    </div>
  );
}
