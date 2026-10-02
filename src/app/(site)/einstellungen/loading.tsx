export default function EinstellungenLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Einstellungen werden geladen">
      <div className="animate-pulse rounded-card border border-border bg-surface p-6">
        <div className="h-6 w-40 rounded bg-surface-muted" />
        <div className="mt-6 space-y-4">
          <div className="h-10 rounded-xl bg-surface-muted" />
          <div className="h-10 rounded-xl bg-surface-muted" />
          <div className="h-24 rounded-xl bg-surface-muted" />
        </div>
      </div>
    </div>
  );
}
