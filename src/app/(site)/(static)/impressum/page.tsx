import type { Metadata } from "next";
import { ProsePage } from "@/components/content/prose-page";

export const metadata: Metadata = { title: "Impressum" };

export default function ImpressumPage() {
  return (
    <ProsePage title="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        Kolja Hylla
        <br />
        Eibenweg 14
        <br />
        57078 Siegen
        <br />
        Deutschland
      </p>
      <h2>Kontakt</h2>
      <p>
        E-Mail: lyneride@gmail.com
      </p>
      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>Kolja Hylla, Eibenweg 14, 57078 Siegen</p>
      <h2>Haftung für Inhalte von Mitgliedern</h2>
      <p>
        Beiträge, Gebetsanliegen, Kommentare und Gruppeninhalte werden von Mitgliedern erstellt. Wir prüfen Inhalte nicht
        vorab, gehen Hinweisen auf Rechtsverstöße aber unverzüglich nach. Über die Funktion „Melden“ kannst du uns auf
        problematische Inhalte aufmerksam machen.
      </p>
      <h2>Bibeltexte</h2>
      <p>
        Lutherbibel 1912, Elberfelder 1905 und Lutherbibel 1545 sind gemeinfrei. Die Schlachter-Bibel 1951 ist urheberrechtlich
        geschützt (© Genfer Bibelgesellschaft) und wird mit Erlaubnis zur nicht-kommerziellen Verbreitung genutzt. Berean Standard
        Bible und King James Version sind gemeinfrei. Querverweise: OpenBible.info, CC-BY 4.0.
      </p>
    </ProsePage>
  );
}
