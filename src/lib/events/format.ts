/** Pure text helpers for event cards, notifications and the detail page. */

export interface Place {
  isOnline: boolean;
  location: string | null;
  city: string | null;
}

/** "Gemeindehaus, Hamburg" or "Online". */
export function placeLabel(place: Place): string {
  if (place.isOnline) return "Online";
  return [place.location, place.city].filter(Boolean).join(", ") || "Ort folgt";
}

/** OpenStreetMap search link (no Google Maps). */
export function mapsHref(location: string | null, city: string | null): string {
  const query = [location, city].filter(Boolean).join(", ");
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
}

export function isFull(going: number, capacity: number | null): boolean {
  return capacity !== null && going >= capacity;
}

/** "Noch niemand dabei", "3 dabei", "3 von 20 dabei", "Voll – 20 von 20" */
export function attendeeSummary(going: number, capacity: number | null): string {
  if (capacity !== null) {
    if (going >= capacity) return `Voll – ${going} von ${capacity}`;
    return `${going} von ${capacity} dabei`;
  }
  if (going === 0) return "Noch niemand dabei";
  return `${going} dabei`;
}

/** "und 7 weitere" / "und 1 weitere Person" */
export function moreAttendeesLabel(more: number): string {
  return more === 1 ? "und 1 weitere Person" : `und ${more} weitere`;
}
