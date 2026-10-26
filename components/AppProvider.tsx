"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { businesses as seedBusinesses } from "@/lib/data";
import { repository } from "@/lib/store";
import { Booking, Business, DemoCustomerProfile, DemoWaitlistEntry } from "@/lib/types";

type AppState = {
  businesses: Business[];
  bookings: Booking[];
  sellerId: string | null;
  customerProfile: DemoCustomerProfile;
  waitlist: DemoWaitlistEntry[];
  ready: boolean;
  saveBusiness: (business: Business) => void;
  addBooking: (booking: Booking) => boolean;
  updateBooking: (id: string, changes: Partial<Booking>) => boolean;
  saveCustomerProfile: (profile: DemoCustomerProfile) => void;
  addWaitlistEntry: (entry: DemoWaitlistEntry) => void;
  updateWaitlistEntry: (id: string, changes: Partial<DemoWaitlistEntry>) => boolean;
  setSellerId: (id: string) => void;
  resetDemo: () => void;
};

const Context = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>(seedBusinesses);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sellerId, setSeller] = useState<string | null>(null);
  const [customerProfile, setCustomerProfile] = useState<DemoCustomerProfile>({ preferredStyle: "", allergies: "", preferredStaff: "", whatsappReminders: true });
  const [waitlist, setWaitlist] = useState<DemoWaitlistEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydrate the browser-local prototype store after the server render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBusinesses(repository.getBusinesses());
    setBookings(repository.getBookings());
    setSeller(repository.getSellerId());
    setCustomerProfile(repository.getCustomerProfile());
    setWaitlist(repository.getWaitlist());
    setReady(true);
  }, []);

  const saveBusiness = (business: Business) => {
    repository.saveBusiness(business);
    setBusinesses(repository.getBusinesses());
  };
  const addBooking = (booking: Booking) => {
    const success = repository.saveBooking(booking);
    if (success) setBookings(repository.getBookings());
    return success;
  };
  const updateBooking = (id: string, changes: Partial<Booking>) => {
    const success = repository.updateBooking(id, changes);
    if (success) setBookings(repository.getBookings());
    return success;
  };
  const saveCustomerProfile = (profile: DemoCustomerProfile) => { repository.saveCustomerProfile(profile); setCustomerProfile(profile); };
  const addWaitlistEntry = (entry: DemoWaitlistEntry) => { repository.saveWaitlistEntry(entry); setWaitlist(repository.getWaitlist()); };
  const updateWaitlistEntry = (id: string, changes: Partial<DemoWaitlistEntry>) => {
    const success = repository.updateWaitlistEntry(id, changes);
    if (success) setWaitlist(repository.getWaitlist());
    return success;
  };
  const setSellerId = (id: string) => { repository.setSellerId(id); setSeller(id); };
  const resetDemo = () => { repository.resetDemo(); setBusinesses(seedBusinesses); setBookings([]); setSeller(null); setCustomerProfile({ preferredStyle: "", allergies: "", preferredStaff: "", whatsappReminders: true }); setWaitlist([]); };

  return <Context.Provider value={{ businesses, bookings, sellerId, customerProfile, waitlist, ready, saveBusiness, addBooking, updateBooking, saveCustomerProfile, addWaitlistEntry, updateWaitlistEntry, setSellerId, resetDemo }}>{children}</Context.Provider>;
}

export function useApp() {
  const context = useContext(Context);
  if (!context) throw new Error("AppProvider missing");
  return context;
}
