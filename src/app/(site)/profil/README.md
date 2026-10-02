# Mitgliederprofile

Die öffentliche Profil-URL ist `/@benutzername`. Ein Ordner namens `@[username]` würde von Next.js als
Parallel-Route-Slot interpretiert, deshalb liegt die echte Seite unter `src/app/(site)/profil/[username]/page.tsx`.
Die hübsche URL wird in `next.config.ts` per Rewrite abgebildet:

```ts
async rewrites() {
  return [{ source: "/@:username", destination: "/profil/:username" }];
}
```

Links auf Profile bauen immer `profilePath(username)` aus `@/lib/profile` (→ `/@benutzername`), nie `/profil/…`.
Nach Änderungen an einem Profil `revalidatePath("/profil/<benutzername>")` aufrufen (die reale Route).
