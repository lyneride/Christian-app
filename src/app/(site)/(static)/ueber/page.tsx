import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/content/prose-page";

export const metadata: Metadata = {
  title: "Warum Bleibe?",
  description: "Warum es Bleibe gibt: eine werbefreie, datensparsame Gemeinschaft für Christen rund um Bibel, Gebet und echte Verbindung.",
};

export default function UeberPage() {
  return (
    <ProsePage title="Warum Bleibe?" lead="Es gibt viele christliche Apps. Die meisten wollen deine Aufmerksamkeit. Bleibe will, dass du bei Gott bleibst – und bei Menschen.">
      <h2>Der Name</h2>
      <p>
        „Bleibt in mir und ich in euch“ (Johannes 15,4). Jesus beschreibt Glauben nicht als Leistung, sondern als Bleiben:
        verbunden sein wie eine Rebe mit dem Weinstock. Bleibe ist auch ein Ort, an dem man wohnt – eine Bleibe. Beides meinen wir.
      </p>

      <h2>Was fehlt</h2>
      <p>
        Bibel-Apps gibt es viele, Gebets-Apps auch. Aber fast alle sind entweder Konsum-Angebote (du liest, hörst, scrollst – allein)
        oder sie finanzieren sich über Abos, Werbung und Datenhandel. Gemeinschaft kommt, wenn überhaupt, als Kommentarspalte vor.
        Und deutschsprachige Angebote hinken oft Jahre hinterher.
      </p>
      <p>Bleibe setzt genau dort an:</p>
      <ul>
        <li>
          <strong>Bibel und Gemeinschaft gehören zusammen.</strong> Lesen, verstehen, austauschen, füreinander beten – in einem Ort,
          nicht in fünf Apps und drei WhatsApp-Gruppen.
        </li>
        <li>
          <strong>Online führt zu offline.</strong> Gruppen vor Ort, Treffen in deiner Stadt, Gebetspartner. Der Bildschirm ist
          Mittel, nicht Ziel.
        </li>
        <li>
          <strong>Werbefrei, ohne Abo, ohne Tracking.</strong> Religiöse Daten sind besonders schützenswert. Wir sammeln nicht, was
          wir nicht brauchen, und verkaufen nichts.
        </li>
        <li>
          <strong>Gnade statt Gamification.</strong> Keine Streaks, keine Mahnungen, keine Ranglisten. Wer drei Tage nicht gelesen hat,
          macht einfach weiter.
        </li>
        <li>
          <strong>Deutsch zuerst.</strong> Gemeinfreie deutsche Übersetzungen, deutsche Oberfläche, deutsche Gemeinschaft – offen für
          alle Konfessionen.
        </li>
      </ul>

      <h2>Was Bleibe nicht ist</h2>
      <p>
        Keine Kirche, keine Gemeinde-Software, keine Seelsorge-Hotline, kein soziales Netzwerk mit Reichweiten-Logik. Bleibe ersetzt
        nicht deine Gemeinde vor Ort – es soll dich dorthin bringen und dich zwischen den Sonntagen tragen.
      </p>

      <h2>Wer dahintersteht</h2>
      <p>
        Bleibe ist ein nicht-kommerzielles Projekt aus Siegen, entstanden aus der Arbeit mit Kindern und Jugendlichen in christlichen
        Freizeiten. Der Quellcode ist offen. Wenn du mithelfen willst – technisch, inhaltlich, moderierend – melde dich über das{" "}
        <Link href="/impressum">Impressum</Link>.
      </p>

      <h2>Bibeltexte</h2>
      <p>
        Wir nutzen gemeinfreie Übersetzungen (Luther 1912, Elberfelder 1905, Luther 1545, BSB, KJV) und die Schlachter-Bibel 1951 mit
        Erlaubnis zur nicht-kommerziellen Verbreitung. Moderne Übersetzungen wie Luther 2017, NGÜ oder BasisBibel sind
        urheberrechtlich geschützt; wir arbeiten daran, Lizenzen zu bekommen.
      </p>
    </ProsePage>
  );
}
