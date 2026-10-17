"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, CalendarDays, Check, Clock3, MapPin } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { getDates, rupiah, timeSlots } from "@/lib/data";
import { AvailabilitySlot } from "@/lib/types";

const dateLabel = (date: string) => new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${date}T12:00:00`));

export default function BookingView() {
  const { slug } = useParams<{ slug: string }>();
  const params = useSearchParams();
  const { businesses, bookings, addBooking, ready } = useApp();
  const business = businesses.find(item => item.slug === slug);
  const [serviceId, setServiceId] = useState(params.get("service") || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  if (!business) return <main className="container-page min-h-[65vh] py-20"><h1 className="text-3xl font-bold">{ready ? "Tempat tidak ditemukan" : "Memuat tempat..."}</h1><Link href="/explore" className="btn-outline mt-6">Kembali ke katalog</Link></main>;

  const selectedService = business.services.find(item => item.id === serviceId);
  const slots: AvailabilitySlot[] = date ? timeSlots(business.openingTime, business.closingTime).map(slot => ({ date, time: slot, available: !bookings.some(item => item.businessId === business.id && item.date === date && item.time === slot) && (date !== getDates(1)[0] || new Date().getHours() < Number(slot.slice(0, 2))) })) : [];
  const submit = (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    if (!selectedService || !date || !time) { setError("Pilih layanan, tanggal, dan jam terlebih dahulu."); return; }
    if (!name.trim() || !phone.trim()) { setError("Lengkapi nama dan nomor WhatsApp."); return; }
    const success = addBooking({ id: crypto.randomUUID(), businessId: business.id, serviceId, customerName: name.trim(), customerPhone: phone.trim(), date, time, createdAt: new Date().toISOString() });
    if (!success) { setError("Slot ini baru saja terisi. Silakan pilih jam lain."); setTime(""); return; }
    setConfirmed(true);
  };

  if (confirmed) return <main className="container-page flex min-h-[70vh] items-center justify-center py-20"><div className="card w-full max-w-xl p-8 text-center md:p-12"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E7F1E8] text-forest"><Check size={36} /></div><p className="eyebrow mt-7">BOOKING BERHASIL</p><h1 className="mt-3 text-3xl font-bold">Sampai jumpa di {business.name}!</h1><p className="mt-4 leading-7 text-muted">Booking simulasi kamu tersimpan di browser ini. Datang sesuai jadwal yang dipilih, ya.</p><div className="mt-7 rounded-2xl bg-cream p-5 text-left text-sm"><p className="font-bold">{selectedService?.name}</p><p className="mt-2 text-muted">{dateLabel(date)} · {time} WIB</p><p className="mt-1 text-muted">Atas nama {name}</p></div><Link href="/explore" className="btn-primary mt-8">Jelajahi tempat lain</Link></div></main>;

  return <main className="container-page py-8 md:py-14"><Link href={`/business/${business.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-forest"><ArrowLeft size={16} /> Kembali ke detail tempat</Link><div className="mt-7 grid gap-10 lg:grid-cols-[1fr_340px]"><div><p className="eyebrow">TINGGAL BEBERAPA LANGKAH</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Atur jadwal kunjunganmu.</h1><p className="mt-4 text-muted">Pilih layanan dan waktu yang paling nyaman untukmu.</p>
    <form onSubmit={submit} className="mt-9 space-y-8"><section className="card p-6 md:p-8"><div className="mb-5 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-peach font-bold text-coral">1</span><h2 className="text-xl font-bold">Pilih layanan</h2></div><div className="space-y-3">{business.services.map(service => <label key={service.id} className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition ${serviceId === service.id ? "border-forest bg-[#F3F7F2]" : "border-[#e5e8df] hover:border-forest"}`}><span className="flex items-center gap-3"><input type="radio" name="service" checked={serviceId === service.id} onChange={() => setServiceId(service.id)} className="accent-forest" /><span><strong className="block">{service.name}</strong><small className="text-muted">{service.duration} menit</small></span></span><strong className="whitespace-nowrap text-sm text-forest">{rupiah(service.price)}</strong></label>)}</div></section>
    <section className="card p-6 md:p-8"><div className="mb-5 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-peach font-bold text-coral">2</span><h2 className="text-xl font-bold">Pilih tanggal & jam</h2></div><div className="grid grid-cols-3 gap-2 sm:grid-cols-7">{getDates().map(item => <button type="button" key={item} onClick={() => { setDate(item); setTime(""); }} className={`rounded-2xl border px-2 py-3 text-xs font-semibold transition ${date === item ? "border-forest bg-forest text-white" : "border-[#e5e8df] hover:border-forest"}`}>{dateLabel(item)}</button>)}</div>{date && <><p className="mb-3 mt-6 text-sm font-semibold">Jam tersedia</p><div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{slots.map(slot => <button type="button" key={slot.time} disabled={!slot.available} onClick={() => setTime(slot.time)} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${time === slot.time ? "border-forest bg-forest text-white" : slot.available ? "border-[#e5e8df] hover:border-forest" : "cursor-not-allowed border-[#f0f0ed] bg-[#f5f5f2] text-[#afb7b0] line-through"}`}>{slot.time}</button>)}</div>{slots.every(slot => !slot.available) && <p className="mt-3 text-sm text-muted">Belum ada jam tersedia pada tanggal ini.</p>}</>}</section>
    <section className="card p-6 md:p-8"><div className="mb-5 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-peach font-bold text-coral">3</span><h2 className="text-xl font-bold">Data dirimu</h2></div><div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="customer-name" className="label">Nama lengkap</label><input id="customer-name" className="field" value={name} onChange={event => setName(event.target.value)} placeholder="Nama kamu" required /></div><div><label htmlFor="customer-phone" className="label">Nomor WhatsApp</label><input id="customer-phone" className="field" value={phone} onChange={event => setPhone(event.target.value)} placeholder="08xxxxxxxxxx" inputMode="tel" required /></div></div><p className="mt-4 text-xs text-muted">Ini simulasi. Kami tidak mengirim pesan atau melakukan pembayaran.</p></section>
    {error && <p role="alert" className="rounded-xl bg-[#fff1ed] px-4 py-3 text-sm font-semibold text-[#a24630]">{error}</p>}<button type="submit" className="btn-primary w-full sm:w-auto">Konfirmasi booking <Check size={18} /></button></form></div>
    <aside className="h-fit rounded-[28px] border border-[#e7e8e1] bg-white p-6 shadow-soft lg:sticky lg:top-28"><img src={business.image} alt="" className="h-40 w-full rounded-2xl object-cover" /><h2 className="mt-5 text-xl font-bold">{business.name}</h2><p className="mt-2 flex items-center gap-2 text-sm text-muted"><MapPin size={15} /> {business.area}</p><div className="mt-6 space-y-3 border-t border-[#eef0e9] pt-5 text-sm"><div className="flex justify-between gap-3"><span className="text-muted">Layanan</span><strong className="text-right">{selectedService?.name || "Belum dipilih"}</strong></div><div className="flex justify-between gap-3"><span className="text-muted">Tanggal</span><strong>{date ? dateLabel(date) : "—"}</strong></div><div className="flex justify-between gap-3"><span className="text-muted">Jam</span><strong>{time ? `${time} WIB` : "—"}</strong></div><div className="flex justify-between gap-3 border-t border-[#eef0e9] pt-4"><span className="font-semibold">Estimasi biaya</span><strong className="text-lg text-forest">{selectedService ? rupiah(selectedService.price) : "—"}</strong></div></div><p className="mt-5 flex items-center gap-2 text-xs text-muted"><CalendarDays size={15} /><Clock3 size={15} /> Booking langsung tercatat di prototipe</p></aside>
  </div></main>;
}
