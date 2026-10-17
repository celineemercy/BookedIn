"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CalendarDays, MapPin, Search, Scissors, Sparkles, Hand, Flower2, Star } from "lucide-react";
import { BusinessCard } from "@/components/BusinessCard";
import { useApp } from "@/components/AppProvider";
import { areas, categories, distanceKm } from "@/lib/data";

const categoryIcons = [Scissors, Sparkles, Hand, Flower2];

export default function Home() {
  const router = useRouter();
  const { businesses } = useApp();
  const [search, setSearch] = useState("");
  const [area, setArea] = useState(areas[0].name);
  const selectedArea = areas.find(item => item.name === area)!;
  const featured = [...businesses].sort((a, b) => distanceKm(selectedArea.lat, selectedArea.lng, a.lat, a.lng) - distanceKm(selectedArea.lat, selectedArea.lng, b.lat, b.lng)).slice(0, 3);
  const explore = (category?: string) => router.push(`/explore?area=${encodeURIComponent(area)}${search ? `&q=${encodeURIComponent(search)}` : ""}${category ? `&category=${encodeURIComponent(category)}` : ""}`);

  return <main>
    <section className="relative overflow-hidden bg-[#F3F1E9]"><div className="container-page grid items-center gap-10 pb-16 pt-12 lg:grid-cols-[1.06fr_.94fr] lg:pb-24 lg:pt-20">
      <div className="relative z-10"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d9e4d9] bg-white/70 px-4 py-2 text-xs font-bold text-forest"><span className="h-2 w-2 rounded-full bg-coral" /> TEMPAT FAVORIT BARU ADA DI DEKATMU</div>
        <h1 className="max-w-[690px] text-[clamp(3.2rem,6vw,5.7rem)] font-bold leading-[1.04] tracking-[-.065em]">Waktunya untuk <span className="font-serif italic font-normal text-coral">dirimu.</span></h1>
        <p className="mt-6 max-w-lg text-base leading-8 text-muted md:text-lg">Cari tempat perawatan dan jasa terbaik di sekitarmu. Pilih waktunya, booking dalam hitungan menit.</p>
        <form onSubmit={event => { event.preventDefault(); explore(); }} className="mt-9 flex flex-col gap-3 rounded-[24px] bg-white p-3 shadow-soft sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 px-3"><Search size={20} className="shrink-0 text-coral" /><input aria-label="Cari layanan atau tempat" value={search} onChange={event => setSearch(event.target.value)} placeholder="Cari layanan atau tempat..." className="w-full bg-transparent py-3 outline-none" /></div>
          <div className="hidden h-9 w-px bg-[#e8e9e2] sm:block" />
          <div className="flex items-center gap-2 px-3"><MapPin size={19} className="shrink-0 text-coral" /><select aria-label="Pilih lokasi" value={area} onChange={event => setArea(event.target.value)} className="w-full bg-transparent py-3 text-sm font-semibold outline-none">{areas.map(item => <option key={item.name}>{item.name}</option>)}</select></div>
          <button type="submit" className="btn-primary sm:px-5"><Search size={18} /><span className="sm:hidden">Cari sekarang</span></button>
        </form>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted"><span>Populer:</span>{["Haircut", "Nail Art", "Massage"].map(term => <button key={term} onClick={() => router.push(`/explore?q=${encodeURIComponent(term)}&area=${encodeURIComponent(area)}`)} className="rounded-full border border-[#dce1d9] px-3 py-1.5 text-ink transition hover:border-coral">{term}</button>)}</div>
      </div>
      <div className="relative mx-auto h-[430px] w-full max-w-[550px] lg:h-[550px]"><div className="absolute inset-8 rounded-[170px_170px_60px_60px] bg-[#E7D4C7]" /><img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1400&q=90" alt="Suasana spa yang tenang" className="absolute inset-0 h-full w-full rounded-[180px_180px_70px_70px] object-cover" /><div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft sm:left-0"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-peach text-coral"><CalendarDays size={22} /></span><div><strong className="block text-sm">Booking jadi mudah</strong><span className="text-xs text-muted">Pilih tempat & waktu favoritmu</span></div></div><div className="absolute -right-2 top-14 rounded-2xl bg-white px-4 py-3 shadow-soft sm:right-0"><div className="flex items-center gap-1 text-sm font-bold"><Star size={16} className="fill-[#E9AD5C] text-[#E9AD5C]" /> 4.9/5</div><span className="text-xs text-muted">Pilihan pelanggan</span></div></div>
    </div></section>

    <section className="container-page py-20"><div className="mb-9 flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">PILIH SESUAI KEBUTUHANMU</p><h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Mau cari perawatan apa?</h2></div><Link href="/explore" className="flex items-center gap-2 font-semibold text-forest">Lihat semua jasa <ArrowRight size={18} /></Link></div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">{categories.map((category, index) => { const Icon = categoryIcons[index]; return <button key={category} onClick={() => explore(category)} className="group rounded-[24px] border border-[#e5e8df] bg-white p-5 text-left transition hover:border-coral hover:shadow-soft md:p-7"><span className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-peach text-coral transition group-hover:bg-coral group-hover:text-white"><Icon size={26} strokeWidth={1.7} /></span><span className="block text-lg font-bold">{category}</span><span className="mt-1 block text-sm text-muted">Jelajahi tempat <ArrowRight size={14} className="inline" /></span></button>; })}</div>
    </section>

    <section className="bg-[#EFF1E9] py-20"><div className="container-page"><div className="mb-9 flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">REKOMENDASI UNTUKMU</p><h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Dekat dari {area}</h2><p className="mt-3 text-muted">Tempat pilihan yang siap menyambutmu.</p></div><Link href={`/explore?area=${encodeURIComponent(area)}`} className="flex items-center gap-2 font-semibold text-forest">Lihat semua <ArrowRight size={18} /></Link></div><div className="grid gap-5 md:grid-cols-3">{featured.map(business => <BusinessCard key={business.id} business={business} distance={distanceKm(selectedArea.lat, selectedArea.lng, business.lat, business.lng)} />)}</div></div></section>

    <section className="container-page py-20"><div className="grid overflow-hidden rounded-[32px] bg-forest lg:grid-cols-2"><div className="p-8 text-white md:p-14"><p className="eyebrow !text-[#F7B9A7]">UNTUK PEMILIK USAHA</p><h2 className="mt-4 max-w-md text-3xl font-bold leading-tight tracking-tight md:text-4xl">Usahamu pantas ditemukan lebih banyak orang.</h2><p className="mt-5 max-w-md leading-7 text-white/70">Tampilkan layananmu, atur jadwal, dan terima booking dalam satu tempat yang sederhana.</p><Link href="/seller/start" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-bold text-forest">Buka toko gratis <ArrowRight size={18} /></Link></div><div className="relative min-h-72 bg-[#D9C2B1]"><img src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=85" alt="Pemilik usaha salon melayani pelanggan" className="absolute inset-0 h-full w-full object-cover" /></div></div></section>
  </main>;
}
