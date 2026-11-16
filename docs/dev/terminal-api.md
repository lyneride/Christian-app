# Terminal-API (Bleibe Terminal für das iPhone)

Die native iPhone-App „Bleibe Terminal“ (Projekt `~/Projekte/bleibe-terminal`) hält eine lokale Kopie der
Lesepläne und des Leseprotokolls, funktioniert offline und gleicht sich über diese Schnittstelle ab.

| Route                         | Zweck                                                                 |
| ----------------------------- | --------------------------------------------------------------------- |
| `POST /api/terminal/anmelden` | `{ email, password, device }` → `{ token, expiresAt, user }`          |
| `GET /api/terminal/stand`     | Pläne (aktive mit allen Tagen), Fortschritt, Leseprotokoll (400 Tage) |
| `POST /api/terminal/abgleich` | `{ changes: [...] }` → `{ applied, rejected, state }`                 |
| `POST /api/terminal/abmelden` | Token ungültig machen                                                 |

- Authentifizierung: `Authorization: Bearer <token>`. Der Token ist eine normale Zeile in `Session`
  (User-Agent `Bleibe-Terminal (…)`), erscheint also in der Sitzungsliste und lässt sich dort widerrufen.
  Nur Terminal-Sitzungen werden als Bearer akzeptiert; die Laufzeit verlängert sich bei Nutzung (365 Tage).
- Änderungen: `planDay` (`planId`, `day`, `done`) und `chapter` (`book`, `chapter`, `translation`), jeweils mit
  `id` (UUID vom Gerät) und `at` (Zeitpunkt auf dem Gerät). Der Server wendet sie chronologisch mit denselben
  Regeln an wie `markDay` und „Kapitel gelesen“ (`src/lib/terminal/service.ts`).
- `rejected[].retry = false`: endgültig abgelehnt (z. B. Plan gelöscht) – das Terminal verwirft die Änderung.
  `retry = true`: vorübergehender Fehler – das Terminal versucht es später erneut.
- Bibeldaten der App: `npx tsx --conditions react-server scripts/export-terminal-data.ts <Ziel>` plus die
  Übersetzungsdateien aus `data/bibles/`.
