import type { Metadata } from "next";
import { ProsePage } from "@/components/content/prose-page";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

// TODO(Kolja): Verantwortlichen und Hosting-Anbieter eintragen.
export default function DatenschutzPage() {
  return (
    <ProsePage
      title="Datenschutzerklärung"
      lead="Bleibe verzichtet auf Werbung, Tracking und Analyse-Dienste. Wir verarbeiten nur die Daten, die für den Betrieb der Gemeinschaft nötig sind."
      updated="Oktober 2026"
    >
      <h2>1. Verantwortlicher</h2>
      <p>[Vorname Nachname, Anschrift, E-Mail] – siehe Impressum.</p>

      <h2>2. Grundsätze</h2>
      <ul>
        <li>Keine Werbung, keine Werbe-Tracker, keine Social-Media-Plugins, keine externen Analyse-Dienste.</li>
        <li>Keine Weitergabe oder Verkauf personenbezogener Daten an Dritte.</li>
        <li>Datensparsamkeit: Bei der Registrierung sind nur E-Mail-Adresse, Anzeigename, Benutzername und Passwort erforderlich.</li>
        <li>Du kannst dein Konto jederzeit selbst löschen; damit werden deine personenbezogenen Daten gelöscht oder anonymisiert.</li>
      </ul>

      <h2>3. Besondere Kategorien personenbezogener Daten (Art. 9 DSGVO)</h2>
      <p>
        Bleibe ist eine Plattform für Christen. Die Nutzung kann Rückschlüsse auf deine religiöse Überzeugung zulassen; Inhalte wie
        Gebetsanliegen oder Zeugnisse können weitere sensible Angaben enthalten. Diese Daten verarbeiten wir ausschließlich auf
        Grundlage deiner ausdrücklichen Einwilligung bei der Registrierung (Art. 9 Abs. 2 lit. a DSGVO) und nur für den Betrieb
        der Plattform. Du entscheidest bei jedem Beitrag selbst, ob er öffentlich, nur für Mitglieder oder nur für eine Gruppe sichtbar
        ist. Die Einwilligung kannst du jederzeit durch Löschen deines Kontos widerrufen.
      </p>

      <h2>4. Hosting und Server-Logfiles</h2>
      <p>
        Die Seite wird bei [Hosting-Anbieter, Ort/Land] betrieben. Beim Aufruf werden technisch bedingt IP-Adresse, Zeitpunkt,
        aufgerufene Seite, Browser und Betriebssystem in Server-Logfiles verarbeitet (Art. 6 Abs. 1 lit. f DSGVO, sicherer Betrieb).
        Logfiles werden nach spätestens 14 Tagen gelöscht.
      </p>

      <h2>5. Registrierung und Konto</h2>
      <p>
        Für ein Konto speichern wir E-Mail-Adresse, Anzeigename, Benutzername und das Passwort als sicheren Hash (bcrypt). Freiwillig
        kannst du Profilbild, Kurzbeschreibung, Ort und Gemeinde angeben. Rechtsgrundlage ist die Vertragserfüllung
        (Art. 6 Abs. 1 lit. b DSGVO). Zur Anmeldung setzen wir ein technisch notwendiges Sitzungs-Cookie
        (<code>bleibe_session</code>), das keine Daten über dich enthält, sondern nur eine zufällige Kennung. Aktive Sitzungen
        kannst du in den Einstellungen einsehen und beenden.
      </p>

      <h2>6. Inhalte, die du veröffentlichst</h2>
      <p>
        Beiträge, Gebetsanliegen, Kommentare, Zeugnisse, Gruppen und Veranstaltungen werden entsprechend der von dir gewählten
        Sichtbarkeit angezeigt. Private Notizen, Tagebuch, Markierungen, Lesefortschritt und Lernverse sind nur für dich sichtbar
        und werden nicht ausgewertet. Nachrichten zwischen Mitgliedern sind nur für die Beteiligten sichtbar; Moderatoren können sie
        nur im Fall einer Meldung einsehen.
      </p>

      <h2>7. E-Mails</h2>
      <p>
        Wir senden E-Mails zur Bestätigung deiner Adresse, zum Zurücksetzen des Passworts und – wenn du es in den Einstellungen
        aktivierst – zu Benachrichtigungen. Newsletter oder Werbemails gibt es nicht.
      </p>

      <h2>8. Lokale Speicherung im Browser</h2>
      <p>
        Einstellungen wie Design (hell/dunkel), Schriftgröße und zuletzt gelesene Kapitel werden ausschließlich lokal in deinem
        Browser (localStorage) gespeichert und nicht an uns übertragen.
      </p>

      <h2>9. Speicherdauer</h2>
      <p>
        Kontodaten bleiben bis zur Löschung deines Kontos gespeichert. Sitzungen laufen nach spätestens 30 Tagen ab. Meldungen und
        Moderationsprotokolle bewahren wir bis zu 12 Monate auf, um Missbrauch nachvollziehen zu können.
      </p>

      <h2>10. Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18),
        Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO) sowie das Recht, dich bei einer Aufsichtsbehörde zu
        beschweren. In den Einstellungen kannst du deine Daten exportieren und dein Konto löschen.
      </p>

      <h2>11. Minderjährige</h2>
      <p>
        Die Registrierung ist ab 16 Jahren möglich. Jüngere Personen benötigen die Einwilligung eines Erziehungsberechtigten
        (Art. 8 DSGVO).
      </p>
    </ProsePage>
  );
}
