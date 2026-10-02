import type { Metadata } from "next";
import { MonitorSmartphone } from "lucide-react";
import { SettingsSection } from "@/components/settings/settings-section";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/dal";
import { listSessions, readSession } from "@/lib/auth/session";
import { describeUserAgent } from "@/lib/user-agent";
import { formatDate, formatRelative } from "@/lib/utils";
import { EndOtherSessionsButton, EndSessionButton } from "./session-buttons";

export const metadata: Metadata = { title: "Sitzungen" };

export default async function SitzungenPage() {
  const user = await requireUser("/einstellungen/sitzungen");
  const [sessions, current] = await Promise.all([listSessions(user.id), readSession()]);
  const others = sessions.filter((s) => s.id !== current?.sessionId).length;

  return (
    <SettingsSection
      id="sitzungen"
      title="Angemeldete Geräte"
      description="Überall, wo du angemeldet bist. Beende Sitzungen, die du nicht mehr brauchst oder nicht kennst."
    >
      {sessions.length === 0 ? (
        <EmptyState icon={<MonitorSmartphone aria-hidden="true" />} title="Keine aktiven Sitzungen" />
      ) : (
        <ul className="divide-y divide-border">
          {sessions.map((session) => {
            const isCurrent = session.id === current?.sessionId;
            return (
              <li key={session.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {describeUserAgent(session.userAgent)}
                    {isCurrent ? <Badge variant="primary">Dieses Gerät</Badge> : null}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Zuletzt aktiv {formatRelative(session.lastActiveAt)} · angemeldet seit {formatDate(session.createdAt)}
                  </p>
                </div>
                <EndSessionButton sessionId={session.id} isCurrent={isCurrent} />
              </li>
            );
          })}
        </ul>
      )}
      {others > 0 ? (
        <div className="mt-6 border-t border-border pt-5">
          <EndOtherSessionsButton count={others} />
        </div>
      ) : null}
    </SettingsSection>
  );
}
