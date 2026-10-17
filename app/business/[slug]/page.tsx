"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3, MapPin, Star, CheckCircle2 } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { rupiah } from "@/lib/data";

export default function BusinessDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { businesses, ready } = useApp();
  const business = businesses.find(item => item.slug === slug);
  if (!business) return <main className="container-page min-h-[65vh] py-20"><h1 className="text-3xl font-bold">{ready ? "Tempat tidak ditemukan" : "Memuat tempat..."}</h1><Link href="/explore" className="btn-outline mt-6">Kembali ke katalog</Link></main>;
  return <main><section className="container-page py-7"><Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-forest"><ArrowLeft size={16} /> Kembali ke katalog</Link>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.55fr_.8fr]"><div className="overflow-hidden rounded-[30px] bg-peach"><img src={business.image} alt={`Suasana ${business.name}`} className="h-[350px] w-full object-cover md:h-[510px]" /></div><div className="flex flex-col justify-between gap-8 rounded-[30px] bg-[#E9EDE4] p-7 md:p-10"><div><span className="rounded-full bg-white px-4 py-2 text-xs font-bold">{business.category}</span><h1 className="mt-8 text-4xl font-bold leading-tight tracking-tight md:text-5xl">{business.name}</h1><p className="mt-5 leading-7 text-muted">{business.description}</p></div><div><div className="flex items-center gap-2 text-sm font-semibold"><Star size={18} className="fill-[#E9AD5C] text-[#E9AD5C]" /> {business.rating.toFixed(1)} <span className="font-normal text-muted">({business.reviewCount} ulasan)</span></div><p className="mt-3 flex items-start gap-2 text-sm text-muted"><MapPin size={17} className="shrink-0 text-coral" /> {business.address}</p><p className="mt-3 flex items-center gap-2 text-sm text-muted"><Clock3 size={17} className="text-coral" /> Setiap hari, {business.openingTime}–{business.closingTime}</p></div></div></div>
  </section><section className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_350px]"><div><p className="eyebrow">LAYANAN KAMI</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Pilih yang paling cocok untukmu</h2><div className="mt-8 space-y-3">{business.services.map(service => <div key={service.id} className="card flex flex-wrap items-center justify-between gap-4 p-5 md:p-6"><div><h3 className="text-lg font-bold">{service.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-muted"><Clock3 size={14} /> {service.duration} menit</p></div><div className="flex items-center gap-4"><strong className="text-forest">{rupiah(service.price)}</strong><Link href={`/booking/${business.slug}?service=${service.id}`} aria-label={`Booking ${service.name}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-peach text-coral hover:bg-coral hover:text-white"><ArrowRight size={18} /></Link></div></div>)}</div></div>
    <aside className="h-fit rounded-[28px] bg-forest p-7 text-white"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><CheckCircle2 /></div><h3 className="mt-5 text-2xl font-bold">Siap untuk me time?</h3><p className="mt-3 text-sm leading-7 text-white/70">Pilih layanan dan waktu favoritmu. Booking selesai hanya dalam beberapa langkah.</p><Link href={`/booking/${business.slug}`} className="mt-6 flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 font-bold text-forest">Booking sekarang <ArrowRight size={17} /></Link></aside>
  </section></main>;
}
