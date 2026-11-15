import type { AreaKey } from "@/components/layout/areas";
import type { RebiPose } from "@/components/rebi/rebi";
import type { TourKind } from "./tour-events";

/**
 * Tour scripts. A step with `target` spotlights the element carrying `data-tour="<target>"`
 * (the first visible one; several targets can be given for phone/computer). Without a target,
 * or when the element is not on the page, Rebi speaks from the middle of the screen.
 */
export interface TourStep {
  target?: string | string[];
  pose: RebiPose;
  title: string;
  text: string;
  /** Marks a feature that is new in Bleibe. */
  isNew?: boolean;
}

export interface Tour {
  kind: TourKind;
  label: string;
  area?: AreaKey;
  steps: TourStep[];
}

const tab = (key: AreaKey) => [`tab-${key}`, `side-${key}`];

export const WELCOME_TOUR: Tour = {
  kind: "welcome",
  label: "Willkommen",
  steps: [
    { pose: "wave", title: "Hi, ich bin Rebi!", text: "Ich zeig dir in einer Minute, wie Bleibe funktioniert." },
    { target: tab("heute"), pose: "point", title: "Heute", text: "Hier siehst du alles für deinen Tag – Tagesvers, Leseplan, neue Anliegen und Treffen." },
    { target: tab("bibel"), pose: "read", title: "Bibel", text: "Lesen, markieren, Notizen machen. Lesepläne und Merkverse findest du auch hier." },
    { target: tab("gebet"), pose: "heart", title: "Gebet", text: "Teile, was dich bewegt – und bete für andere mit." },
    { target: tab("gemeinschaft"), pose: "point", title: "Gemeinschaft", text: "Beiträge, Gruppen mit eigenem Chat und Treffen in deiner Nähe." },
    { target: tab("ich"), pose: "point", title: "Ich", text: "Dein Profil, Freunde, Nachrichten, Tagebuch und Einstellungen." },
    { target: "help", pose: "point", title: "Das Fragezeichen", text: "Hier kann ich dir alles jederzeit nochmal zeigen." },
    { pose: "celebrate", title: "Geschafft!", text: "In jedem Bereich zeig ich dir beim ersten Öffnen noch alles genauer." },
  ],
};

export const AREA_TOURS: Record<AreaKey, Tour> = {
  heute: {
    kind: "heute",
    area: "heute",
    label: "Heute",
    steps: [
      { pose: "wave", title: "Willkommen bei Heute!", text: "Das ist deine Startseite. Ich zeig dir kurz, was hier alles drin steckt." },
      { target: "home-verse", pose: "read", title: "Tagesvers", text: "Jeden Tag ein Vers. Tippen öffnet ihn in der Bibel – dort kannst du ihn markieren oder merken." },
      { target: "home-plan", pose: "point", title: "Dein Leseplan", text: "„Lesen“ öffnet genau den Abschnitt von heute. Danach Haken setzen – fertig." },
      { target: "home-prayers", pose: "heart", title: "Neue Anliegen", text: "Hier siehst du, wofür andere gerade Gebet brauchen. Antippen und mitbeten." },
      { target: "home-events", pose: "point", title: "Treffen", text: "Deine nächsten Treffen. Zusagen geht mit einem Tipp – auf Wunsch auch in deinen Kalender." },
      { target: "bell", pose: "point", title: "Die Glocke", text: "Hier landet alles Neue: Antworten, Mitbeter, Einladungen und Anfragen." },
      { pose: "celebrate", title: "Fertig!", text: "Über das Fragezeichen oben kann ich dir das jederzeit nochmal zeigen." },
    ],
  },
  bibel: {
    kind: "bibel",
    area: "bibel",
    label: "Bibel",
    steps: [
      { pose: "read", title: "Willkommen in der Bibel!", text: "Hier liest du in Ruhe – ohne Werbung. Ich zeig dir die wichtigsten Kniffe." },
      { target: "bible-search", pose: "point", title: "Suchen", text: "Gib ein Wort oder eine Stelle ein, z. B. „Psalm 23“ – und du bist sofort dort." },
      { target: "bible-books", pose: "point", title: "Buch und Kapitel", text: "Tippe auf ein Buch und dann auf ein Kapitel. Mit den Pfeilen blätterst du weiter." },
      { target: "bible-translation", pose: "point", title: "Übersetzungen", text: "Wechsle zwischen 6 Übersetzungen – oder vergleiche zwei nebeneinander." },
      { pose: "read", title: "Vers antippen", text: "Im Kapitel tippst du einen Vers an: markieren in 5 Farben, Notiz schreiben, merken oder an Freunde schicken." },
      { target: "tabs-bibel", pose: "point", title: "Pläne", text: "Unter „Pläne“ startest du einen Leseplan – allein oder gemeinsam mit Freunden und deiner Gruppe." },
      { target: "tabs-bibel", pose: "point", title: "Merkverse und Notizen", text: "Hier übst du deine Merkverse und findest alles, was du markiert und notiert hast." },
      { pose: "celebrate", title: "Viel Freude beim Lesen!", text: "Über das Fragezeichen oben zeig ich dir das jederzeit nochmal." },
    ],
  },
  gebet: {
    kind: "gebet",
    area: "gebet",
    label: "Gebet",
    steps: [
      { pose: "heart", title: "Willkommen bei Gebet!", text: "Hier betet ihr füreinander. So funktioniert es:" },
      { target: "prayer-new", pose: "point", title: "Anliegen teilen", text: "Schreib, was dich bewegt, und wähl eine Kategorie. Du bestimmst, wer es sieht: alle, deine Freunde oder deine Gruppe – auf Wunsch anonym." },
      { target: "prayer-filter", pose: "point", title: "Filter", text: "Offene Anliegen, erhörte Gebete oder nur deine eigenen – hier wechselst du." },
      { target: "prayer-pray", pose: "heart", title: "Ich bete mit", text: "Ein Tipp, und die Person weiß: Jemand betet mit. Du kannst auch eine kurze Ermutigung schreiben." },
      { pose: "celebrate", title: "Erhört", text: "Wenn sich bei deinem Anliegen etwas getan hat, markier es als erhört – alle Mitbeter bekommen Bescheid." },
      { pose: "wave", title: "Fertig!", text: "Über das Fragezeichen oben kann ich dir das jederzeit nochmal zeigen." },
    ],
  },
  gemeinschaft: {
    kind: "gemeinschaft",
    area: "gemeinschaft",
    label: "Gemeinschaft",
    steps: [
      { pose: "wave", title: "Willkommen in Gemeinschaft!", text: "Ich zeig dir hier alles ganz genau – in ein paar kurzen Schritten." },
      { target: "post-compose", pose: "point", title: "Beitrag schreiben", text: "Teile einen Gedanken, stell eine Frage oder erzähl ein Zeugnis. Du wählst, wer es sehen darf." },
      { target: "tabs-gemeinschaft", pose: "point", title: "Reiter oben", text: "Hier wechselst du zwischen Beiträgen, Gruppen, Treffen und Zeugnissen." },
      { target: "tabs-gemeinschaft", pose: "point", title: "Gruppen", text: "Unter „Gruppen“ findest du Gruppen online oder in deiner Stadt – oder gründest deine eigene." },
      { pose: "point", title: "Gruppenchat", text: "Jede Gruppe hat ihren eigenen Chat. In der Gruppe auf „Gruppenchat“ tippen und mit allen schreiben.", isNew: true },
      { target: "tabs-gemeinschaft", pose: "point", title: "Treffen", text: "Treffen planen oder zusagen – mit Ort, Uhrzeit und freien Plätzen." },
      { pose: "celebrate", title: "Super!", text: "Über das Fragezeichen oben kann ich dir das jederzeit nochmal zeigen." },
    ],
  },
  ich: {
    kind: "ich",
    area: "ich",
    label: "Ich",
    steps: [
      { pose: "wave", title: "Das ist dein Bereich!", text: "Alles Persönliche an einem Ort. Ich zeig dir, was wo ist." },
      { target: "ich-profil", pose: "point", title: "Profil", text: "Bild, Name und ein paar Worte über dich – du bestimmst, wer was sieht." },
      { target: "ich-freunde", pose: "heart", title: "Freunde", text: "Nach Namen suchen oder deinen Einladungslink bzw. QR-Code teilen – wer ihn öffnet, ist sofort dein Freund." },
      { target: "ich-nachrichten", pose: "point", title: "Nachrichten", text: "Schreib mit einer Person oder starte einen Gruppenchat mit mehreren Freunden.", isNew: true },
      { target: "ich-tagebuch", pose: "read", title: "Tagebuch", text: "Dein privater Ort zum Nachdenken und Danken – nur du siehst ihn." },
      { target: "ich-benachrichtigungen", pose: "point", title: "Benachrichtigungen", text: "Alles Neue für dich. In den Einstellungen legst du fest, worüber du Bescheid bekommst." },
      { target: "ich-einstellungen", pose: "point", title: "Einstellungen", text: "Profil, Konto, Sitzungen – und deine Daten herunterladen oder das Konto löschen." },
      { pose: "celebrate", title: "Fertig!", text: "Viel Freude mit Bleibe!" },
    ],
  },
};

export function tourFor(kind: TourKind): Tour {
  return kind === "welcome" ? WELCOME_TOUR : AREA_TOURS[kind];
}
