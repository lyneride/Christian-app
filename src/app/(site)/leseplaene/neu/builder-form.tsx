"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonClasses } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";
import { BOOK_OPTIONS, buildCustomPlan, MAX_DAYS, MAX_RANGES, type ChapterRange } from "@/lib/plans/custom";
import { categoryLabel } from "@/lib/plans/progress";
import { formatDate } from "@/lib/utils";
import { createCustomPlan } from "./actions";

interface Props {
  friends: { id: string; name: string; username: string; avatarUrl: string | null }[];
  groups: { id: string; name: string }[];
  templates: { slug: string; title: string; dayCount: number; category: string }[];
  presetGroupId: string;
  presetPlanSlug: string;
}

type Mode = "custom" | "template";

const JOHN = 43;

function chaptersOf(book: number): number {
  return BOOK_OPTIONS.find((b) => b.number === book)?.chapters ?? 1;
}

export function PlanBuilderForm({ friends, groups, templates, presetGroupId, presetPlanSlug }: Props) {
  const [state, action, pending] = useActionState(createCustomPlan, initialActionState);
  const [mode, setMode] = useState<Mode>(presetPlanSlug ? "template" : "custom");
  const [ranges, setRanges] = useState<ChapterRange[]>([{ book: JOHN, from: 1, to: chaptersOf(JOHN) }]);
  const [days, setDays] = useState<string>("21");
  const [groupId, setGroupId] = useState(presetGroupId);
  const [friendCount, setFriendCount] = useState(0);
  const v = state.values ?? {};

  const preview = useMemo(() => buildCustomPlan({ ranges, days: Number(days) })?.preview ?? null, [ranges, days]);
  const finish = useMemo(() => {
    if (!preview) return null;
    const d = new Date();
    d.setDate(d.getDate() + preview.days - 1);
    return d;
  }, [preview]);
  const together = Boolean(groupId) || friendCount > 0;

  function updateRange(i: number, patch: Partial<ChapterRange>) {
    setRanges((rs) =>
      rs.map((r, idx) => {
        if (idx !== i) return r;
        const next = { ...r, ...patch };
        if (patch.book !== undefined) {
          next.from = 1;
          next.to = chaptersOf(patch.book);
        }
        return next;
      }),
    );
  }

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="mode" value={mode} />

      <section className="rounded-card border border-border bg-surface p-5 shadow-soft">
        <h2 className="font-semibold">1. Was wollt ihr lesen?</h2>
        <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Art des Plans">
          <button type="button" role="radio" aria-checked={mode === "custom"} onClick={() => setMode("custom")} className={buttonClasses(mode === "custom" ? "primary" : "outline", "sm")}>
            Selbst zusammenstellen
          </button>
          <button type="button" role="radio" aria-checked={mode === "template"} onClick={() => setMode("template")} className={buttonClasses(mode === "template" ? "primary" : "outline", "sm")}>
            Fertigen Plan nehmen
          </button>
        </div>

        {mode === "template" ? (
          <Field label="Leseplan" htmlFor="templateSlug" className="mt-4">
            <Select id="templateSlug" name="templateSlug" defaultValue={v.templateSlug ?? presetPlanSlug} required>
              <option value="">– bitte wählen –</option>
              {templates.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.title} · {t.dayCount} Tage · {categoryLabel(t.category)}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <div className="mt-4 space-y-3">
            {ranges.map((r, i) => {
              const max = chaptersOf(r.book);
              return (
                <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] items-end gap-2">
                  <Field label="Buch" htmlFor={`book-${i}`}>
                    <Select id={`book-${i}`} name="book" value={r.book} onChange={(e) => updateRange(i, { book: Number(e.target.value) })} aria-label={`Buch ${i + 1}`}>
                      <optgroup label="Altes Testament">
                        {BOOK_OPTIONS.filter((b) => b.testament === "OT").map((b) => (
                          <option key={b.number} value={b.number}>
                            {b.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Neues Testament">
                        {BOOK_OPTIONS.filter((b) => b.testament === "NT").map((b) => (
                          <option key={b.number} value={b.number}>
                            {b.name}
                          </option>
                        ))}
                      </optgroup>
                    </Select>
                  </Field>
                  <Field label="Von Kap." htmlFor={`from-${i}`}>
                    <Input id={`from-${i}`} name="from" type="number" inputMode="numeric" min={1} max={max} value={r.from} onChange={(e) => updateRange(i, { from: Number(e.target.value) })} className="w-20" aria-label={`Von Kapitel (${i + 1})`} />
                  </Field>
                  <Field label="Bis Kap." htmlFor={`to-${i}`}>
                    <Input id={`to-${i}`} name="to" type="number" inputMode="numeric" min={1} max={max} value={r.to} onChange={(e) => updateRange(i, { to: Number(e.target.value) })} className="w-20" aria-label={`Bis Kapitel (${i + 1})`} />
                  </Field>
                  <button
                    type="button"
                    onClick={() => setRanges((rs) => rs.filter((_, idx) => idx !== i))}
                    disabled={ranges.length === 1}
                    className={buttonClasses("ghost", "icon", "text-muted-foreground disabled:opacity-30")}
                    aria-label="Abschnitt entfernen"
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                </div>
              );
            })}
            {ranges.length < MAX_RANGES ? (
              <button type="button" onClick={() => setRanges((rs) => [...rs, { book: 45, from: 1, to: chaptersOf(45) }])} className={buttonClasses("outline", "sm")}>
                <Plus aria-hidden="true" /> Weiteren Abschnitt
              </button>
            ) : null}
            <p className="text-xs text-muted-foreground">Ganzes Buch: Kapitel von 1 bis zum letzten lassen. Mehrere Bücher oder Teile einfach untereinander.</p>
          </div>
        )}
      </section>

      {mode === "custom" ? (
        <section className="rounded-card border border-border bg-surface p-5 shadow-soft">
          <h2 className="font-semibold">2. In wie vielen Tagen?</h2>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <Field label="Tage" htmlFor="days" error={state.errors?.days} required>
              <Input id="days" name="days" type="number" inputMode="numeric" min={1} max={MAX_DAYS} value={days} onChange={(e) => setDays(e.target.value)} className="w-28" required />
            </Field>
            <div className="flex flex-wrap gap-2">
              {[7, 14, 21, 30, 60, 90].map((n) => (
                <button key={n} type="button" onClick={() => setDays(String(n))} className={buttonClasses(days === String(n) ? "secondary" : "ghost", "sm")}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          {preview ? (
            <p className="mt-4 rounded-xl bg-surface-muted px-4 py-3 text-sm" aria-live="polite">
              <span className="font-medium">{preview.chapterCount} Kapitel</span> · {preview.days} Tage · {preview.pace}
              {finish ? ` · fertig am ${formatDate(finish)}` : ""}
              {preview.days < Number(days) ? " (mehr Tage als Kapitel – jeder Tag bekommt ein Kapitel)" : ""}
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Wähle oben mindestens ein Buch.</p>
          )}
          <Field label="Name des Plans (optional)" htmlFor="title" className="mt-4" hint={preview ? `Ohne Angabe: „${preview.title}“` : undefined} error={state.errors?.title}>
            <Input id="title" name="title" maxLength={80} defaultValue={v.title ?? ""} placeholder={preview?.title ?? "z. B. Johannes im Advent"} />
          </Field>
        </section>
      ) : null}

      <section className="rounded-card border border-border bg-surface p-5 shadow-soft">
        <h2 className="font-semibold">{mode === "custom" ? "3." : "2."} Mit wem?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Ohne Auswahl liest du für dich. Mit Gruppe oder Freunden seht ihr gegenseitig, wer schon gelesen hat, und teilt Gedanken zu jedem Tag.</p>

        <Field label="Gruppe" htmlFor="groupId" className="mt-4" hint="Alle aktiven Mitglieder bekommen eine Einladung.">
          <Select id="groupId" name="groupId" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            <option value="">– keine Gruppe –</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </Field>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium">Freunde</legend>
          {friends.length === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Du hast noch keine Freunde hier.{" "}
              <Link href="/freunde" className="text-primary underline-offset-4 hover:underline">
                Freunde finden
              </Link>
            </p>
          ) : (
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {friends.map((f) => (
                <li key={f.id}>
                  <label className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-surface-muted">
                    <Checkbox name="friends" value={f.id} onChange={(e) => setFriendCount((n) => n + (e.target.checked ? 1 : -1))} />
                    <Avatar name={f.name} src={f.avatarUrl} size="xs" />
                    <span className="truncate">{f.name}</span>
                    <span className="truncate text-xs text-muted-foreground">@{f.username}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        {together ? (
          <Field label="Wie soll euer gemeinsamer Plan heißen?" htmlFor="name" className="mt-4" error={state.errors?.name}>
            <Input id="name" name="name" maxLength={80} defaultValue={v.name ?? ""} placeholder={preview ? `${preview.title} – gemeinsam` : "z. B. Hauskreis liest Johannes"} />
          </Field>
        ) : null}
      </section>

      {state.message && state.ok === false ? <Alert tone="danger">{state.message}</Alert> : null}
      <Button type="submit" loading={pending} size="lg">
        {together ? "Plan erstellen und gemeinsam starten" : "Plan erstellen und starten"}
      </Button>
    </form>
  );
}
