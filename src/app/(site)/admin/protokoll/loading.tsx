export default function AuditLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Lädt …">
      <div className="h-8 w-40 rounded-lg bg-surface-muted" />
      <div className="mt-2 h-4 w-96 max-w-full rounded bg-surface-muted" />
      <div className="mt-8 space-y-2">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="h-12 rounded-xl bg-surface-muted" />
        ))}
      </div>
    </div>
  );
}
