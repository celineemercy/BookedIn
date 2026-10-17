"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { BusinessCard } from "@/components/BusinessCard";
import { useApp } from "@/components/AppProvider";
import { areas, categories, distanceKm } from "@/lib/data";

export default function Explore() {
  const params = useSearchParams();
  const { businesses } = useApp();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "Semua");
  const [area, setArea] = useState(params.get("area") || areas[0].name);
  const selectedArea = areas.find(item => item.name === area) || areas[0];
  const results = useMemo(() => businesses.filter(business => {
    const matchesCategory = category === "Semua" || business.category === category;
    const searchText = `${business.name} ${business.category} ${business.area} ${business.services.map(service => service.name).join(" ")}`.toLowerCase();
    return matchesCategory && searchText.includes(query.trim().toLowerCase());
  }).sort((a, b) => distanceKm(selectedArea.lat, selectedArea.lng, a.lat, a.lng) - distanceKm(selectedArea.lat, selectedArea.lng, b.lat, b.lng)), [businesses, category, query, selectedArea.lat, selectedArea.lng]);

  return <main className="min-h-[70vh]"><section className="bg-[#F1F0E9] py-14 md:py-20"><div className="container-page"><p className="eyebrow">TEMUKAN TEMPAT FAVORITMU</p><h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Jelajahi jasa di dekatmu.</h1><p className="mt-4 max-w-2xl text-muted">Dari potong rambut hingga waktu untuk relaksasi, pilih tempat dan jadwal yang paling pas untukmu.</p></div></section>
    <section className="container-page py-10"><div className="card flex flex-col gap-4 p-4 md:flex-row md:items-center md:p-5"><div className="flex flex-1 items-center gap-3 rounded-2xl bg-cream px-4"><Search size={20} className="text-coral" /><input value={query} onChange={event => setQuery(event.target.value)} aria-label="Cari tempat atau layanan" placeholder="Cari tempat atau layanan..." className="w-full bg-transparent py-4 outline-none" /></div><div className="flex items-center gap-3 rounded-2xl bg-cream px-4"><MapPin size={19} className="text-coral" /><select value={area} onChange={event => setArea(event.target.value)} aria-label="Pilih area" className="w-full bg-transparent py-4 font-semibold outline-none">{areas.map(item => <option key={item.name}>{item.name}</option>)}</select></div></div>
      <div className="mb-7 mt-9 flex flex-wrap items-center justify-between gap-5"><div className="flex flex-wrap gap-2">{["Semua", ...categories].map(item => <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${category === item ? "bg-forest text-white" : "border border-[#dfe3da] bg-white hover:border-forest"}`}>{item}</button>)}</div><div className="flex items-center gap-2 text-sm text-muted"><SlidersHorizontal size={16} /> Terdekat dari {area}</div></div>
      <p className="mb-5 text-sm text-muted"><strong className="text-ink">{results.length} tempat</strong> ditemukan</p>
      {results.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{results.map(business => <BusinessCard key={business.id} business={business} distance={distanceKm(selectedArea.lat, selectedArea.lng, business.lat, business.lng)} />)}</div> : <div className="card px-6 py-16 text-center"><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-peach text-coral"><Search size={28} /></div><h2 className="text-xl font-bold">Belum ada hasil yang cocok</h2><p className="mt-2 text-muted">Coba kata kunci atau kategori lain.</p><button onClick={() => { setQuery(""); setCategory("Semua"); }} className="btn-outline mt-6">Reset pencarian</button></div>}
    </section></main>;
}
