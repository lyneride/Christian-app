import type { AreaKey } from "@/components/layout/areas";

export type TourKind = "welcome" | AreaKey;
export const TOUR_EVENT = "bleibe:tour";

/** Ask the tour host (mounted in the site layout) to start a tour. */
export function startTour(kind: TourKind) {
  window.dispatchEvent(new CustomEvent<TourKind>(TOUR_EVENT, { detail: kind }));
}
