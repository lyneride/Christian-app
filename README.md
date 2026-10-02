# Bleibe – Bibel. Gebet. Gemeinschaft.

Eine Community-Webseite für Christen: Bibel lesen und verstehen, miteinander beten, einander tragen und
inspirieren – werbefrei, datensparsam, ohne Abo-Paywall.

> „Bleibt in mir und ich in euch.“ – Johannes 15,4

## Funktionen

- **Bibel**: 6 Übersetzungen (Luther 1912, Elberfelder 1905, Schlachter 1951, Luther 1545, BSB, KJV), Parallelansicht,
  Volltextsuche, 250.000 Querverweise, Tagesvers, Leseeinstellungen, Offline-Cache (PWA)
- **Studium**: Markierungen, Notizen, Lesezeichen, Leseprotokoll, Lernverse (Leitner-System), privates Tagebuch
- **Lesepläne**: 18 Pläne (7 Tage bis 2 Jahre) ohne Streak-Druck, Tagesabschnitte direkt im Reader
- **Gebet**: Gebetswand mit Kategorien, Sichtbarkeit, Anonymität, „Ich bete mit“, Ermutigungen, erhörte Gebete
- **Gemeinschaft**: Beiträge, Fragen, Zeugnisse, Impulse, Reaktionen, Kommentare; Gruppen online und vor Ort mit Rollen
- **Treffen**: Veranstaltungen mit Zu-/Absagen, Kapazität, Kalender-Export (ICS), Erinnerungen per Cron
- **Menschen**: Profile unter `/@name`, Folgen, Direktnachrichten, Benachrichtigungen, Gebetspartner-Signal
- **Konto**: E-Mail-Bestätigung, Passwort-Reset, Sitzungsverwaltung, Datenexport, Konto löschen (Anonymisierung)
- **Moderation**: Meldungen, Inhalte entfernen/wiederherstellen, Sperren, Rollen, Audit-Protokoll

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** mit eigenem Design-System (Light/Dark)
- **Prisma 7** + **SQLite** (better-sqlite3-Adapter; Postgres über `DATABASE_URL` austauschbar)
- Eigene Session-Authentifizierung (bcrypt + httpOnly-Cookies), kein Drittanbieter-Tracking
- Gemeinfreie Bibeltexte als statische Daten (`data/`), siehe [docs/dev/bible-data.md](docs/dev/bible-data.md)
- Tests: Vitest (Unit) + Playwright (E2E)

## Entwicklung

```bash
cp .env.example .env          # Secrets anpassen
npm install
npm run db:setup              # Prisma-Client generieren, Migrationen anwenden, Seed-Daten einspielen
npm run dev                   # http://localhost:3000
```

Der Seed legt ein Admin-Konto an (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, Standard `admin@bleibe.local` /
`admin-passwort-123` – vor dem Produktivbetrieb ändern). Mit `SEED_DEMO=1 npm run db:seed` kommen Demo-Mitglieder
(`mara@bleibe.local`, `jonas@…`, `elif@…`, Passwort `demo-passwort-123`), Gruppen, Anliegen und ein Treffen dazu.

Ohne SMTP-Konfiguration werden E-Mails (Bestätigung, Passwort-Reset) in der Server-Konsole ausgegeben.

## Betrieb

- Produktion: `npm run build && npm start`; Datenbank-Migrationen mit `npm run db:deploy`.
- Erinnerungen und Aufräumen: stündlich `POST /api/cron/reminders` mit `Authorization: Bearer $CRON_SECRET` aufrufen.
- Postgres statt SQLite: `provider` in `prisma/schema.prisma` auf `postgresql` setzen und den Adapter in
  `src/lib/db.ts` austauschen (`@prisma/adapter-pg`).
- Impressum und Datenschutz enthalten Platzhalter in eckigen Klammern, die vor dem Start ausgefüllt werden müssen.

Weitere Befehle:

| Befehl                | Zweck                                   |
| --------------------- | --------------------------------------- |
| `npm run typecheck`   | TypeScript prüfen                       |
| `npm run lint`        | ESLint                                  |
| `npm test`            | Unit-Tests (Vitest)                     |
| `npm run test:e2e`    | End-to-End-Tests (Playwright)           |
| `npm run build`       | Produktions-Build                       |
| `npm run db:studio`   | Prisma Studio                           |

## Dokumentation

- [docs/dev/conventions.md](docs/dev/conventions.md) – Framework-Konventionen (Next 16, Prisma 7, Tailwind 4)
- [docs/dev/bible-data.md](docs/dev/bible-data.md) – Bibeldaten und Lizenzen
- [docs/product/konzept.md](docs/product/konzept.md) – Produktkonzept (aus der Marktrecherche abgeleitet)
- [reports/](reports/) – Marktrecherche „Christliche Apps: Markt und Lücken“, Notizen unter `research_notes/`

## Lizenz

Quellcode: MIT. Bibeltexte und Querverweise unterliegen den in `data/bibles/translations.json` genannten Lizenzen.
