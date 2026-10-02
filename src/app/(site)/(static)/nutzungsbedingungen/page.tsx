import type { Metadata } from "next";
import { ProsePage } from "@/components/content/prose-page";

export const metadata: Metadata = { title: "Nutzungsbedingungen" };

export default function NutzungsbedingungenPage() {
  return (
    <ProsePage title="Nutzungsbedingungen" lead="Kurz und ehrlich: Was wir voneinander erwarten." updated="Oktober 2026">
      <h2>1. Was Bleibe ist</h2>
      <p>
        Bleibe ist eine Gemeinschaft von Christen verschiedener Konfessionen rund um die Bibel, das Gebet und das gemeinsame
        Unterwegssein mit Gott. Bleibe ist keine Kirche, kein Ersatz für eine Gemeinde vor Ort und keine Seelsorge-Hotline.
      </p>

      <h2>2. Konto</h2>
      <ul>
        <li>Du brauchst ein Konto, um Beiträge zu schreiben, zu beten, Gruppen beizutreten oder Nachrichten zu senden. Lesen geht auch ohne.</li>
        <li>Ein Konto pro Person. Du bist für die Sicherheit deines Passworts verantwortlich.</li>
        <li>Mindestalter: 16 Jahre, darunter mit Einwilligung der Eltern.</li>
      </ul>

      <h2>3. Umgang miteinander</h2>
      <p>Wir bitten dich um einen Umgang, der der Bergpredigt entspricht – und verlangen mindestens Folgendes:</p>
      <ul>
        <li>Keine Beleidigungen, Drohungen, Hetze, Herabwürdigung von Menschen oder Gruppen, keine Diskriminierung.</li>
        <li>Kein Spam, keine Werbung, keine kommerziellen Angebote, keine Spendensammlungen ohne Absprache mit der Moderation.</li>
        <li>Keine politische Agitation und keine Parteiwerbung. Bleibe ist überparteilich.</li>
        <li>Keine Verbreitung von Inhalten, an denen du keine Rechte hast (Liedtexte, Buchauszüge, Fotos anderer Personen).</li>
        <li>Gebetsanliegen anderer bleiben vertraulich. Was du in Gruppen oder Nachrichten liest, trägst du nicht weiter.</li>
        <li>Respektiere, dass hier Christen unterschiedlicher Prägung unterwegs sind. Lehrfragen dürfen diskutiert werden – mit Demut.</li>
      </ul>

      <h2>4. Seelsorge und Krisen</h2>
      <p>
        Mitglieder sind keine Therapeuten. Bei akuter Gefahr wende dich bitte an den Notruf 112 oder die Telefonseelsorge
        (0800 111 0 111 / 0800 111 0 222, kostenfrei, rund um die Uhr). Moderatoren können solche Hinweise in Beiträgen ergänzen.
      </p>

      <h2>5. Deine Inhalte</h2>
      <p>
        Deine Inhalte bleiben deine. Du räumst uns das einfache Recht ein, sie im Rahmen der gewählten Sichtbarkeit auf Bleibe
        anzuzeigen. Beim Löschen eines Beitrags wird er für andere unsichtbar; Zitate in Kommentaren anderer bleiben bestehen.
      </p>

      <h2>6. Moderation</h2>
      <p>
        Verstöße können zur Entfernung von Inhalten, zur vorübergehenden Sperre oder zur Löschung des Kontos führen. Du kannst
        Entscheidungen der Moderation per E-Mail anfechten. Wir erklären, warum etwas entfernt wurde.
      </p>

      <h2>7. Verfügbarkeit und Haftung</h2>
      <p>
        Bleibe ist ein nicht-kommerzielles Projekt. Wir bemühen uns um einen zuverlässigen Betrieb, können aber keine
        unterbrechungsfreie Verfügbarkeit garantieren. Für Inhalte von Mitgliedern haften wir nur nach den gesetzlichen Regeln.
      </p>

      <h2>8. Änderungen</h2>
      <p>Wesentliche Änderungen dieser Bedingungen kündigen wir mindestens 14 Tage vorher per E-Mail oder Hinweis auf der Seite an.</p>
    </ProsePage>
  );
}
