import { Suspense } from "react";
import BookingView from "./view";

export default function BookingPage() { return <Suspense fallback={<main className="container-page min-h-[70vh] py-20">Memuat booking...</main>}><BookingView /></Suspense>; }
