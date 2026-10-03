# Bleibe kostenlos veröffentlichen (Vercel + Neon + Gmail)

Alles in dieser Anleitung ist im kostenlosen Tarif nutzbar, ohne Kreditkarte. Ergebnis: eine echte, öffentlich
erreichbare Instanz unter `https://<name>.vercel.app` mit Datenbank, E-Mail-Versand, Profilbildern und täglichen
Erinnerungen.

## Kurzweg ohne Terminal (geht komplett am Handy)

Der Vercel-Build führt Migrationen und Seed automatisch aus (`npm run build:vercel`). Du brauchst also nur Browser-Konten:

1. **neon.tech** → mit GitHub anmelden → „New project“ (Region Frankfurt) → „Connection string“ kopieren (Haken „Pooled“).
2. **vercel.com** → mit GitHub anmelden → „Add New → Project“ → `Christian-app` importieren.
   Unter „Settings → Git → Production Branch“ den Branch `claude/christian-community-website-ewj4xr` wählen
   (oder vorher auf GitHub einen Pull Request nach `main` mergen).
3. Vor dem Deploy unter „Environment Variables“ eintragen:
   `DATABASE_URL` (Neon), `AUTH_SECRET` (irgendein langer zufälliger Satz, mindestens 32 Zeichen),
   `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_USERNAME`, `SEED_ADMIN_NAME` (dein Admin-Konto),
   `CRON_SECRET` (noch ein langer zufälliger Satz), `APP_URL` (zunächst `https://christian-app.vercel.app`, nach dem
   ersten Deploy auf die echte Adresse korrigieren), optional die `SMTP_*`-Werte aus Abschnitt 2.
4. „Deploy“. Nach 3–4 Minuten ist die Seite live; mit deinem Admin-Konto anmelden.
5. Profilbilder: Projekt → „Storage“ → „Create → Blob“ → „Connect“, dann einmal „Redeploy“.

## 0. Voraussetzungen

- GitHub-Konto mit dem Repository `lyneride/Christian-app` (Branch `claude/christian-community-website-ewj4xr`
  oder `main`, nachdem du gemergt hast).
- Node 22 lokal (nur für Migrationen/Seed).

## 1. Datenbank: Neon (PostgreSQL, kostenlos)

1. <https://neon.tech> → „Sign up“ (mit GitHub). Projekt anlegen, Region **Frankfurt (eu-central-1)**.
2. Im Projekt „Connection string“ kopieren (Format `postgresql://…@….neon.tech/neondb?sslmode=require`).
   Den Haken „Pooled connection“ aktivieren – das ist die URL für Vercel.
3. Lokal einmalig Tabellen und Inhalte anlegen:

   ```bash
   cd Christian-app
   DATABASE_URL="postgresql://…sslmode=require" npm run db:deploy
   DATABASE_URL="postgresql://…sslmode=require" SEED_ADMIN_EMAIL=deine@mail.de SEED_ADMIN_PASSWORD='ein-langes-passwort' SEED_ADMIN_USERNAME=kolja SEED_ADMIN_NAME='Kolja' npm run db:seed
   ```

   Das legt die 18 Lesepläne und dein Admin-Konto an. (`SEED_DEMO=1` würde zusätzlich Demo-Mitglieder anlegen –
   für den echten Betrieb weglassen.)

Alternativen mit gleicher Vorgehensweise: Supabase (Project → Database → Connection string, „Session pooler“) oder
Prisma Postgres (`npx create-db`).

## 2. E-Mail: Gmail mit App-Passwort (kostenlos, 500 Mails/Tag)

1. Google-Konto → Sicherheit → Bestätigung in zwei Schritten aktivieren → „App-Passwörter“ → Name „Bleibe“ →
   16-stelliges Passwort kopieren.
2. Werte für Vercel (Schritt 3):
   `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=deine@gmail.com`, `SMTP_PASS=<App-Passwort>`,
   `MAIL_FROM="Bleibe <deine@gmail.com>"`.

Alternative ohne Gmail: Brevo (brevo.com, 300 Mails/Tag): `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_PORT=587`,
`SMTP_USER=<Brevo-Login-Mail>`, `SMTP_PASS=<SMTP-Schlüssel>`; der Absender muss in Brevo bestätigt sein.

## 3. Hosting: Vercel (kostenlos)

1. <https://vercel.com> → „Sign up“ mit GitHub → „Add New… → Project“ → Repository `Christian-app` importieren.
   Framework wird als Next.js erkannt; Build-Befehl bleibt `next build`.
2. Unter „Environment Variables“ eintragen (alle für Production und Preview):

   | Name                  | Wert                                                        |
   | --------------------- | ----------------------------------------------------------- |
   | `DATABASE_URL`        | Neon-Connection-String (pooled, mit `sslmode=require`)      |
   | `AUTH_SECRET`         | Ausgabe von `openssl rand -base64 48`                       |
   | `APP_URL`             | `https://<projektname>.vercel.app` (nach dem ersten Deploy) |
   | `CRON_SECRET`         | Ausgabe von `openssl rand -hex 32`                          |
   | `SMTP_HOST` … `MAIL_FROM` | Werte aus Schritt 2                                     |

3. „Deploy“ klicken. Nach 2–3 Minuten ist die Seite unter `https://<projektname>.vercel.app` erreichbar.
   Danach `APP_URL` auf genau diese Adresse setzen und einmal „Redeploy“.
4. Profilbilder: Vercel → Projekt → „Storage“ → „Create Database“ → **Blob** (kostenlos 1 GB) → „Connect to
   project“. Vercel setzt `BLOB_READ_WRITE_TOKEN` automatisch; danach einmal Redeploy.
5. Erinnerungen: `vercel.json` enthält bereits den täglichen Cron (`/api/cron/reminders`, 06:00 UTC). Vercel sendet
   dabei automatisch `Authorization: Bearer $CRON_SECRET`. (Im Hobby-Tarif ist höchstens ein Lauf pro Tag möglich.)
6. Jeder `git push` auf den verbundenen Branch löst automatisch ein neues Deployment aus.

## 4. Nach dem ersten Start

- Mit dem Admin-Konto aus Schritt 1 anmelden → `/admin` prüfen.
- `src/app/(site)/(static)/impressum/page.tsx` und `datenschutz/page.tsx`: Platzhalter in eckigen Klammern durch
  deine echten Angaben ersetzen (Name, Anschrift, E-Mail, Hosting-Anbieter „Vercel Inc., USA“ bzw. Neon). Für eine
  Community-Seite ist ein Impressum in Deutschland Pflicht.
- Eigene Domain (optional, kostet ca. 10 €/Jahr): Vercel → Projekt → Domains.

## 5. Updates einspielen

```bash
git pull
npm install
DATABASE_URL="…" npm run db:deploy   # nur wenn neue Migrationen dazugekommen sind
git push                              # Vercel baut automatisch
```

## Was im kostenlosen Rahmen bleibt

- Vercel Hobby: 100 GB Traffic/Monat, Serverless-Funktionen, 1 Cron/Tag, Blob 1 GB.
- Neon Free: 0,5 GB Datenbank, pausiert nach Inaktivität automatisch (erster Aufruf danach dauert ~1 s länger).
- Gmail: 500 Mails/Tag. Für mehr später eine eigene Domain mit Resend/Brevo verifizieren.
