"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LocateFixed, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { LiveBusinessCard } from "@/components/LiveBusinessCard";
import { CATEGORIES, JAKARTA_AREAS, type LiveBusiness } from "@/lib/live-types";
import { distanceKm } from "@/lib/data";
import { addJakartaDays, jakartaDate } from "@/lib/scheduling";

export default function ExploreView({ businesses, favorites, signedIn }: { businesses: LiveBusiness[]; favorites: string[]; signedIn: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");
  const category = params.get("category") || "";
  const area = params.get("area") || "";
  const maxPrice = Number(params.get("price") || 0);
  const day = params.get("day") || "";
  const query = (params.get("q") || "").toLowerCase();
  const today = jakartaDate();
  const date = day === "today" ? today : day === "tomorrow" ? addJakartaDays(today, 1) : "";
  const areaPoint = JAKARTA_AREAS.find(item => item.name === area);
  const origin = gps || areaPoint;

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    router.replace(`/explore${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
  };
  const results = useMemo(() => businesses.filter(business => {
    const services = business.services?.filter(item => item.active) || [];
    const searchable = `${business.name} ${business.category} ${business.area} ${services.map(item => item.name).join(" ")}`.toLowerCase();
    const minPrice = services.length ? Math.min(...services.map(item => item.price_idr)) : Infinity;
    return (!category || business.category === category) && (!query || searchable.includes(query)) && (!maxPrice || minPrice <= maxPrice) && (!date || business.available_days?.includes(date));
  }).sort((a, b) => origin
    ? distanceKm(origin.lat, origin.lng, a.lat, a.lng) - distanceKm(origin.lat, origin.lng, b.lat, b.lng)
    : (a.next_available || "z").localeCompare(b.next_available || "z")), [businesses, category, query, maxPrice, date, origin]);
  const activeFilters = [category && ["category", category], area && ["area", area], maxPrice && ["price", `≤ Rp${maxPrice.toLocaleString("id-ID")}`], day && ["day", day === "today" ? "Hari ini" : "Besok"]].filter(Boolean) as string[][];

  const locate = () => {
    if (!navigator.geolocation) { setLocationError("Lokasi perangkat tidak tersedia. Pilih area secara manual."); return; }
    navigator.geolocation.getCurrentPosition(position => {
      setGps({ lat: position.coords.latitude, lng: position.coords.longitude }); setLocationError(""); setParam("area", "");
    }, () => setLocationError("Akses lokasi ditolak. Kamu tetap bisa memilih area secara manual."), { enableHighAccuracy: false, timeout: 8000 });
  };

  return <main className="container-page min-h-[70vh] py-8 md:py-12"><div className="mb-6"><p className="eyebrow">Temukan yang pas</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Jelajahi tempat di Jakarta</h1><p className="mt-2 text-sm text-muted">Bandingkan layanan, harga, dan jadwal sebelum mengajukan booking.</p></div>
    <form onSubmit={event => { event.preventDefault(); setParam("q", search.trim()); }} className="flex gap-2 rounded-[20px] border border-[#E2E8F2] bg-white p-2 shadow-sm"><label className="flex flex-1 items-center gap-2 px-2"><Search size={19} className="text-cobalt" /><span className="sr-only">Cari tempat atau layanan</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Cari tempat atau layanan" className="w-full py-3 outline-none" /></label><button type="submit" className="btn-primary !min-h-10 !px-4">Cari</button></form>
    <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]"><label className="flex items-center gap-2 rounded-2xl border border-[#DCE3F0] bg-white px-4"><MapPin size={18} className="text-cobalt" /><span className="sr-only">Pilih area Jakarta</span><select value={area} onChange={event => { setGps(null); setParam("area", event.target.value); }} className="w-full bg-transparent py-3.5 text-sm font-bold outline-none"><option value="">Semua Jakarta</option>{JAKARTA_AREAS.map(item => <option key={item.name}>{item.name}</option>)}</select></label><button type="button" onClick={locate} className="btn-outline !min-h-11 text-sm"><LocateFixed size={17} />{gps ? "Lokasi perangkat aktif" : "Pakai lokasiku"}</button></div>
    {locationError && <p role="status" className="mt-2 text-sm text-tangerine">{locationError}</p>}
    <div className="mt-5 flex flex-wrap gap-2" aria-label="Kategori">{["", ...CATEGORIES].map(item => <button key={item || "all"} type="button" onClick={() => setParam("category", item)} aria-pressed={category === item} className={`rounded-full border px-4 py-2 text-sm font-bold ${category === item ? "border-cobalt bg-cobalt text-white" : "border-[#DCE3F0] bg-white hover:border-cobalt"}`}>{item || "Semua"}</button>)}</div>
    <div className="mt-4 flex flex-wrap gap-3"><label className="flex items-center gap-2 text-sm font-bold"><SlidersHorizontal size={16} />Harga <select value={maxPrice || ""} onChange={event => setParam("price", event.target.value)} className="rounded-xl border border-[#DCE3F0] bg-white px-3 py-2"><option value="">Semua</option><option value="150000">≤ Rp150.000</option><option value="300000">≤ Rp300.000</option><option value="500000">≤ Rp500.000</option></select></label><label className="flex items-center gap-2 text-sm font-bold">Tersedia <select value={day} onChange={event => setParam("day", event.target.value)} className="rounded-xl border border-[#DCE3F0] bg-white px-3 py-2"><option value="">Kapan saja</option><option value="today">Hari ini</option><option value="tomorrow">Besok</option></select></label></div>
    {!!activeFilters.length && <div className="mt-5 flex flex-wrap gap-2">{activeFilters.map(([key, label]) => <button key={key} type="button" onClick={() => { if (key === "area") setGps(null); setParam(key, ""); }} className="inline-flex items-center gap-1 rounded-full bg-[#E9EEFF] px-3 py-1.5 text-xs font-bold text-cobalt">{label}<X size={13} /></button>)}</div>}
    <div className="mt-7 flex flex-wrap items-end justify-between gap-2"><p className="font-extrabold">{results.length} tempat ditemukan</p><p className="text-xs text-muted">{origin ? `Diurutkan menurut jarak garis lurus ${gps ? "dari lokasimu" : `dari pusat ${area}`}` : "Diurutkan menurut jadwal terdekat"}</p></div>
    {results.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{results.map(business => <LiveBusinessCard key={business.id} business={business} distance={origin ? distanceKm(origin.lat, origin.lng, business.lat, business.lng) : undefined} saved={favorites.includes(business.id)} signedIn={signedIn} />)}</div> : <div className="mt-5 rounded-[24px] border border-dashed border-[#AAB9DB] bg-white p-8"><h2 className="text-xl font-extrabold">Belum ada tempat yang cocok</h2><p className="mt-2 max-w-lg text-muted">Coba area, harga, atau hari lain. Toko baru hanya muncul setelah diverifikasi oleh BookedIn.</p><button type="button" onClick={() => { setGps(null); setSearch(""); router.replace("/explore"); }} className="btn-outline mt-5">Reset filter</button></div>}
  </main>;
}
