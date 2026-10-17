import type { LiveService } from "./live-types";

export type WeeklyHour = { business_id: string; day_of_week: number; opens_at: string | null; closes_at: string | null };
export type DateBlock = { business_id: string; blocked_date: string };
export type BusySlot = { business_id: string; starts_at: string; ends_at: string };

const JAKARTA_OFFSET = "+07:00";
const MINUTE = 60_000;

export function jakartaDate(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(value);
}

export function jakartaDateTime(date: string, time: string) {
  return new Date(`${date}T${time.slice(0, 5)}:00${JAKARTA_OFFSET}`);
}

export function addJakartaDays(date: string, days: number) {
  const midnight = jakartaDateTime(date, "00:00");
  return jakartaDate(new Date(midnight.getTime() + days * 24 * 60 * MINUTE));
}

export function formatJakartaDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(new Date(value));
}

export function findSlots(input: {
  businessId: string; service: LiveService; date: string; hours: WeeklyHour[];
  blocks: DateBlock[]; busy: BusySlot[]; now?: Date;
}) {
  const { businessId, service, date, hours, blocks, busy, now = new Date() } = input;
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  const rule = hours.find(item => item.business_id === businessId && item.day_of_week === day);
  if (!rule?.opens_at || !rule.closes_at || blocks.some(item => item.business_id === businessId && item.blocked_date === date)) return [];
  const open = jakartaDateTime(date, rule.opens_at);
  const close = jakartaDateTime(date, rule.closes_at);
  const duration = service.duration_minutes * MINUTE;
  const slots: { startsAt: string; available: boolean }[] = [];
  for (let start = open.getTime(); start + duration <= close.getTime(); start += 15 * MINUTE) {
    const end = start + duration;
    const unavailable = busy.some(item => item.business_id === businessId && new Date(item.starts_at).getTime() < end && new Date(item.ends_at).getTime() > start);
    const inWindow = start >= now.getTime() + 2 * 60 * MINUTE && start <= now.getTime() + 30 * 24 * 60 * MINUTE;
    slots.push({ startsAt: new Date(start).toISOString(), available: inWindow && !unavailable });
  }
  return slots;
}

export function nextAvailable(input: Omit<Parameters<typeof findSlots>[0], "date">) {
  const today = jakartaDate(input.now);
  for (let day = 0; day < 30; day++) {
    const slot = findSlots({ ...input, date: addJakartaDays(today, day) }).find(item => item.available);
    if (slot) return slot.startsAt;
  }
  return null;
}
