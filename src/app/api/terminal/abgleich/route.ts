import { json, terminalUser, unauthorized } from "@/lib/terminal/auth";
import { applyTerminalChanges, terminalState } from "@/lib/terminal/service";
import { terminalSyncSchema } from "@/lib/validation/terminal";

/**
 * Sync: the terminal sends what was done offline (queued changes), the server
 * applies them and answers with the fresh state.
 */
export async function POST(request: Request) {
  const user = await terminalUser(request);
  if (!user) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Ungültige Anfrage." }, 400);
  }
  const parsed = terminalSyncSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Zu viele oder ungültige Änderungen." }, 400);

  try {
    const result = await applyTerminalChanges(user, parsed.data.changes);
    const state = await terminalState(user);
    return json({ ...result, state });
  } catch (err) {
    console.error("[terminal] Abgleich fehlgeschlagen:", err);
    return json({ error: "Der Abgleich hat gerade nicht geklappt." }, 500);
  }
}
