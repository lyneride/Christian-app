import { describe, expect, it } from "vitest";
import { attendeeSummary, isFull, mapsHref, moreAttendeesLabel, placeLabel } from "./format";

describe("placeLabel / mapsHref", () => {
  it("joins location and city, or says Online", () => {
    expect(placeLabel({ isOnline: false, location: "Gemeindehaus", city: "Hamburg" })).toBe("Gemeindehaus, Hamburg");
    expect(placeLabel({ isOnline: false, location: null, city: "Hamburg" })).toBe("Hamburg");
    expect(placeLabel({ isOnline: false, location: null, city: null })).toBe("Ort folgt");
    expect(placeLabel({ isOnline: true, location: "egal", city: null })).toBe("Online");
  });
  it("links to OpenStreetMap with an encoded query", () => {
    expect(mapsHref("Marktplatz 1", "Köln")).toBe("https://www.openstreetmap.org/search?query=Marktplatz%201%2C%20K%C3%B6ln");
  });
});

describe("attendeeSummary", () => {
  it("describes counts with and without capacity", () => {
    expect(attendeeSummary(0, null)).toBe("Noch niemand dabei");
    expect(attendeeSummary(3, null)).toBe("3 dabei");
    expect(attendeeSummary(3, 20)).toBe("3 von 20 dabei");
    expect(attendeeSummary(20, 20)).toBe("Voll – 20 von 20");
    expect(isFull(20, 20)).toBe(true);
    expect(isFull(19, 20)).toBe(false);
    expect(isFull(99, null)).toBe(false);
    expect(moreAttendeesLabel(1)).toBe("und 1 weitere Person");
    expect(moreAttendeesLabel(7)).toBe("und 7 weitere");
  });
});
