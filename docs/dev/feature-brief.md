# Feature-Brief für Entwickler (und Agenten)

Alle Features folgen denselben Regeln. Lies zuerst `docs/dev/conventions.md` (Next 16 / Prisma 7 / Tailwind 4).

## Architektur

- **Routen** liegen unter `src/app/(site)/<bereich>/…` (Seitengerüst mit Header/Footer). Auth-Seiten unter `src/app/(auth)`.
  Deutsche URL-Namen: `/bibel`, `/gebet`, `/gemeinschaft`, `/gruppen`, `/veranstaltungen`, `/zeugnisse`, `/leseplaene`,
  `/tagebuch`, `/merken` (Lernverse), `/nachrichten`, `/benachrichtigungen`, `/einstellungen`, `/start`, `/@benutzername`, `/admin`.
- **Datenzugriff** nur serverseitig: `prisma` aus `@/lib/db`. Jede Seite/Action holt den Nutzer über `getCurrentUser()` /
  `requireUser(returnTo)` / `requireRole()` aus `@/lib/auth/dal` (nie nur im Layout prüfen).
- **Server Actions** in `actions.ts` je Bereich (`"use server"`), Signatur `(prevState: ActionState, formData: FormData)`
  für `useActionState`. Validierung mit Zod 4 (`@/lib/validation/<bereich>.ts`), Fehler als Rückgabewert
  (`fieldErrors(error)`, `failure()`, `success()` aus `@/lib/action-state`). `redirect()` außerhalb von try/catch.
  Nach Mutationen `revalidatePath(...)`. Autorisierung immer in der Action prüfen (Eigentümer, Gruppenrolle, Moderator).
- **Sichtbarkeit** über `canView()` / `visibilityWhere()` aus `@/lib/visibility`; Nutzerinhalte haben `visibility`
  (PUBLIC/MEMBERS/GROUP/PRIVATE) und `deletedAt` (Soft-Delete; gelöschte Inhalte nie anzeigen).
- **Markdown**: Nutzertexte werden als Markdown gespeichert und mit `renderMarkdown()` aus `@/lib/markdown` gerendert
  (sanitisiert, Bibelstellen automatisch verlinkt). Vorschau-Text mit `markdownToText()`.
- **Benachrichtigungen** über `notify()` / `notifyMany()` aus `@/lib/notifications`.
- **Bibel**: Bücher/Referenzen über `@/lib/bible/books` und `@/lib/bible/reference` (`verseKey`, `parseVerseKey`,
  `formatReference`, `referencePath`); Texte über `@/lib/bible/data` (server-only).
- **Pagination**: `parsePage(searchParams.seite)` + `<Pagination />` aus `@/components/ui/pagination`.
- **UI**: Komponenten aus `@/components/ui` (Button, ButtonLink, Input, Textarea, Select, Checkbox, Field, Card*,
  Badge, Avatar, Alert, EmptyState, Pagination). Icons: `lucide-react`. Klassen: Tailwind mit den Tokens aus
  `globals.css` (`bg-surface`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary`, `bg-accent-soft`,
  `rounded-card`, `shadow-soft`, `font-serif`, `scripture`).
- **Tests**: Reine Logik (Validierung, Helfer) mit Vitest neben der Datei (`*.test.ts`). Seiten werden per Playwright
  (E2E) getestet; keine async Server Components in Vitest rendern.

## Sprache und Ton

- UI-Texte auf Deutsch, du-Form, warm, klar, ohne Kitsch und ohne Druck (keine Streak-Mahnungen, keine Schuldgefühle).
- Bibelstellen im deutschen Format: „Johannes 3,16“ (`formatReference(ref, "de")`).
- Keine erfundenen Andachtstexte oder Predigten im Code. Inhalte kommen von Mitgliedern (oder aus der Bibel selbst).
- Fehlermeldungen konkret („Der Titel braucht mindestens 3 Zeichen.“), Erfolgsmeldungen kurz.

## Qualität

- Barrierefreiheit: Labels für jedes Feld (`<Field>`), `role="alert"` für Fehler, Buttons mit `aria-label` bei Icon-only,
  Tastaturbedienbarkeit, Fokus sichtbar (global).
- Mobile first; Listen mit Leerzustand (`EmptyState`); Ladezustände (`loading.tsx` oder Suspense) wo sinnvoll.
- Vor dem Abschluss: `npx next typegen && npx tsc --noEmit`, `npx eslint src`, `npx vitest run` – alles grün.
- Keine neuen npm-Pakete ohne Rücksprache. Keine Änderungen an `prisma/schema.prisma` ohne Rücksprache
  (fehlende Felder im Abschlussbericht nennen).
