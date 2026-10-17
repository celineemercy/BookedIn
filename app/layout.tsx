import type { Metadata } from "next";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { Header, Footer } from "@/components/Shell";
import { getCurrentUser } from "@/lib/live-data";

export const metadata: Metadata = {
  title: "BookedIn — Cari tempat, pilih waktu",
  description: "Temukan salon, barbershop, nail studio, dan spa di Jakarta. Pilih layanan dan ajukan jadwal langsung di BookedIn."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return <html lang="id"><body className="font-sans text-ink"><AppProvider><Header signedIn={!!user} />{children}<Footer /></AppProvider></body></html>;
}
