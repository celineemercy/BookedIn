"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, CalendarCheck2, CheckCircle2, Clock3 } from "lucide-react";
import { requestBooking } from "@/app/actions/booking";
import { rupiah } from "@/lib/data";
import type { LiveBusiness } from "@/lib/live-types";
import { addJakartaDays, findSlots, formatJakartaDateTime, jakartaDate, type BusySlot, type DateBlock, type WeeklyHour } from "@/lib/scheduling";
import { trackProductEvent } from "@/lib/analytics";
import { TrackPageEvent } from "@/components/TrackPageEvent";

type Availability = { hours: WeeklyHour[]; blocks: DateBlock[]; busy: BusySlot[] };
const timeLabel = (value: string) => new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(value));
const dayLabel = (value: string) => new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", weekday: "short", day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00+07:00`));

export default function BookingView({ business, availability, initialService, signedIn, profile }: { business: LiveBusiness; availability: Availability; initialService: string; signedIn: boolean; profile: { display_name: string; phone: string | null } | null }) {
  const services = (business.services || []).filter(item => item.active);
  const [serviceId, setServiceId] = useState(services.some(item => item.id === initialService) ? initialService : services[0]?.id || "");
  const [date, setDate] = useState(jakartaDate());
  const [startsAt, setStartsAt] = useState("");
  const [name, setName] = useState(profile?.display_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();
  const service = services.find(item => item.id === serviceId);
  const dates = useMemo(() => Array.from({ length: 30 }, (_, index) => addJakartaDays(jakartaDate(), index)), []);
  const slots = service ? findSlots({ businessId: business.id, service, date, ...availability }) : [];
  const chosenSlot = slots.find(item => item.startsAt === startsAt && item.available);

  const submit = (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    if (!service || !chosenSlot) { setError("Pilih layanan, tanggal, dan jam yang tersedia."); return; }
    if (name.trim().length < 2) { setError("Isi nama lengkapmu."); return; }
    startTransition(async () => {
      const result = await requestBooking({ businessId: business.id, serviceId: service.id, startsAt, customerName: name.trim(), customerPhone: phone.trim() });
      if (result.ok) { trackProductEvent("booking_request_sent"); setSubmitted(true); } else { trackProductEvent("booking_request_failed"); setError(result.error); setStartsAt(""); }
    });
  };

  if (submitted) return <main className="container-page flex min-h-[70vh] items-center justify-center py-16"><div className="card max-w-xl p-8 text-center md:p-12"><CheckCircle2 size={52} className="mx-auto text-cobalt" /><p className="eyebrow mt-6">Permintaan terkirim</p><h1 className="mt-2 text-3xl font-extrabold">Menunggu konfirmasi tempat usaha</h1><p className="mt-4 leading-7 text-muted">Jadwalmu belum terkonfirmasi. {business.name} dapat menerima atau menolak permintaan ini. Kami akan mengirim email saat status berubah.</p><div className="mt-6 rounded-2xl bg-[#F2F5FF] p-5 text-left text-sm"><strong>{service?.name}</strong><p className="mt-2 text-muted">{formatJakartaDateTime(startsAt)} · {rupiah(service?.price_idr || 0)}</p><p className="mt-2 text-muted">Bayar di tempat setelah layanan selesai.</p></div><Link href="/account" className="btn-primary mt-7">Lihat status booking <ArrowRight size={17} /></Link></div></main>;

  return <main className="container-page py-7 md:py-12"><TrackPageEvent event="booking_started" /><Link href={`/business/${business.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-cobalt"><ArrowLeft size={16} /> Kembali ke detail tempat</Link><div className="mt-5 grid gap-7 lg:grid-cols-[1fr_330px]"><div><p className="eyebrow">Ajukan jadwal</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Pilih layanan dan waktu</h1><p className="mt-3 text-muted">Permintaanmu akan dikirim ke {business.name} untuk dikonfirmasi.</p>
    <form onSubmit={submit} className="mt-7 space-y-5"><section className="card p-5 md:p-7"><h2 className="text-lg font-extrabold">1. Layanan</h2><div className="mt-4 space-y-2">{services.map(item => <label key={item.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 ${serviceId === item.id ? "border-cobalt bg-[#F2F5FF]" : "border-[#E2E8F2]"}`}><span className="flex items-center gap-3"><input type="radio" name="service" value={item.id} checked={serviceId === item.id} onChange={() => { setServiceId(item.id); setStartsAt(""); }} /><span><strong className="block">{item.name}</strong><small className="text-muted">{item.duration_minutes} menit</small></span></span><strong className="whitespace-nowrap text-sm text-cobalt">{rupiah(item.price_idr)}</strong></label>)}</div></section>
    <section className="card p-5 md:p-7"><h2 className="text-lg font-extrabold">2. Tanggal dan jam</h2><label className="label mt-5" htmlFor="booking-date">Tanggal kunjungan</label><select id="booking-date" value={date} onChange={event => { setDate(event.target.value); setStartsAt(""); }} className="field max-w-sm">{dates.map(item => <option key={item} value={item}>{dayLabel(item)}</option>)}</select><p className="mt-5 text-sm font-bold">Jam tersedia · WIB</p><div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">{slots.map(slot => <button key={slot.startsAt} type="button" disabled={!slot.available} aria-pressed={startsAt === slot.startsAt} onClick={() => setStartsAt(slot.startsAt)} className={`min-h-11 rounded-xl border px-2 py-2 text-sm font-bold ${startsAt === slot.startsAt ? "border-cobalt bg-cobalt text-white" : slot.available ? "border-[#DCE3F0] hover:border-cobalt" : "cursor-not-allowed border-[#ECEEF2] bg-[#F6F7F8] text-[#A5ACBA] line-through"}`}>{timeLabel(slot.startsAt)}</button>)}</div>{!slots.some(item => item.available) && <p className="mt-3 text-sm text-muted">Belum ada waktu yang cocok pada tanggal ini. Coba hari lain.</p>}</section>
    <section className="card p-5 md:p-7"><h2 className="text-lg font-extrabold">3. Data kontak</h2>{signedIn ? <div className="mt-4 grid gap-4 sm:grid-cols-2"><div><label htmlFor="customer-name" className="label">Nama lengkap</label><input id="customer-name" required minLength={2} value={name} onChange={event => setName(event.target.value)} className="field" /></div><div><label htmlFor="customer-phone" className="label">Nomor telepon (opsional)</label><input id="customer-phone" inputMode="tel" value={phone} onChange={event => setPhone(event.target.value)} className="field" placeholder="08xxxxxxxxxx" /></div></div> : <div className="mt-4 rounded-2xl bg-[#FFF0E8] p-4"><p className="text-sm font-semibold">Masuk dengan email agar kamu dan tempat usaha dapat melihat status booking yang sama.</p><Link href={`/login?next=${encodeURIComponent(`/booking/${business.slug}?service=${serviceId}`)}`} className="btn-outline mt-4 bg-white">Masuk untuk booking</Link></div>}</section>
    <div className="rounded-2xl bg-[#FFF0E8] p-4 text-sm leading-6"><strong>Permintaan belum otomatis dikonfirmasi.</strong> Tempat usaha akan merespons dalam 24 jam atau paling lambat satu jam sebelum jadwal dimulai. Pembayaran dilakukan di tempat.</div>
    {error && <p role="alert" className="rounded-xl bg-[#FFE5DC] p-4 text-sm font-bold text-[#963C25]">{error}</p>}<button type="submit" disabled={!signedIn || pending || !chosenSlot} className="btn-primary w-full sm:w-auto">{pending ? "Mengirim..." : "Kirim permintaan booking"} <ArrowRight size={17} /></button></form></div>
    <aside className="card h-fit p-6 lg:sticky lg:top-28"><div className="flex items-center gap-2 text-cobalt"><CalendarCheck2 size={20} /><strong>Ringkasan</strong></div><h2 className="mt-4 text-xl font-extrabold">{business.name}</h2><p className="mt-1 text-sm text-muted">{business.address}</p><div className="mt-5 space-y-3 border-t border-[#E2E8F2] pt-5 text-sm"><p className="flex justify-between gap-3"><span className="text-muted">Layanan</span><strong className="text-right">{service?.name || "—"}</strong></p><p className="flex justify-between gap-3"><span className="text-muted">Durasi</span><strong>{service?.duration_minutes || "—"} menit</strong></p><p className="flex justify-between gap-3"><span className="text-muted">Waktu</span><strong className="text-right">{chosenSlot ? formatJakartaDateTime(chosenSlot.startsAt) : "Belum dipilih"}</strong></p><p className="flex justify-between gap-3 border-t border-[#E2E8F2] pt-3"><span className="text-muted">Bayar di tempat</span><strong className="text-cobalt">{service ? rupiah(service.price_idr) : "—"}</strong></p></div><p className="mt-5 flex items-center gap-2 text-xs text-muted"><Clock3 size={15} /> Status awal: menunggu konfirmasi</p></aside></div></main>;
}
