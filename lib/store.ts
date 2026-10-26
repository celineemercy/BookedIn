import { businesses } from "./data";
import { Booking, Business, DemoCustomerProfile, DemoWaitlistEntry } from "./types";

const BUSINESS_KEY = "temujasa-businesses-v1";
const BOOKING_KEY = "temujasa-bookings-v1";
const SELLER_KEY = "temujasa-seller-id-v1";
const PROFILE_KEY = "temujasa-customer-profile-v1";
const WAITLIST_KEY = "temujasa-waitlist-v1";

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

export const repository = {
  getBusinesses: (): Business[] => {
    const saved = readList<Business>(BUSINESS_KEY);
    const savedIds = new Set(saved.map(item => item.id));
    return [...businesses.filter(item => !savedIds.has(item.id)), ...saved];
  },
  getBookings: (): Booking[] => readList<Booking>(BOOKING_KEY).map(item => ({ ...item, status: item.status || "pending" })),
  getSellerId: (): string | null => typeof window === "undefined" ? null : localStorage.getItem(SELLER_KEY),
  getCustomerProfile: (): DemoCustomerProfile => {
    if (typeof window === "undefined") return { preferredStyle: "", allergies: "", preferredStaff: "", whatsappReminders: true };
    try { return { preferredStyle: "", allergies: "", preferredStaff: "", whatsappReminders: true, ...JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}") }; }
    catch { return { preferredStyle: "", allergies: "", preferredStaff: "", whatsappReminders: true }; }
  },
  saveCustomerProfile: (profile: DemoCustomerProfile) => localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)),
  getWaitlist: (): DemoWaitlistEntry[] => readList<DemoWaitlistEntry>(WAITLIST_KEY),
  saveWaitlistEntry: (entry: DemoWaitlistEntry) => {
    const entries = readList<DemoWaitlistEntry>(WAITLIST_KEY);
    entries.push(entry);
    localStorage.setItem(WAITLIST_KEY, JSON.stringify(entries));
  },
  updateWaitlistEntry: (id: string, changes: Partial<DemoWaitlistEntry>) => {
    const entries = readList<DemoWaitlistEntry>(WAITLIST_KEY);
    const index = entries.findIndex(item => item.id === id);
    if (index < 0) return false;
    entries[index] = { ...entries[index], ...changes };
    localStorage.setItem(WAITLIST_KEY, JSON.stringify(entries));
    return true;
  },
  setSellerId: (id: string) => localStorage.setItem(SELLER_KEY, id),
  saveBusiness: (business: Business) => {
    const custom = readList<Business>(BUSINESS_KEY);
    const index = custom.findIndex(item => item.id === business.id);
    if (index >= 0) custom[index] = business;
    else custom.push(business);
    localStorage.setItem(BUSINESS_KEY, JSON.stringify(custom));
  },
  saveBooking: (booking: Booking) => {
    const bookings = readList<Booking>(BOOKING_KEY);
    if (bookings.some(item => item.businessId === booking.businessId && item.date === booking.date && item.time === booking.time)) return false;
    bookings.push(booking);
    localStorage.setItem(BOOKING_KEY, JSON.stringify(bookings));
    return true;
  },
  updateBooking: (id: string, changes: Partial<Booking>) => {
    const bookings = readList<Booking>(BOOKING_KEY);
    const index = bookings.findIndex(item => item.id === id);
    if (index < 0) return false;
    bookings[index] = { ...bookings[index], ...changes };
    localStorage.setItem(BOOKING_KEY, JSON.stringify(bookings));
    return true;
  },
  resetDemo: () => {
    localStorage.removeItem(BUSINESS_KEY);
    localStorage.removeItem(BOOKING_KEY);
    localStorage.removeItem(SELLER_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(WAITLIST_KEY);
  },
};
