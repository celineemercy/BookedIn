import type { BookingStatus } from "./live-types";

const HOUR = 60 * 60_000;

export function canRespondToRequest(status: BookingStatus, expiresAt: string, nowMs: number) {
  return status === "pending" && new Date(expiresAt).getTime() > nowMs;
}

export function canCustomerCancel(status: BookingStatus, startsAt: string, nowMs: number) {
  const remaining = new Date(startsAt).getTime() - nowMs;
  return (status === "pending" && remaining > 0) || (status === "accepted" && remaining >= 12 * HOUR);
}

export function canMarkCompleted(status: BookingStatus, endsAt: string, nowMs: number) {
  return status === "accepted" && new Date(endsAt).getTime() <= nowMs;
}

export function canReviewBooking(status: BookingStatus, customerId: string, actorId: string) {
  return status === "completed" && customerId === actorId;
}
