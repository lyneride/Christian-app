import { json, terminalUser, unauthorized } from "@/lib/terminal/auth";
import { terminalState } from "@/lib/terminal/service";

/** Current state for the terminal's local copy (plans, progress, reading log). */
export async function GET(request: Request) {
  const user = await terminalUser(request);
  if (!user) return unauthorized();
  try {
    return json(await terminalState(user));
  } catch (err) {
    console.error("[terminal] Stand konnte nicht geladen werden:", err);
    return json({ error: "Der Stand konnte gerade nicht geladen werden." }, 500);
  }
}
