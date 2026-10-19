"use client";

import { useEffect } from "react";
import { trackProductEvent, type ProductEvent } from "@/lib/analytics";

export function TrackPageEvent({ event }: { event: ProductEvent }) {
  useEffect(() => { trackProductEvent(event); }, [event]);
  return null;
}
