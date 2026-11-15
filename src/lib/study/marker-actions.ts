"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getUserOrThrow, UnauthorizedError } from "@/lib/auth/dal";
import { failure, fieldErrors, success, type ActionState } from "@/lib/action-state";
import { markerInputSchema, type MarkerInput } from "@/lib/validation/study";
import { DEFAULT_MARKER_KEYS, DEFAULT_MARKERS, isMarkerKey, MAX_MARKERS, newMarkerKey, toMarker, type MarkerColor } from "./markers";

/**
 * Server actions for the marker colours in the settings. Every action returns
 * the new palette in `data.palette` so the editor can show it right away.
 */

const LOGIN_REQUIRED = "Bitte melde dich an.";
const GENERIC_ERROR = "Das hat leider nicht geklappt. Bitte versuche es noch einmal.";

const select = { key: true, name: true, hue: true, strength: true, position: true } as const;
type Row = MarkerColor & { position: number };

async function userId(): Promise<string | null> {
  try {
    return (await getUserOrThrow()).id;
  } catch (err) {
    if (err instanceof UnauthorizedError) return null;
    throw err;
  }
}

async function rows(uid: string): Promise<Row[]> {
  return prisma.markerColor.findMany({ where: { userId: uid }, orderBy: [{ position: "asc" }, { createdAt: "asc" }], select });
}

/** The first change stores the default palette, so it can be edited like any other. */
async function materialize(uid: string): Promise<Row[]> {
  const current = await rows(uid);
  if (current.length) return current;
  await prisma.markerColor.createMany({
    data: DEFAULT_MARKERS.map((m, position) => ({ userId: uid, ...m, position })),
    skipDuplicates: true,
  });
  return rows(uid);
}

function revalidate() {
  revalidatePath("/einstellungen/markierungen");
  revalidatePath("/bibel", "layout");
  revalidatePath("/meine-bibel");
  revalidatePath("/leseplaene", "layout");
}

async function done(uid: string, message: string, extra: Record<string, unknown> = {}): Promise<ActionState> {
  revalidate();
  return success(message, { data: { palette: (await rows(uid)).map(toMarker), ...extra } });
}

/** Creates (key null) or updates one colour: meaning, hue and strength. */
export async function saveMarker(input: MarkerInput): Promise<ActionState> {
  const uid = await userId();
  if (!uid) return failure(LOGIN_REQUIRED);
  const parsed = markerInputSchema.safeParse(input);
  if (!parsed.success) return failure("Bitte prüfe deine Eingaben.", { errors: fieldErrors(parsed.error) });
  const { key, name, hue, strength } = parsed.data;

  try {
    const palette = await materialize(uid);
    if (key === null) {
      if (palette.length >= MAX_MARKERS) return failure(`Du kannst höchstens ${MAX_MARKERS} Farben haben.`);
      const position = Math.max(-1, ...palette.map((m) => m.position)) + 1;
      await prisma.markerColor.create({ data: { userId: uid, key: newMarkerKey(), name, hue, strength, position } });
      return done(uid, "Neue Farbe gespeichert.");
    }
    if (!palette.some((m) => m.key === key)) return failure("Diese Farbe gibt es nicht mehr.");
    await prisma.markerColor.update({ where: { userId_key: { userId: uid, key } }, data: { name, hue, strength } });
    return done(uid, "Gespeichert.");
  } catch (err) {
    console.error("[markerfarben] Speichern fehlgeschlagen:", err);
    return failure(GENERIC_ERROR);
  }
}

/** Deletes a colour together with the highlights made in it. */
export async function deleteMarker(key: string): Promise<ActionState> {
  const uid = await userId();
  if (!uid) return failure(LOGIN_REQUIRED);
  if (!isMarkerKey(key)) return failure("Diese Farbe gibt es nicht mehr.");

  try {
    const palette = await materialize(uid);
    if (!palette.some((m) => m.key === key)) return failure("Diese Farbe gibt es nicht mehr.");
    if (palette.length <= 1) return failure("Eine Farbe muss mindestens bleiben.");
    const [removed] = await prisma.$transaction([
      prisma.highlight.deleteMany({ where: { userId: uid, color: key } }),
      prisma.markerColor.delete({ where: { userId_key: { userId: uid, key } } }),
    ]);
    return done(uid, removed.count ? `Farbe gelöscht, ${removed.count} Markierungen entfernt.` : "Farbe gelöscht.", { removed: removed.count });
  } catch (err) {
    console.error("[markerfarben] Löschen fehlgeschlagen:", err);
    return failure(GENERIC_ERROR);
  }
}

/** Moves a colour one place up (-1) or down (1). */
export async function moveMarker(key: string, direction: -1 | 1): Promise<ActionState> {
  const uid = await userId();
  if (!uid) return failure(LOGIN_REQUIRED);
  if (!isMarkerKey(key) || (direction !== -1 && direction !== 1)) return failure(GENERIC_ERROR);

  try {
    const palette = await materialize(uid);
    const from = palette.findIndex((m) => m.key === key);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= palette.length) return done(uid, "");
    const order = [...palette];
    [order[from], order[to]] = [order[to], order[from]];
    await prisma.$transaction(
      order.map((m, position) => prisma.markerColor.update({ where: { userId_key: { userId: uid, key: m.key } }, data: { position } })),
    );
    return done(uid, "");
  } catch (err) {
    console.error("[markerfarben] Sortieren fehlgeschlagen:", err);
    return failure(GENERIC_ERROR);
  }
}

/** Restores the default colours (meaning, colour, order); own extra colours stay at the end. */
export async function resetMarkers(): Promise<ActionState> {
  const uid = await userId();
  if (!uid) return failure(LOGIN_REQUIRED);

  try {
    const own = (await rows(uid)).filter((m) => !DEFAULT_MARKER_KEYS.includes(m.key));
    await prisma.$transaction([
      prisma.markerColor.deleteMany({ where: { userId: uid } }),
      ...(own.length
        ? [
            prisma.markerColor.createMany({
              data: [...DEFAULT_MARKERS, ...own].map((m, position) => ({
                userId: uid,
                key: m.key,
                name: m.name,
                hue: m.hue,
                strength: m.strength,
                position,
              })),
            }),
          ]
        : []),
    ]);
    revalidate();
    const palette = own.length ? (await rows(uid)).map(toMarker) : DEFAULT_MARKERS.map(toMarker);
    return success("Standardfarben wiederhergestellt.", { data: { palette } });
  } catch (err) {
    console.error("[markerfarben] Zurücksetzen fehlgeschlagen:", err);
    return failure(GENERIC_ERROR);
  }
}
