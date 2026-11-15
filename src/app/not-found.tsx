import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Rebi, RebiBubble } from "@/components/rebi/rebi";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex items-end gap-1">
        <Rebi pose="think" size={130} priority />
        <RebiBubble tail="left" className="mb-14">
          Hm, hier ist nichts …
        </RebiBubble>
      </div>
      <p className="mt-4 text-sm font-extrabold text-muted-foreground">Fehler 404</p>
      <h1 className="mt-1 text-[30px] leading-tight font-black">Diese Seite gibt es nicht.</h1>
      <p className="mt-3 max-w-md text-muted-foreground">Vielleicht wurde sie verschoben oder der Link ist nicht mehr gültig.</p>
      <div className="mt-8 grid w-full max-w-sm gap-3 sm:flex sm:w-auto sm:max-w-none">
        <Link href="/" className={buttonClasses("primary", "lg")}>
          Zur Startseite
        </Link>
        <Link href="/bibel" className={buttonClasses("outline", "lg")}>
          Bibel öffnen
        </Link>
      </div>
    </main>
  );
}
