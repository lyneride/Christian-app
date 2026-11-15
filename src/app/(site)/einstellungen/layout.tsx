import { SettingsNav } from "@/components/settings/settings-nav";

/** Shell of the settings area. Pages check the session themselves via requireUser(). */
export default function EinstellungenLayout({ children }: LayoutProps<"/einstellungen">) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
      <h1 className="text-[30px] leading-tight sm:text-4xl">Einstellungen</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10">
        <SettingsNav />
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </main>
  );
}
