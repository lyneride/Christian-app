# Bibeldaten

Die App bündelt gemeinfreie (bzw. frei verbreitbare) Bibelübersetzungen als statische JSON-Dateien unter `data/`.
Es gibt keine externe Bibel-API zur Laufzeit: alles läuft offline-fähig und datensparsam vom eigenen Server.

## Enthaltene Übersetzungen

| ID        | Name                                | Sprache | Lizenz                                              |
| --------- | ----------------------------------- | ------- | --------------------------------------------------- |
| `LUT1912` | Lutherbibel 1912                    | de      | Public Domain                                       |
| `ELB1905` | Elberfelder 1905 (unrevidiert)      | de      | Public Domain                                       |
| `SCH1951` | Schlachter 1951                     | de      | © Genfer Bibelgesellschaft, frei für nicht-kommerzielle Verbreitung |
| `LUT1545` | Lutherbibel 1545 (Letzte Hand)      | de      | Public Domain                                       |
| `BSB`     | Berean Standard Bible               | en      | Public Domain (CC0)                                 |
| `KJV`     | King James Version                  | en      | Public Domain                                       |

Moderne deutsche Übersetzungen (Luther 2017, Elberfelder 2006, Schlachter 2000, NGÜ, Hoffnung für alle, BasisBibel,
Einheitsübersetzung, NeÜ) sind urheberrechtlich geschützt und dürfen **nicht** ohne Lizenzvertrag eingebunden werden.
Die Datenstruktur ist so gebaut, dass eine lizenzierte Übersetzung später als weiterer Ordner ergänzt werden kann.

Querverweise stammen von [OpenBible.info](https://www.openbible.info/labs/cross-references/) (CC-BY 4.0).

## Dateiformat

```
data/bibles/translations.json          # Liste aller Übersetzungen (Metadaten, Kapitelzahlen)
data/bibles/<ID>/index.json            # Metadaten + Verszahlen je Kapitel
data/bibles/<ID>/<Buchnummer>.json     # { "b": 43, "c": [ ["Vers 1", "Vers 2", ...], ... ] }
data/crossrefs/<Buchnummer>.json       # { "3:16": [["45:5:8", 871], ["62:4:9-10", 618], ...] }
```

Buchnummern sind kanonisch (1 = 1. Mose … 66 = Offenbarung), siehe `src/lib/bible/books.ts`.
Versschlüssel in der Datenbank haben die Form `"<Buch>:<Kapitel>:<Vers>"` (übersetzungsunabhängig).

## Rohdaten neu erzeugen

Die Rohdateien (≈ 40 MB) werden nicht eingecheckt. Zum Neuerzeugen:

```bash
mkdir -p raw && cd raw
# Beblia XML (Luther 1912, Elberfelder 1905, Luther 1545, KJV) – Sparse-Checkout, um nicht das ganze Repo zu laden
git clone --depth 1 --filter=blob:none --no-checkout https://github.com/Beblia/Holy-Bible-XML-Format.git beblia
( cd beblia && git checkout HEAD -- GermanLuther1912Bible.xml GermanElber1905Bible.xml German1545Bible.xml EnglishKJBible.xml )
cp beblia/*.xml .
# scrollmapper (Schlachter 1951, BSB, Querverweise)
git clone --depth 1 --filter=blob:none --no-checkout https://github.com/scrollmapper/bible_databases.git scrollmapper
( cd scrollmapper && git checkout HEAD -- formats/json/GerSch.json formats/json/BSB.json sources/extras/cross_references.txt )
cp scrollmapper/formats/json/GerSch.json scrollmapper/formats/json/BSB.json scrollmapper/sources/extras/cross_references.txt .
cd ..
npx tsx scripts/bible/convert.ts --src raw --out data
```

## Versifikation

Die Übersetzungen folgen leicht unterschiedlichen Kapitel-/Verseinteilungen (z. B. Joel 3 vs. 4 Kapitel).
Kapitelzahlen und Verszahlen werden deshalb pro Übersetzung aus `index.json` gelesen, nicht aus `books.ts`.
