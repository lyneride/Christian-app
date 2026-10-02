export default function AuditLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Lädt …">
      <div className="bg-surface-muted h-8 w-40 rounded-lg" />
      <div className="bg-surface-muted mt-2 h-4 w-96 max-w-full rounded" />
      <div className="mt-8 space-y-2">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="bg-surface-muted h-12 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
