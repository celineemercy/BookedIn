import { businesses } from "./data";
import { Booking, Business } from "./types";

const BUSINESS_KEY = "temujasa-businesses-v1";
const BOOKING_KEY = "temujasa-bookings-v1";
const SELLER_KEY = "temujasa-seller-id-v1";

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
  getBookings: (): Booking[] => readList<Booking>(BOOKING_KEY),
  getSellerId: (): string | null => typeof window === "undefined" ? null : localStorage.getItem(SELLER_KEY),
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
  resetDemo: () => {
    localStorage.removeItem(BUSINESS_KEY);
    localStorage.removeItem(BOOKING_KEY);
    localStorage.removeItem(SELLER_KEY);
  },
};
