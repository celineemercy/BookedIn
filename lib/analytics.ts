export const PRODUCT_EVENTS = [
  "home_viewed", "catalog_viewed", "catalog_searched", "catalog_filtered",
  "business_viewed", "booking_started", "booking_request_sent", "booking_request_failed",
  "seller_onboarding_started", "seller_submitted", "seller_responded",
] as const;

export type ProductEvent = (typeof PRODUCT_EVENTS)[number];

export function trackProductEvent(event: ProductEvent) {
  if (typeof window === "undefined") return;
  try {
    let session = window.sessionStorage.getItem("bookedin_session");
    if (!session) {
      session = crypto.randomUUID();
      window.sessionStorage.setItem("bookedin_session", session);
    }
    void fetch("/api/events", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, session }), keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Analytics must never interrupt discovery or booking.
  }
}
