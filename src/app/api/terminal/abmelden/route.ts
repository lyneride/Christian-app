import { deleteTerminalSession, json } from "@/lib/terminal/auth";

/** Ends the terminal's session (the token becomes useless at once). */
export async function POST(request: Request) {
  try {
    await deleteTerminalSession(request);
  } catch (err) {
    console.error("[terminal] Abmelden fehlgeschlagen:", err);
  }
  return json({ ok: true });
}
