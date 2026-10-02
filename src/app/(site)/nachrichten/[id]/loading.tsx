export default function ConversationLoading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 animate-pulse flex-col px-4 sm:px-6" aria-busy="true" aria-label="Lädt …">
      <div className="flex items-center gap-3 border-b border-border py-3">
        <div className="size-9 rounded-full bg-surface-muted" />
        <div className="size-8 rounded-full bg-surface-muted" />
        <div className="h-4 w-40 rounded bg-surface-muted" />
      </div>
      <div className="flex-1 space-y-3 py-6">
        <div className="mx-auto h-6 w-20 rounded-full bg-surface-muted" />
        <div className="h-14 w-2/3 rounded-2xl bg-surface-muted" />
        <div className="ml-auto h-10 w-1/2 rounded-2xl bg-surface-muted" />
        <div className="h-20 w-3/4 rounded-2xl bg-surface-muted" />
        <div className="ml-auto h-12 w-2/5 rounded-2xl bg-surface-muted" />
      </div>
      <div className="border-t border-border py-3">
        <div className="h-11 rounded-xl bg-surface-muted" />
      </div>
    </main>
  );
}
