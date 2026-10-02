export default function ProfilLoading() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6" aria-busy="true" aria-label="Profil wird geladen">
      <div className="animate-pulse rounded-card border border-border bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="mx-auto size-24 rounded-full bg-surface-muted sm:mx-0" />
          <div className="flex-1 space-y-3">
            <div className="h-7 w-48 rounded bg-surface-muted" />
            <div className="h-4 w-24 rounded bg-surface-muted" />
            <div className="h-4 w-full max-w-md rounded bg-surface-muted" />
            <div className="h-10 w-28 rounded-full bg-surface-muted" />
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="h-32 animate-pulse rounded-card bg-surface-muted" />
        <div className="h-32 animate-pulse rounded-card bg-surface-muted" />
      </div>
    </main>
  );
}
