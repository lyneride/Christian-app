import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/content/prose-page";

export const metadata: Metadata = { title: "Hilfe" };

const FAQ = [
  {
    q: "Kostet Bleibe etwas?",
    a: "Nein. Bleibe ist werbefrei und hat keine Bezahl-Stufen. Alle Funktionen stehen allen Mitgliedern offen.",
  },
  {
    q: "Welche Bibelübersetzungen gibt es?",
    a: "Luther 1912, Elberfelder 1905, Schlachter 1951 und Luther 1545 auf Deutsch sowie BSB und KJV auf Englisch. Moderne Übersetzungen wie Luther 2017 oder NGÜ sind urheberrechtlich geschützt und können nur mit Lizenz ergänzt werden.",
  },
  {
    q: "Wie finde ich eine Bibelstelle?",
    a: "Tippe im Reader oder in der Suche eine Stelle wie „Joh 3,16“, „1. Mose 1“ oder „Psalm 23“ ein. Wörter oder „Sätze in Anführungszeichen“ durchsuchen den ganzen Text.",
  },
  {
    q: "Wer sieht meine Gebetsanliegen?",
    a: "Das bestimmst du bei jedem Anliegen: öffentlich, nur Mitglieder, nur eine Gruppe. Du kannst Anliegen auch anonym stellen; dann sehen nur Moderatoren, von wem es stammt.",
  },
  {
    q: "Was ist ein Gebetspartner?",
    a: "Zwei Mitglieder, die einander regelmäßig im Gebet begleiten und sich gegenseitig Rechenschaft geben. Du kannst jemanden aus deiner Gruppe anfragen oder dich als verfügbar markieren.",
  },
  {
    q: "Wie lösche ich mein Konto?",
    a: "In den Einstellungen unter „Konto“. Deine Beiträge werden anonymisiert, private Daten gelöscht.",
  },
  {
    q: "Ich habe einen problematischen Beitrag gesehen.",
    a: "Nutze „Melden“ unter dem Beitrag. Die Moderation prüft jede Meldung.",
  },
];

export default function HilfePage() {
  return (
    <ProsePage title="Hilfe & häufige Fragen">
      <dl className="divide-y divide-border">
        {FAQ.map((item) => (
          <div key={item.q} className="py-5">
            <dt className="font-semibold">{item.q}</dt>
            <dd className="mt-1.5 text-foreground/90">{item.a}</dd>
          </div>
        ))}
      </dl>
      <p>
        Nicht gefunden, was du suchst? Schreib an die Adresse im <Link href="/impressum">Impressum</Link>.
      </p>
    </ProsePage>
  );
}
