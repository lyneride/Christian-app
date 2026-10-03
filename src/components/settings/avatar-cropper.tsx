"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const VIEW = 288; // viewport size in CSS px
const OUTPUT = 512; // exported square size
const MAX_SOURCE = 2048; // pre-downscale huge photos before cropping

interface Props {
  file: File;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}

interface Source {
  url: string;
  width: number;
  height: number;
  element: HTMLImageElement | HTMLCanvasElement;
}

/** Loads a file into an image, downscaling very large photos first (memory, speed). */
async function loadSource(file: File): Promise<Source> {
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("decode"));
    el.src = url;
  });
  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  if (longest <= MAX_SOURCE) return { url, width: img.naturalWidth, height: img.naturalHeight, element: img };
  const f = MAX_SOURCE / longest;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * f);
  canvas.height = Math.round(img.naturalHeight * f);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);
  return { url: canvas.toDataURL("image/jpeg", 0.92), width: canvas.width, height: canvas.height, element: canvas };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

/**
 * Square cropper with zoom (slider, mouse wheel, pinch) and drag. Exports a
 * 512×512 JPEG, so even a 20 MB photo becomes a ~100 KB upload.
 */
export function AvatarCropper({ file, onCancel, onConfirm }: Props) {
  const [source, setSource] = useState<Source | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1); // 1 = cover, up to 4
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ x: number; y: number; dist: number; zoom: number; offset: { x: number; y: number } } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSource(file)
      .then((s) => {
        if (!cancelled) setSource(s);
      })
      .catch(() => {
        if (!cancelled) setError("Dieses Bild kann der Browser nicht öffnen. Bitte ein JPG, PNG oder WebP wählen.");
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  const base = source ? VIEW / Math.min(source.width, source.height) : 1;
  const scale = base * zoom;
  const drawn = source ? { w: source.width * scale, h: source.height * scale } : { w: VIEW, h: VIEW };
  const limits = useMemo(() => ({ x: Math.max(0, (drawn.w - VIEW) / 2), y: Math.max(0, (drawn.h - VIEW) / 2) }), [drawn.w, drawn.h]);

  function setZoomClamped(next: number, keepOffset = offset) {
    const z = clamp(next, 1, 4);
    setZoom(z);
    if (!source) return;
    const s = base * z;
    const lim = { x: Math.max(0, (source.width * s - VIEW) / 2), y: Math.max(0, (source.height * s - VIEW) / 2) };
    setOffset({ x: clamp(keepOffset.x, -lim.x, lim.x), y: clamp(keepOffset.y, -lim.y, lim.y) });
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const dist = pts.length >= 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
    gesture.current = { x: e.clientX, y: e.clientY, dist, zoom, offset };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length >= 2 && gesture.current.dist > 0) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      setZoomClamped(gesture.current.zoom * (dist / gesture.current.dist), gesture.current.offset);
      return;
    }
    const dx = e.clientX - gesture.current.x;
    const dy = e.clientY - gesture.current.y;
    setOffset({ x: clamp(gesture.current.offset.x + dx, -limits.x, limits.x), y: clamp(gesture.current.offset.y + dy, -limits.y, limits.y) });
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId);
    gesture.current = pointers.current.size > 0 ? { ...gesture.current!, dist: 0, offset, x: e.clientX, y: e.clientY } : null;
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    setZoomClamped(zoom * (e.deltaY < 0 ? 1.08 : 0.92));
  }

  async function confirm() {
    if (!source) return;
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT;
      canvas.height = OUTPUT;
      const ctx = canvas.getContext("2d")!;
      const left = VIEW / 2 - drawn.w / 2 + offset.x;
      const top = VIEW / 2 - drawn.h / 2 + offset.y;
      const sx = -left / scale;
      const sy = -top / scale;
      const sw = VIEW / scale;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(source.element, sx, sy, sw, sw, 0, 0, OUTPUT, OUTPUT);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      if (!blob) throw new Error("encode");
      onConfirm(blob);
    } catch {
      setError("Das Bild konnte nicht zugeschnitten werden.");
      setBusy(false);
    }
  }

  const left = VIEW / 2 - drawn.w / 2 + offset.x;
  const top = VIEW / 2 - drawn.h / 2 + offset.y;

  return (
    <div className="space-y-4" role="dialog" aria-label="Profilbild zuschneiden">
      <p className="text-sm text-muted-foreground">Ziehe das Bild, um den Ausschnitt zu wählen. Zoomen mit dem Regler, dem Mausrad oder zwei Fingern.</p>
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div
          className="relative shrink-0 cursor-grab touch-none overflow-hidden rounded-full border border-border bg-surface-muted select-none active:cursor-grabbing"
          style={{ width: VIEW, height: VIEW }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          {source ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={source.url}
              alt=""
              draggable={false}
              className="absolute max-w-none"
              style={{ width: drawn.w, height: drawn.h, left, top }}
            />
          ) : (
            <div className="absolute inset-0 animate-pulse" aria-hidden="true" />
          )}
        </div>
        <div className="w-full max-w-xs space-y-3">
          <label htmlFor="avatar-zoom" className="flex items-center gap-2 text-sm">
            <ZoomOut className="size-4 text-muted-foreground" aria-hidden="true" />
            <input
              id="avatar-zoom"
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoomClamped(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Zoom"
            />
            <ZoomIn className="size-4 text-muted-foreground" aria-hidden="true" />
          </label>
          <div className="flex gap-2">
            <Button onClick={confirm} loading={busy} disabled={!source}>
              <Check aria-hidden="true" /> Übernehmen
            </Button>
            <Button variant="ghost" onClick={onCancel} disabled={busy}>
              <X aria-hidden="true" /> Abbrechen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
