import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { DEFAULT_PALETTE, toMarker, type Marker } from "./markers";

const markerSelect = { key: true, name: true, hue: true, strength: true } as const;

/** The user's marker colours in order; the default palette when they never changed it. */
export const getMarkerPalette = cache(async (userId: string): Promise<Marker[]> => {
  const rows = await prisma.markerColor.findMany({
    where: { userId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: markerSelect,
  });
  return rows.length ? rows.map(toMarker) : [...DEFAULT_PALETTE];
});

/** Palettes of several users (e.g. everyone sharing highlights in a reading group). */
export async function getMarkerPalettes(userIds: string[]): Promise<Map<string, Marker[]>> {
  const ids = [...new Set(userIds)];
  const result = new Map<string, Marker[]>();
  if (ids.length === 0) return result;
  const rows = await prisma.markerColor.findMany({
    where: { userId: { in: ids } },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { userId: true, ...markerSelect },
  });
  for (const id of ids) result.set(id, []);
  for (const r of rows) result.get(r.userId)!.push(toMarker(r));
  for (const id of ids) if (result.get(id)!.length === 0) result.set(id, [...DEFAULT_PALETTE]);
  return result;
}
