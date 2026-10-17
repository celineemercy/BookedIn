import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { Header, Footer } from "@/components/Shell";

export const metadata: Metadata = {
  title: "BookedIn — Waktunya untuk dirimu",
  description: "Temukan dan booking layanan salon, barbershop, nail studio, dan spa di dekatmu."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body className="font-sans text-ink"><AppProvider><Header />{children}<Footer /></AppProvider></body></html>;
}
