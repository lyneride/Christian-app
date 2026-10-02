import { SettingsNav } from "@/components/settings/settings-nav";

/** Shell of the settings area. Pages check the session themselves via requireUser(). */
export default function EinstellungenLayout({ children }: LayoutProps<"/einstellungen">) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">Einstellungen</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10">
        <SettingsNav />
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </main>
  );
}
