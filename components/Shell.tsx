"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck2, Menu, X } from "lucide-react";
import { useState } from "react";

export function Logo() {
  return <Link href="/" aria-label="BookedIn, kembali ke beranda" className="inline-flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-ink">
    <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-tangerine text-white"><CalendarCheck2 size={22} strokeWidth={2.5} /></span>
    <span>Booked<span className="text-cobalt">In</span></span>
  </Link>;
}

export function Header({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/explore", label: "Jelajahi tempat" },
    { href: "/seller/dashboard", label: "Untuk pemilik usaha" },
    { href: "/demo", label: "Lihat demo" },
  ];
  const account = { href: signedIn ? "/account" : "/login", label: signedIn ? "Akun saya" : "Masuk" };
  return <header className="sticky top-0 z-50 border-b border-[#E9E4DE] bg-paper/95 backdrop-blur">
    <div className="container-page flex h-[72px] items-center justify-between gap-5"><Logo />
      <nav aria-label="Navigasi utama" className="hidden items-center gap-7 md:flex">{links.map(link => <Link key={link.href} href={link.href} aria-current={pathname.startsWith(link.href) ? "page" : undefined} className={`text-sm font-bold hover:text-cobalt ${pathname.startsWith(link.href) ? "text-cobalt" : "text-ink"}`}>{link.label}</Link>)}</nav>
      <Link href={account.href} className="btn-primary hidden !min-h-10 !px-5 !py-2 text-sm md:inline-flex">{account.label}</Link>
      <button type="button" aria-label={open ? "Tutup menu" : "Buka menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D6DCE8] md:hidden">{open ? <X size={22} /> : <Menu size={22} />}</button>
    </div>
    {open && <nav id="mobile-navigation" aria-label="Navigasi seluler" className="container-page flex flex-col gap-1 border-t border-[#E9E4DE] py-3 md:hidden">{[...links, account].map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-bold hover:bg-[#EDF2FF]">{link.label}</Link>)}</nav>}
  </header>;
}

export function Footer() {
  return <footer className="mt-20 border-t border-[#E5E8F0] bg-[#F1F4FB]"><div className="container-page grid gap-9 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
    <div><Logo /><p className="mt-4 max-w-sm text-sm leading-7 text-muted">Cari layanan yang pas, pilih waktunya, dan tunggu konfirmasi dari tempat usaha.</p></div>
    <div><p className="mb-4 font-bold">Jelajahi</p><div className="flex flex-col gap-3 text-sm text-muted"><Link href="/explore">Semua tempat</Link><Link href="/explore?category=Salon">Salon</Link><Link href="/explore?category=Barbershop">Barbershop</Link><Link href="/demo">Demo prototipe</Link></div></div>
    <div><p className="mb-4 font-bold">BookedIn</p><div className="flex flex-col gap-3 text-sm text-muted"><Link href="/seller/start">Daftarkan usaha</Link><Link href="/seller/dashboard">Dashboard pemilik</Link><Link href="/privacy">Privasi</Link></div></div>
  </div><div className="container-page border-t border-[#DAE0ED] py-5 text-xs text-muted">© {new Date().getFullYear()} BookedIn · Jakarta</div></footer>;
}
