import assert from "node:assert/strict";
import test from "node:test";
import { canCustomerCancel, canMarkCompleted, canRespondToRequest, canReviewBooking } from "../lib/booking-policy.ts";

const now = Date.parse("2026-10-17T05:00:00Z");
const after = hours => new Date(now + hours * 60 * 60_000).toISOString();

test("pending response expires at its deadline", () => {
  assert.equal(canRespondToRequest("pending", after(1), now), true);
  assert.equal(canRespondToRequest("pending", after(0), now), false);
  assert.equal(canRespondToRequest("expired", after(1), now), false);
});

test("customer cancellation respects accepted twelve-hour cutoff", () => {
  assert.equal(canCustomerCancel("accepted", after(12), now), true);
  assert.equal(canCustomerCancel("accepted", after(11.99), now), false);
  assert.equal(canCustomerCancel("pending", after(1), now), true);
  assert.equal(canCustomerCancel("pending", after(-1), now), false);
  assert.equal(canCustomerCancel("completed", after(12), now), false);
});

test("completion and review require the right state and customer", () => {
  assert.equal(canMarkCompleted("accepted", after(-1), now), true);
  assert.equal(canMarkCompleted("accepted", after(1), now), false);
  assert.equal(canReviewBooking("completed", "customer-1", "customer-1"), true);
  assert.equal(canReviewBooking("completed", "customer-1", "customer-2"), false);
  assert.equal(canReviewBooking("accepted", "customer-1", "customer-1"), false);
});
