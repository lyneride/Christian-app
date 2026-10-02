import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/env";

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const e = env();
  if (!e.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: e.SMTP_HOST,
      port: e.SMTP_PORT,
      secure: e.SMTP_PORT === 465,
      auth: e.SMTP_USER ? { user: e.SMTP_USER, pass: e.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

/**
 * Sends an e-mail. Without SMTP configuration (development) the mail is
 * printed to the server console instead, including any links, so flows like
 * e-mail verification and password reset can be tested locally.
 */
export async function sendMail(mail: Mail): Promise<void> {
  const t = getTransporter();
  if (!t) {
    console.info(`\n──── E-Mail (nicht gesendet, kein SMTP konfiguriert) ────\nAn: ${mail.to}\nBetreff: ${mail.subject}\n\n${mail.text}\n────────────────────────────────────────────────────────\n`);
    return;
  }
  await t.sendMail({ from: env().MAIL_FROM, to: mail.to, subject: mail.subject, text: mail.text, html: mail.html });
}

export function layoutMail(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="de"><body style="font-family:system-ui,sans-serif;background:#faf7f2;padding:24px;color:#221f1a">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e6dfd4">
<h1 style="font-size:20px;margin:0 0 16px">${title}</h1>${bodyHtml}
<p style="margin-top:32px;font-size:12px;color:#6b645b">Bleibe – Bibel. Gebet. Gemeinschaft.</p></div></body></html>`;
}
