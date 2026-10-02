"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Eye, RotateCcw, X } from "lucide-react";
import { reviewMemoryVerse } from "@/lib/study/actions";
import {
  MASK_LEVEL_LABELS,
  boxLabel,
  compareTyped,
  maskVerse,
  nextReviewLabel,
  practicedLabel,
  similarityFeedback,
  type MaskLevel,
} from "@/lib/study/leitner";
import type { ReviewResult } from "@/lib/validation/study";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PracticeVerse {
  id: string;
  reference: string;
  text: string;
  box: number;
  translationName: string;
}

interface Outcome {
  id: string;
  reference: string;
  result: ReviewResult;
  box: number;
  nextReviewAt: string | null;
}

const START_LEVEL: MaskLevel = 3;

/**
 * Cycles through the verses: reveal step by step, optionally type the verse
 * for feedback, then "Gewusst" / "Noch nicht". The list is copied into state
 * so a refresh after each review does not disturb the session.
 */
export function MemoryPractice({ verses }: { verses: PracticeVerse[] }) {
  const [queue] = useState(() => verses);
  const [index, setIndex] = useState(0);
  const [level, setLevel] = useState<MaskLevel>(START_LEVEL);
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const current = queue[index];
  const done = !current;

  function reveal() {
    setLevel((l) => (l > 0 ? ((l - 1) as MaskLevel) : l));
  }

  function check() {
    if (!current) return;
    setScore(compareTyped(current.text, typed));
    setLevel(0);
  }

  function advance(outcome: Outcome) {
    setOutcomes((list) => [...list, outcome]);
    setIndex((i) => i + 1);
    setLevel(START_LEVEL);
    setTyped("");
    setScore(null);
    setError(null);
  }

  function review(result: ReviewResult) {
    if (!current) return;
    const verse = current;
    startTransition(async () => {
      const res = await reviewMemoryVerse(verse.id, result);
      if (!res.ok) {
        setError(res.message ?? "Das hat leider nicht geklappt.");
        return;
      }
      const data = res.data ?? {};
      advance({
        id: verse.id,
        reference: verse.reference,
        result,
        box: typeof data.box === "number" ? data.box : verse.box,
        nextReviewAt: typeof data.nextReviewAt === "string" ? data.nextReviewAt : null,
      });
    });
  }

  if (queue.length === 0) {
    return (
      <Card>
        <CardContent className="space-y-3 text-center">
          <p className="text-lg font-medium">Heute ist nichts dran.</p>
          <p className="text-muted-foreground text-sm">Deine Verse warten, bis sie wieder fällig sind. Gönn dir die Pause.</p>
          <Link href="/merken" className={buttonClasses("outline", "md", "mt-2")}>
            Zurück zur Übersicht
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (done) {
    const known = outcomes.filter((o) => o.result === "known").length;
    return (
      <Card>
        <CardContent className="space-y-5">
          <div className="text-center">
            <p className="text-2xl font-semibold tracking-tight">{practicedLabel(outcomes.length)}</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {known === outcomes.length
                ? "Alles gewusst. Schön, wie das sitzt."
                : known === 0
                  ? "Noch nicht ganz – das ist völlig in Ordnung. Morgen gibt es die nächste Gelegenheit."
                  : `${known} davon gewusst. Der Rest kommt morgen noch einmal dran.`}
            </p>
          </div>
          <ul className="divide-border divide-y text-sm">
            {outcomes.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-2">
                <span className="flex items-center gap-2">
                  {o.result === "known" ? (
                    <Check className="text-success size-4" aria-hidden="true" />
                  ) : (
                    <RotateCcw className="text-muted-foreground size-4" aria-hidden="true" />
                  )}
                  <span className="font-medium">{o.reference}</span>
                </span>
                <span className="text-muted-foreground">
                  {boxLabel(o.box)}
                  {o.nextReviewAt ? ` · ${nextReviewLabel(new Date(o.nextReviewAt))}` : ""}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-center">
            <Link href="/merken" className={buttonClasses("primary", "md")}>
              Zurück zur Übersicht
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const masked = maskVerse(current.text, level);

  return (
    <div className="space-y-5">
      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>
          Vers {index + 1} von {queue.length}
        </span>
        <Badge variant="primary">{boxLabel(current.box)}</Badge>
      </div>

      <Card>
        <CardContent className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{current.reference}</h2>
            <p className="text-muted-foreground text-xs">{current.translationName}</p>
          </div>

          <p
            className={cn("scripture text-foreground/90 wrap-break-word whitespace-pre-wrap", level > 0 && "tracking-wide")}
            aria-live="polite"
            aria-label={level > 0 ? `Verdeckter Vers, Stufe: ${MASK_LEVEL_LABELS[level]}` : undefined}
          >
            {masked}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={reveal} disabled={level === 0}>
              <Eye aria-hidden="true" />
              {level === 0 ? "Ganzer Vers" : "Mehr zeigen"}
            </Button>
            <span className="text-muted-foreground text-xs">{MASK_LEVEL_LABELS[level]}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <Field label="Vers aus dem Gedächtnis tippen" htmlFor="typed" hint="Optional. Groß-/Kleinschreibung und Satzzeichen spielen keine Rolle.">
            <Textarea
              id="typed"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              rows={3}
              className="min-h-20"
              autoComplete="off"
              spellCheck={false}
              aria-describedby="typed-hint"
            />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={check} disabled={!typed.trim()}>
              Prüfen
            </Button>
            {score !== null ? (
              <p className="text-sm" role="status">
                <span className="font-medium">{Math.round(score * 100)} %</span> · {similarityFeedback(score)}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {error ? (
        <p role="alert" className="text-danger text-sm font-medium">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button type="button" variant="outline" size="lg" onClick={() => review("unknown")} disabled={pending}>
          <X aria-hidden="true" />
          Noch nicht
        </Button>
        <Button type="button" size="lg" onClick={() => review("known")} loading={pending}>
          <Check aria-hidden="true" />
          Gewusst
        </Button>
      </div>
    </div>
  );
}
