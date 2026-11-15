"use client";

import { useId, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Check, ChevronRight, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteMarker, moveMarker, resetMarkers, saveMarker } from "@/lib/study/marker-actions";
import {
  freeHue,
  HUE_PRESETS,
  MARKER_BG,
  markerShades,
  markerStyle,
  MAX_MARKER_NAME,
  MAX_MARKERS,
  MAX_STRENGTH,
  STRENGTH_LABELS,
  toMarker,
  type Marker,
} from "@/lib/study/markers";
import type { ActionState } from "@/lib/action-state";
import { cn } from "@/lib/utils";

interface Draft {
  /** null = new colour */
  key: string | null;
  name: string;
  hue: number;
  strength: number;
}

/** Rainbow track of the hue slider in the chosen strength. */
function hueTrack(strength: number) {
  const stops = Array.from({ length: 13 }, (_, i) => {
    const s = markerShades(i * 30, Math.max(strength, 3));
    return `${s.light} ${Math.round((i / 12) * 100)}%`;
  });
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

function Swatch({ marker, className }: { marker: Pick<Marker, "light" | "dark">; className?: string }) {
  return <span aria-hidden="true" className={cn("border-foreground/15 block shrink-0 rounded-full border-2", MARKER_BG, className)} style={markerStyle(marker)} />;
}

/** The colour row as it appears in the Bible when text is selected. */
function PalettePreview({ palette }: { palette: Marker[] }) {
  return (
    <div className="bg-surface-muted/60 rounded-2xl p-3">
      <p className="text-muted-foreground mb-2 text-xs font-bold">So siehst du es beim Markieren in der Bibel</p>
      <div className="scroll-fade-x -mx-1 flex gap-1 overflow-x-auto px-1">
        {palette.map((m) => (
          <div key={m.key} className="flex w-[4.75rem] shrink-0 flex-col items-center gap-1">
            <Swatch marker={m} className="size-11" />
            <span lang="de" className="text-muted-foreground line-clamp-2 w-full text-center text-[11px] leading-tight font-bold tracking-tight break-words hyphens-auto">
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Editor({
  draft,
  setDraft,
  count,
  isFirst,
  isLast,
  canDelete,
  pending,
  onSave,
  onCancel,
  onDelete,
  onMove,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  count: number;
  isFirst: boolean;
  isLast: boolean;
  canDelete: boolean;
  pending: boolean;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const id = useId();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const shades = markerShades(draft.hue, draft.strength);
  const preview = toMarker(draft.key ? { ...draft, key: draft.key } : { ...draft, key: "neu" });

  return (
    <div className="border-border bg-surface mt-3 space-y-5 rounded-2xl border-2 p-4">
      <div className="space-y-1.5">
        <label htmlFor={`${id}-name`} className="font-display block text-sm font-extrabold">
          Bedeutung <span className="text-muted-foreground font-sans font-normal">(freiwillig)</span>
        </label>
        <Input
          id={`${id}-name`}
          value={draft.name}
          maxLength={MAX_MARKER_NAME}
          placeholder="z. B. Weisheit"
          autoComplete="off"
          enterKeyHint="done"
          onChange={(e) => setDraft({ ...draft, name: e.currentTarget.value })}
          aria-describedby={`${id}-name-hint`}
        />
        <p id={`${id}-name-hint`} className="text-muted-foreground text-xs">
          Steht beim Markieren unter der Farbe. Leer lassen, dann steht dort nur „{preview.colorName}“.
        </p>
      </div>

      <fieldset className="space-y-2.5">
        <legend className="font-display text-sm font-extrabold">Farbe</legend>
        <div className="grid grid-cols-6 gap-2 sm:flex sm:flex-wrap">
          {HUE_PRESETS.map((h) => {
            const active = Math.abs(draft.hue - h) < 3;
            return (
              <button
                key={h}
                type="button"
                onClick={() => setDraft({ ...draft, hue: h })}
                aria-label={toMarker({ key: "x", name: "", hue: h, strength: draft.strength }).colorName}
                aria-pressed={active}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-full sm:size-11",
                  active ? "ring-primary ring-2 ring-offset-2 ring-offset-[var(--surface)]" : "",
                )}
              >
                <Swatch marker={markerShades(h, draft.strength)} className="size-full" />
              </button>
            );
          })}
        </div>
        <label htmlFor={`${id}-hue`} className="text-muted-foreground block text-xs font-bold">
          Feiner einstellen
        </label>
        <input
          id={`${id}-hue`}
          type="range"
          min={0}
          max={359}
          step={1}
          value={draft.hue}
          onChange={(e) => setDraft({ ...draft, hue: Number(e.currentTarget.value) })}
          className="marker-range"
          style={{ background: hueTrack(draft.strength) }}
          aria-valuetext={preview.colorName}
        />
      </fieldset>

      <fieldset className="space-y-2.5">
        <legend className="font-display text-sm font-extrabold">
          Stärke <span className="text-muted-foreground font-sans font-normal">· {STRENGTH_LABELS[draft.strength - 1]}</span>
        </legend>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: MAX_STRENGTH }, (_, i) => i + 1).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setDraft({ ...draft, strength: s })}
              aria-label={STRENGTH_LABELS[s - 1]}
              aria-pressed={draft.strength === s}
              className={cn(
                "h-11 rounded-xl border-2 transition active:scale-95",
                MARKER_BG,
                draft.strength === s ? "border-primary ring-primary/30 ring-2" : "border-foreground/10",
              )}
              style={markerStyle(markerShades(draft.hue, s))}
            />
          ))}
        </div>
        <div className="text-muted-foreground flex justify-between text-xs font-bold">
          <span>zart</span>
          <span>kräftig</span>
        </div>
      </fieldset>

      <div className="space-y-2">
        <p className="font-display text-sm font-extrabold">Vorschau</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <p className="scripture rounded-xl border border-black/10 bg-white p-3 text-[17px] leading-relaxed text-[#2b2340]">
            So sieht eine <mark className="rounded-sm px-0.5 text-inherit" style={{ background: shades.light }}>Markierung in deinem Text</mark> aus.
          </p>
          <p className="scripture rounded-xl border border-white/10 bg-[#231d30] p-3 text-[17px] leading-relaxed text-[#f4effa]">
            Und so im <mark className="rounded-sm px-0.5 text-inherit" style={{ background: shades.dark }}>dunklen Modus</mark>.
          </p>
        </div>
      </div>

      {draft.key ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={pending || isFirst} onClick={() => onMove(-1)}>
            <ArrowUp aria-hidden="true" /> Nach vorne
          </Button>
          <Button type="button" variant="secondary" size="sm" disabled={pending || isLast} onClick={() => onMove(1)}>
            <ArrowDown aria-hidden="true" /> Nach hinten
          </Button>
        </div>
      ) : null}

      {confirmDelete ? (
        <div role="alert" className="border-danger/40 bg-danger/5 space-y-3 rounded-xl border p-3">
          <p className="text-sm font-semibold">
            {count > 0
              ? `Farbe wirklich löschen? Deine ${count} ${count === 1 ? "Markierung" : "Markierungen"} in dieser Farbe ${count === 1 ? "wird" : "werden"} auch entfernt.`
              : "Farbe wirklich löschen?"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="danger" size="sm" loading={pending} onClick={onDelete}>
              Ja, löschen
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
              Nein
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" loading={pending} onClick={onSave}>
            <Check aria-hidden="true" /> Speichern
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Abbrechen
          </Button>
          {draft.key && canDelete ? (
            <Button type="button" variant="ghost" className="text-danger ml-auto" onClick={() => setConfirmDelete(true)}>
              <Trash2 aria-hidden="true" /> Löschen
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

/** Settings → Markerfarben: meanings, colour and strength of every marker, plus new colours. */
export function MarkerSettings({ initial, counts: initialCounts }: { initial: Marker[]; counts: Record<string, number> }) {
  const [palette, setPalette] = useState(initial);
  const [counts, setCounts] = useState(initialCounts);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [pending, start] = useTransition();

  function run(action: () => Promise<ActionState>, after?: () => void) {
    start(async () => {
      const res = await action();
      if (res.message) setMessage({ ok: Boolean(res.ok), text: res.message });
      if (res.ok && Array.isArray(res.data?.palette)) {
        setPalette(res.data.palette as Marker[]);
        after?.();
      }
    });
  }

  function edit(m: Marker) {
    setMessage(null);
    setDraft({ key: m.key, name: m.name, hue: m.hue, strength: m.strength });
  }

  function addNew() {
    setMessage(null);
    setDraft({ key: null, name: "", hue: freeHue(palette), strength: 2 });
  }

  function editorFor(index: number) {
    if (!draft) return null;
    const key = draft.key;
    return (
      <Editor
        draft={draft}
        setDraft={setDraft}
        count={key ? (counts[key] ?? 0) : 0}
        isFirst={index === 0}
        isLast={index === palette.length - 1}
        canDelete={palette.length > 1}
        pending={pending}
        onCancel={() => setDraft(null)}
        onSave={() => run(() => saveMarker(draft), () => setDraft(null))}
        onDelete={() =>
          key &&
          run(
            () => deleteMarker(key),
            () => {
              setDraft(null);
              setCounts((c) => ({ ...c, [key]: 0 }));
            },
          )
        }
        onMove={(dir) => key && run(() => moveMarker(key, dir))}
      />
    );
  }

  return (
    <div className="space-y-5">
      <PalettePreview palette={palette} />

      <ul className="divide-border divide-y">
        {palette.map((m, i) => {
          const open = draft?.key === m.key;
          const count = counts[m.key] ?? 0;
          return (
            <li key={m.key} className="py-3 first:pt-0">
              <button
                type="button"
                onClick={() => (open ? setDraft(null) : edit(m))}
                aria-expanded={open}
                className="hover:bg-surface-muted -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition"
              >
                <Swatch marker={m} className="size-11" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{m.label}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {m.name ? `${m.colorName} · ` : ""}
                    {STRENGTH_LABELS[m.strength - 1]}
                    {count ? ` · ${count} ${count === 1 ? "Markierung" : "Markierungen"}` : ""}
                  </span>
                </span>
                <span className="text-primary inline-flex shrink-0 items-center gap-0.5 text-sm font-extrabold">
                  {open ? "Schließen" : "Bearbeiten"}
                  <ChevronRight className={cn("size-4 transition", open && "rotate-90")} aria-hidden="true" />
                </span>
              </button>
              {open ? editorFor(i) : null}
            </li>
          );
        })}
      </ul>

      {draft && draft.key === null ? (
        <div>
          <p className="font-display font-extrabold">Neue Farbe</p>
          {editorFor(palette.length)}
        </div>
      ) : (
        <div className="space-y-1.5">
          <Button type="button" variant="outline" disabled={palette.length >= MAX_MARKERS || pending} onClick={addNew}>
            <Plus aria-hidden="true" /> Neue Farbe hinzufügen
          </Button>
          {palette.length >= MAX_MARKERS ? (
            <p className="text-muted-foreground text-xs">Du hast schon {MAX_MARKERS} Farben – mehr geht nicht.</p>
          ) : null}
        </div>
      )}

      {message ? (
        <p role="status" className={cn("text-sm font-semibold", message.ok ? "text-success" : "text-danger")}>
          {message.text}
        </p>
      ) : null}

      <div className="border-border border-t pt-4">
        {confirmReset ? (
          <div className="space-y-2">
            <p className="text-sm">
              Die Standardfarben bekommen wieder ihre ursprüngliche Bedeutung und Farbe. Deine eigenen Farben und alle Markierungen bleiben.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={pending}
                onClick={() =>
                  run(resetMarkers, () => {
                    setConfirmReset(false);
                    setDraft(null);
                  })
                }
              >
                Ja, wiederherstellen
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
                Abbrechen
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmReset(true)}>
            <RotateCcw aria-hidden="true" /> Standardfarben wiederherstellen
          </Button>
        )}
      </div>
    </div>
  );
}
