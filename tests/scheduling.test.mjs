import assert from "node:assert/strict";
import test from "node:test";
import { addJakartaDays, findSlots, jakartaDate, nextAvailable } from "../lib/scheduling.ts";

const businessId = "shop-1";
const service = { duration_minutes: 60 };
const hours = [{ business_id: businessId, day_of_week: 6, opens_at: "09:00", closes_at: "12:00" }];
const base = { businessId, service, date: "2026-10-17", hours, blocks: [], busy: [], now: new Date("2026-10-16T00:00:00Z") };

test("WIB date arithmetic crosses UTC midnight correctly", () => {
  assert.equal(jakartaDate(new Date("2026-10-16T18:00:00Z")), "2026-10-17");
  assert.equal(addJakartaDays("2026-10-17", 1), "2026-10-18");
});

test("offers 15-minute starts only when full duration fits", () => {
  const slots = findSlots(base);
  assert.equal(slots.length, 9);
  assert.equal(slots[0].startsAt, "2026-10-17T02:00:00.000Z");
  assert.equal(slots.at(-1).startsAt, "2026-10-17T04:00:00.000Z");
  assert.ok(slots.every(slot => slot.available));
});

test("reserves an entire interval across other service starts", () => {
  const busy = [{ business_id: businessId, starts_at: "2026-10-17T03:00:00Z", ends_at: "2026-10-17T04:00:00Z" }];
  const slots = findSlots({ ...base, busy });
  assert.equal(slots.find(slot => slot.startsAt === "2026-10-17T02:00:00.000Z")?.available, true);
  assert.equal(slots.find(slot => slot.startsAt === "2026-10-17T02:15:00.000Z")?.available, false);
  assert.equal(slots.find(slot => slot.startsAt === "2026-10-17T04:00:00.000Z")?.available, true);
});

test("blocks closed dates and enforces two-hour lead", () => {
  assert.deepEqual(findSlots({ ...base, blocks: [{ business_id: businessId, blocked_date: base.date }] }), []);
  const slots = findSlots({ ...base, now: new Date("2026-10-17T00:30:00Z") });
  assert.equal(slots.find(slot => slot.startsAt === "2026-10-17T02:15:00.000Z")?.available, false);
  assert.equal(slots.find(slot => slot.startsAt === "2026-10-17T02:30:00.000Z")?.available, true);
});

test("returns the next available opening", () => {
  assert.equal(nextAvailable({ businessId, service, hours, blocks: [], busy: [], now: new Date("2026-10-16T00:00:00Z") }), "2026-10-17T02:00:00.000Z");
});
