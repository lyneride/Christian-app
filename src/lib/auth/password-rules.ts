/** Password rules shared by server actions and client forms (no server-only imports here). */
/** Minimal strength rules: length ≥ 8, not purely numeric, not in a tiny deny list. */
const DENY = new Set(["password", "passwort", "12345678", "qwertzui", "qwertyui", "jesus123", "christus", "halleluja"]);

export function passwordProblems(password: string): string[] {
  const problems: string[] = [];
  if (password.length < 8) problems.push("Mindestens 8 Zeichen.");
  if (password.length > 128) problems.push("Höchstens 128 Zeichen.");
  if (/^\d+$/.test(password)) problems.push("Nicht nur Ziffern.");
  if (DENY.has(password.toLowerCase())) problems.push("Dieses Passwort ist zu leicht zu erraten.");
  return problems;
}
