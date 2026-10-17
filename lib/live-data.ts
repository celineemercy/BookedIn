import "server-only";
import { createSupabaseServerClient } from "./supabase/server";
import type { LiveBusiness, LiveBooking } from "./live-types";
import { addJakartaDays, findSlots, jakartaDate, nextAvailable, type BusySlot, type DateBlock, type WeeklyHour } from "./scheduling";

export async function getPublicBusinesses(): Promise<LiveBusiness[]> {
  const client = await createSupabaseServerClient();
  if (!client) return [];
  const { data } = await client.from("businesses").select("*, services(*)").eq("status", "published").order("created_at", { ascending: false });
  const businesses = (data || []) as LiveBusiness[];
  if (!businesses.length) return [];
  const ids = businesses.map(item => item.id);
  const from = new Date();
  const to = new Date(from.getTime() + 31 * 24 * 60 * 60_000);
  const [hoursResult, blocksResult, busyResult, reviewsResult] = await Promise.all([
    client.from("weekly_hours").select("business_id, day_of_week, opens_at, closes_at").in("business_id", ids),
    client.from("date_blocks").select("business_id, blocked_date").in("business_id", ids),
    client.rpc("get_busy_slots", { p_business_ids: ids, p_from: from.toISOString(), p_to: to.toISOString() }),
    client.from("reviews").select("business_id, rating").in("business_id", ids).eq("visible", true),
  ]);
  const hours = (hoursResult.data || []) as WeeklyHour[];
  const blocks = (blocksResult.data || []) as DateBlock[];
  const busy = (busyResult.data || []) as BusySlot[];
  const reviews = (reviewsResult.data || []) as { business_id: string; rating: number }[];
  return businesses.map(business => {
    const services = business.services?.filter(item => item.active) || [];
    const nextTimes = services.map(service => nextAvailable({ businessId: business.id, service, hours, blocks, busy, now: from })).filter((value): value is string => !!value).sort();
    const today = jakartaDate(from);
    const availableDays = [today, addJakartaDays(today, 1)].filter(date => services.some(service => findSlots({ businessId: business.id, service, date, hours, blocks, busy, now: from }).some(slot => slot.available)));
    const ownReviews = reviews.filter(item => item.business_id === business.id);
    return {
      ...business,
      next_available: nextTimes[0] || null,
      available_days: availableDays,
      rating: ownReviews.length ? ownReviews.reduce((sum, item) => sum + item.rating, 0) / ownReviews.length : null,
      review_count: ownReviews.length,
    };
  });
}

export async function getPublicBusinessBySlug(slug: string) {
  return (await getPublicBusinesses()).find(item => item.slug === slug) || null;
}

export async function getBusinessAvailability(businessId: string) {
  const client = await createSupabaseServerClient();
  if (!client) return { hours: [], blocks: [], busy: [] } as { hours: WeeklyHour[]; blocks: DateBlock[]; busy: BusySlot[] };
  const from = new Date();
  const to = new Date(from.getTime() + 31 * 24 * 60 * 60_000);
  const [hours, blocks, busy] = await Promise.all([
    client.from("weekly_hours").select("business_id, day_of_week, opens_at, closes_at").eq("business_id", businessId),
    client.from("date_blocks").select("business_id, blocked_date").eq("business_id", businessId),
    client.rpc("get_busy_slots", { p_business_ids: [businessId], p_from: from.toISOString(), p_to: to.toISOString() }),
  ]);
  return { hours: (hours.data || []) as WeeklyHour[], blocks: (blocks.data || []) as DateBlock[], busy: (busy.data || []) as BusySlot[] };
}

export async function getCurrentUser() {
  const client = await createSupabaseServerClient();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  return user;
}

export async function getMyBookings(): Promise<LiveBooking[]> {
  const client = await createSupabaseServerClient();
  const user = await getCurrentUser();
  if (!client || !user) return [];
  const { data } = await client.from("bookings").select("*, businesses(name, slug, address, contact_phone)").eq("customer_id", user.id).order("starts_at", { ascending: false });
  return (data || []) as LiveBooking[];
}
