"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";

export function Logo() {
  return <Link href="/" className="flex items-center gap-2.5 text-xl font-black tracking-tight"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral text-xl text-white">✳</span><span>Booked<span className="text-coral">In</span></span></Link>;
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [{ href: "/explore", label: "Jelajahi Jasa" }, { href: "/seller/dashboard", label: "Untuk Pemilik Usaha" }];
  return <header className="sticky top-0 z-50 border-b border-[#e9eae4] bg-cream/95 backdrop-blur">
    <div className="container-page flex h-[74px] items-center justify-between"><Logo />
      <nav className="hidden items-center gap-9 md:flex">{links.map(link => <Link key={link.href} href={link.href} className={`text-sm font-semibold transition hover:text-coral ${pathname.startsWith(link.href) ? "text-coral" : "text-ink"}`}>{link.label}</Link>)}</nav>
      <Link href="/seller/start" className="hidden rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1c382c] md:inline-flex">Buka Toko <ArrowUpRight size={17} className="ml-2" /></Link>
      <button type="button" aria-label={open ? "Tutup menu" : "Buka menu"} className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
    {open && <nav className="container-page flex flex-col gap-1 border-t border-[#e9eae4] py-3 md:hidden">{links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-2 py-3 font-semibold">{link.label}</Link>)}<Link href="/seller/start" onClick={() => setOpen(false)} className="rounded-xl px-2 py-3 font-semibold text-coral">Buka Toko</Link></nav>}
  </header>;
}

export function Footer() {
  return <footer className="mt-24 border-t border-[#e7e8e1] bg-[#eff0e8]"><div className="container-page grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
    <div><Logo /><p className="mt-4 max-w-sm text-sm leading-7 text-muted">Temukan tempat favorit baru untuk merawat diri. Booking mudah, waktu lebih berarti.</p></div>
    <div><p className="mb-4 text-sm font-bold">Jelajahi</p><div className="flex flex-col gap-3 text-sm text-muted"><Link href="/explore">Semua jasa</Link><Link href="/explore?category=Salon">Salon</Link><Link href="/explore?category=Barbershop">Barbershop</Link></div></div>
    <div><p className="mb-4 text-sm font-bold">Untuk usaha</p><div className="flex flex-col gap-3 text-sm text-muted"><Link href="/seller/start">Buka toko</Link><Link href="/seller/dashboard">Dashboard seller</Link></div></div>
  </div><div className="container-page border-t border-[#dce0d7] py-5 text-xs text-muted">© {new Date().getFullYear()} BookedIn. Prototipe dengan data simulasi.</div></footer>;
}
