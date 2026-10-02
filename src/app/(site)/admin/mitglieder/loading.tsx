export default function MembersLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Lädt …">
      <div className="bg-surface-muted h-8 w-40 rounded-lg" />
      <div className="bg-surface-muted mt-2 h-4 w-72 max-w-full rounded" />
      <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_10rem_auto]">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-surface-muted h-11 rounded-xl" />
        ))}
      </div>
      <div className="mt-6 space-y-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="bg-surface-muted h-14 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
