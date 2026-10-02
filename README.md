# Bleibe – Bibel. Gebet. Gemeinschaft.

Eine Community-Webseite für Christen: Bibel lesen und verstehen, miteinander beten, einander tragen und
inspirieren – werbefrei, datensparsam, ohne Abo-Paywall.

> „Bleibt in mir und ich in euch.“ – Johannes 15,4

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

## Lizenz

Quellcode: MIT. Bibeltexte und Querverweise unterliegen den in `data/bibles/translations.json` genannten Lizenzen.
