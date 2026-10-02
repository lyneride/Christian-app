import type { Metadata } from "next";
import { Suspense } from "react";
import { Shield } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { getCurrentUser, isModerator } from "@/lib/auth/dal";
import { countOpenReports } from "@/lib/moderation/queries";

export const metadata: Metadata = {
  title: { default: "Moderation", template: "%s – Moderation · Bleibe" },
  robots: { index: false, follow: false },
};

/** Navigation with the open-report badge; the count is only loaded for moderators (pages enforce the role themselves). */
async function NavWithCount() {
  const user = await getCurrentUser();
  const openCount = user && isModerator(user) ? await countOpenReports() : null;
  return <AdminNav openCount={openCount} />;
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-12">
      <div className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <Shield className="size-4" aria-hidden="true" />
            Moderation
          </p>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            Moderation handelt im Auftrag der Gemeinschaft – jede Entscheidung wird protokolliert.
          </p>
        </div>
        <Suspense fallback={<AdminNav openCount={null} />}>
          <NavWithCount />
        </Suspense>
      </div>
      <div className="mt-8">{children}</div>
    </main>
  );
}
