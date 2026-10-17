"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { businesses as seedBusinesses } from "@/lib/data";
import { repository } from "@/lib/store";
import { Booking, Business } from "@/lib/types";

type AppState = {
  businesses: Business[];
  bookings: Booking[];
  sellerId: string | null;
  ready: boolean;
  saveBusiness: (business: Business) => void;
  addBooking: (booking: Booking) => boolean;
  setSellerId: (id: string) => void;
};

const Context = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>(seedBusinesses);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sellerId, setSeller] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydrate the browser-local prototype store after the server render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBusinesses(repository.getBusinesses());
    setBookings(repository.getBookings());
    setSeller(repository.getSellerId());
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
  const setSellerId = (id: string) => { repository.setSellerId(id); setSeller(id); };

  return <Context.Provider value={{ businesses, bookings, sellerId, ready, saveBusiness, addBooking, setSellerId }}>{children}</Context.Provider>;
}

export function useApp() {
  const context = useContext(Context);
  if (!context) throw new Error("AppProvider missing");
  return context;
}
