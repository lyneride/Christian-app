import "server-only";
import { env } from "@/lib/env";
import { layoutMail, sendMail } from "@/lib/mail/send";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Confirmation mail for an e-mail change, sent to the NEW address. */
export async function sendEmailChangeMail(target: { to: string; name: string }, token: string) {
  const link = `${env().APP_URL}/einstellungen/konto/email-bestaetigen/${token}`;
  const name = target.name.trim() || "du";
  await sendMail({
    to: target.to,
    subject: "Bitte bestätige deine neue E-Mail-Adresse",
    text: [
      `Hallo ${name},`,
      "",
      "du möchtest die E-Mail-Adresse deines Bleibe-Kontos auf diese Adresse ändern. Bestätige das bitte über diesen Link:",
      "",
      link,
      "",
      "Der Link ist 24 Stunden gültig. Falls du das nicht warst, kannst du diese E-Mail ignorieren – deine Adresse bleibt unverändert.",
    ].join("\n"),
    html: layoutMail(
      "Neue E-Mail-Adresse bestätigen",
      `<p>Hallo ${escapeHtml(name)},</p>
<p>du möchtest die E-Mail-Adresse deines Bleibe-Kontos auf diese Adresse ändern:</p>
<p><a href="${link}" style="display:inline-block;background:#27416f;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px">E-Mail-Adresse bestätigen</a></p>
<p style="font-size:13px;color:#6b645b">Oder kopiere diesen Link in deinen Browser:<br><a href="${link}">${link}</a></p>
<p style="font-size:13px;color:#6b645b">Der Link ist 24 Stunden gültig. Falls du das nicht warst, kannst du diese E-Mail ignorieren – deine Adresse bleibt unverändert.</p>`,
    ),
  });
}
