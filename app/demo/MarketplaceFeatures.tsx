"use client";

import { useState, type FormEvent } from "react";
import { BadgeCheck, BellRing, CircleDollarSign, Clock3, Sparkles, UserRound } from "lucide-react";
import { rupiah } from "@/lib/data";
import type { Booking, Business, DemoCustomerProfile, DemoWaitlistEntry } from "@/lib/types";

export function CustomerPassportPanel({ profile, onSave }: { profile: DemoCustomerProfile; onSave: (profile: DemoCustomerProfile) => void }) {
  const [draft, setDraft] = useState(profile);
  const submit = (event: FormEvent) => { event.preventDefault(); onSave(draft); };

  return <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
    <form onSubmit={submit} className="card space-y-5 p-6 md:p-8">
      <div><p className="eyebrow">Beauty Passport</p><h2 className="mt-2 text-2xl font-extrabold">Preferensimu, selalu ikut.</h2><p className="mt-2 text-sm leading-6 text-muted">Simpan detail yang boleh dilihat tempat usaha saat kamu booking. Data demo ini hanya berada di browser.</p></div>
      <div><label className="label" htmlFor="passport-style">Gaya atau hasil yang disukai</label><textarea id="passport-style" className="field min-h-24" value={draft.preferredStyle} onChange={event => setDraft({ ...draft, preferredStyle: event.target.value })} placeholder="Contoh: layer ringan, hasil natural, tidak terlalu pendek" /></div>
      <div><label className="label" htmlFor="passport-allergy">Alergi atau hal yang perlu diperhatikan</label><textarea id="passport-allergy" className="field min-h-20" value={draft.allergies} onChange={event => setDraft({ ...draft, allergies: event.target.value })} placeholder="Contoh: sensitif terhadap pewangi kuat" /></div>
      <div><label className="label" htmlFor="passport-staff">Staf favorit</label><input id="passport-staff" className="field" value={draft.preferredStaff} onChange={event => setDraft({ ...draft, preferredStaff: event.target.value })} placeholder="Contoh: Kak Rani" /></div>
      <label className="flex items-start gap-3 rounded-2xl bg-[#FFF9F3] p-4"><input type="checkbox" className="mt-1 size-4 accent-[#B44426]" checked={draft.whatsappReminders} onChange={event => setDraft({ ...draft, whatsappReminders: event.target.checked })} /><span><strong className="block text-sm">Pengingat WhatsApp</strong><span className="mt-1 block text-xs leading-5 text-muted">Simulasikan pengingat konfirmasi, H-1, dan dua jam sebelum kunjungan.</span></span></label>
      <button className="btn-primary"><UserRound size={17} /> Simpan Beauty Passport</button>
    </form>
    <aside className="space-y-4"><FeatureNote icon={<Sparkles size={19} />} title="Lebih personal" body="Seller memahami preferensi sebelum pelanggan datang." /><FeatureNote icon={<BellRing size={19} />} title="Lebih sedikit lupa" body="Pengingat otomatis membantu menurunkan no-show." /><FeatureNote icon={<BadgeCheck size={19} />} title="Pelanggan memegang kontrol" body="Hanya informasi yang sengaja disimpan yang dibagikan." /></aside>
  </div>;
}

export function CustomerOpportunityStrip({ businesses, onSelect }: { businesses: Business[]; onSelect: (business: Business) => void }) {
  const deals = businesses.filter(item => (item.lastMinuteDiscount || 0) > 0);
  return <section className="mt-6 grid gap-4 md:grid-cols-3">
    <div className="rounded-[22px] bg-[#E6F6ED] p-5 md:col-span-2"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#17643A]">BookedIn Guarantee</p><h2 className="mt-2 text-xl font-extrabold">Harga terkunci. Deposit jelas. Jadwal lebih pasti.</h2><p className="mt-2 text-sm leading-6 text-[#315D43]">Cari badge Guarantee untuk booking dengan perlindungan harga dan kebijakan pembatalan transparan.</p></div><BadgeCheck className="shrink-0 text-[#17643A]" /></div></div>
    <div className="rounded-[22px] bg-[#FFF0E8] p-5"><p className="text-xs font-extrabold uppercase tracking-[.14em] text-accentText">Fill My Chair</p><h2 className="mt-2 font-extrabold">{deals.length ? `${deals.length} promo last-minute` : "Promo segera hadir"}</h2>{deals[0] ? <button onClick={() => onSelect(deals[0])} className="mt-3 text-sm font-extrabold text-accentText underline">Hemat {deals[0].lastMinuteDiscount}% di {deals[0].name}</button> : <p className="mt-2 text-sm text-muted">Seller dapat membuka diskon untuk slot kosong.</p>}</div>
  </section>;
}

export function WaitlistCard({ business, serviceName, date, onJoin, alreadyJoined }: { business: Business; serviceName: string; date: string; onJoin: () => void; alreadyJoined: boolean }) {
  return <section className="mt-5 rounded-[22px] border border-dashed border-[#D9A58E] bg-[#FFF9F3] p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">Smart waitlist</p><h3 className="mt-2 font-extrabold">Tidak menemukan waktu ideal?</h3><p className="mt-1 text-sm text-muted">Masuk antrean {business.name} untuk {serviceName} pada {date}. Seller bisa menawarkan slot yang baru kosong.</p></div><button disabled={alreadyJoined} onClick={onJoin} className="btn-outline text-sm">{alreadyJoined ? "Sudah masuk waitlist" : "Masuk waitlist"}</button></div></section>;
}

export function BookingProtection({ booking }: { booking: Booking }) {
  if (!booking.depositAmount && !booking.discountPercent && !booking.platformFee) return null;
  return <div className="mt-4 grid gap-2 rounded-2xl bg-[#F4FAF6] p-4 text-xs sm:grid-cols-3"><span><strong className="block text-[#17643A]">BookedIn Guarantee</strong>Harga layanan terkunci</span><span><strong className="block">Deposit</strong>{rupiah(booking.depositAmount || 0)}</span><span><strong className="block">Promo</strong>{booking.discountPercent ? `${booking.discountPercent}% Fill My Chair` : "Harga reguler"}</span></div>;
}

export function SellerGrowthPanel({ business, bookings, waitlist, onSaveBusiness, onOffer }: { business: Business; bookings: Booking[]; waitlist: DemoWaitlistEntry[]; onSaveBusiness: (business: Business) => void; onOffer: (entry: DemoWaitlistEntry) => void }) {
  const completed = bookings.filter(item => item.status === "completed");
  const gross = completed.reduce((total, booking) => total + bookingValue(business, booking), 0);
  const fees = completed.reduce((total, booking) => total + (booking.platformFee || 0), 0);
  const deposits = bookings.filter(item => ["pending", "accepted", "completed"].includes(item.status)).reduce((total, booking) => total + (booking.depositAmount || 0), 0);
  const entries = waitlist.filter(item => item.businessId === business.id);

  return <div className="mt-6 space-y-6">
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><GrowthMetric label="Pendapatan selesai" value={rupiah(gross)} /><GrowthMetric label="Biaya BookedIn" value={rupiah(fees)} /><GrowthMetric label="Deposit terlindungi" value={rupiah(deposits)} /><GrowthMetric label="Pendapatan bersih" value={rupiah(gross - fees)} /></section>
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card p-6"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Fill My Chair</p><h3 className="mt-2 text-xl font-extrabold">Ubah slot kosong menjadi pemasukan.</h3></div><Clock3 className="text-accentText" /></div><p className="mt-3 text-sm leading-6 text-muted">Berikan diskon last-minute yang langsung terlihat di katalog pelanggan.</p><label className="label mt-5" htmlFor="last-minute-discount">Diskon slot kosong</label><select id="last-minute-discount" className="field" value={business.lastMinuteDiscount || 0} onChange={event => onSaveBusiness({ ...business, lastMinuteDiscount: Number(event.target.value) })}><option value="0">Nonaktif</option><option value="10">10%</option><option value="15">15%</option><option value="20">20%</option></select><p className="mt-3 text-xs text-muted">Untuk demo, diskon berlaku ke semua slot. Versi produksi dapat membatasinya ke slot 24 jam berikutnya.</p></section>
      <section className="card p-6"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">BookedIn Guarantee</p><h3 className="mt-2 text-xl font-extrabold">Harga jelas, jadwal terlindungi.</h3></div><BadgeCheck className="text-[#17643A]" /></div><label className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-[#FFF9F3] p-4"><span><strong className="block text-sm">Aktifkan jaminan</strong><span className="mt-1 block text-xs text-muted">Deposit dan harga terkunci saat booking.</span></span><input type="checkbox" className="size-5 accent-[#B44426]" checked={business.guaranteeEnabled !== false} onChange={event => onSaveBusiness({ ...business, guaranteeEnabled: event.target.checked })} /></label><label className="label mt-4" htmlFor="deposit-percent">Deposit pelanggan</label><select id="deposit-percent" className="field" value={business.depositPercent ?? 20} onChange={event => onSaveBusiness({ ...business, depositPercent: Number(event.target.value) })}><option value="10">10%</option><option value="20">20%</option><option value="30">30%</option><option value="50">50%</option></select><label className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[#E8D8CF] p-4"><span className="text-sm font-bold">Konfirmasi instan</span><input type="checkbox" className="size-5 accent-[#B44426]" checked={business.instantConfirm || false} onChange={event => onSaveBusiness({ ...business, instantConfirm: event.target.checked })} /></label></section>
    </div>
    <section className="card p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Smart waitlist</p><h3 className="mt-2 text-xl font-extrabold">Pelanggan yang menunggu slot</h3></div><span className="rounded-full bg-[#FFF0E8] px-3 py-1 text-xs font-extrabold text-accentText">{entries.filter(item => item.status === "waiting").length} menunggu</span></div>{entries.length ? <div className="mt-4 space-y-3">{entries.map(entry => <div key={entry.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E8D8CF] p-4"><div><strong className="text-sm">{entry.customerName}</strong><p className="mt-1 text-xs text-muted">{entry.preferredDate} · {windowLabel(entry.timeWindow)}</p></div>{entry.status === "waiting" ? <button onClick={() => onOffer(entry)} className="btn-primary !min-h-10 !px-4 text-sm">Tawarkan slot</button> : <span className="text-sm font-bold text-[#17643A]">Penawaran dikirim</span>}</div>)}</div> : <p className="mt-4 rounded-2xl bg-[#FFF9F3] p-5 text-sm text-muted">Belum ada pelanggan di waitlist toko ini.</p>}</section>
    <section className="rounded-[24px] bg-[#2B211D] p-6 text-white"><div className="flex flex-wrap items-center justify-between gap-5"><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#FFB899]">Model pendapatan</p><h3 className="mt-2 text-xl font-extrabold">5% hanya untuk pelanggan baru dari marketplace.</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-[#E9DDD7]">Booking langsung dan pelanggan yang kembali tetap Rp0. Biaya baru dihitung setelah kunjungan selesai.</p></div><CircleDollarSign size={38} className="text-[#65C18C]" /></div></section>
  </div>;
}

function FeatureNote({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) { return <div className="card p-5"><div className="text-accentText">{icon}</div><h3 className="mt-3 font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{body}</p></div>; }
function GrowthMetric({ label, value }: { label: string; value: string }) { return <div className="card p-5"><p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p><p className="mt-2 text-xl font-extrabold">{value}</p></div>; }
function bookingValue(business: Business, booking: Booking) { const service = business.services.find(item => item.id === booking.serviceId); return Math.round((service?.price || 0) * (1 - (booking.discountPercent || 0) / 100)); }
function windowLabel(value: DemoWaitlistEntry["timeWindow"]) { return value === "morning" ? "Pagi (09–12)" : value === "afternoon" ? "Siang (12–17)" : "Sore (17–20)"; }
