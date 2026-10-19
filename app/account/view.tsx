"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, CalendarDays, Heart, LogOut, Star } from "lucide-react";
import { changeBookingStatus } from "@/app/actions/booking";
import { submitReview, updateProfile } from "@/app/actions/account";
import { signOut } from "@/app/actions/auth";
import type { LiveBooking, LiveBusiness } from "@/lib/live-types";
import { formatJakartaDateTime } from "@/lib/scheduling";
import { LiveBusinessCard } from "@/components/LiveBusinessCard";
import { rupiah } from "@/lib/data";
import { canCustomerCancel } from "@/lib/booking-policy";

const statusText: Record<string, string> = {
  pending: "Menunggu konfirmasi", accepted: "Dikonfirmasi", declined: "Ditolak", expired: "Kedaluwarsa",
  cancelled_by_customer: "Dibatalkan", cancelled_by_seller: "Dibatalkan tempat", completed: "Selesai",
};

export default function AccountView({ email, profile, bookings, favorites, reviewedIds, nowMs }: { email: string; profile: { display_name: string; phone: string | null; is_admin: boolean }; bookings: LiveBooking[]; favorites: LiveBusiness[]; reviewedIds: string[]; nowMs: number }) {
  const [name, setName] = useState(profile.display_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<"bookings" | "favorites" | "profile">("bookings");
  return <main className="container-page min-h-[70vh] py-9 md:py-14"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Akun saya</p><h1 className="mt-2 text-3xl font-extrabold md:text-4xl">Halo, {profile.display_name || email.split("@")[0]}</h1><p className="mt-2 text-sm text-muted">Pantau permintaan dan kunjunganmu dari sini.</p></div><div className="flex flex-wrap gap-2"><Link href="/seller/dashboard" className="btn-outline text-sm">Kelola usaha</Link>{profile.is_admin && <Link href="/admin" className="btn-outline text-sm">Admin</Link>}<form action={signOut}><button type="submit" className="btn-outline text-sm"><LogOut size={16} /> Keluar</button></form></div></div>
    <nav aria-label="Bagian akun" className="mt-8 flex gap-2 overflow-x-auto border-b border-[#E8D8CF] pb-3">{([{"id":"bookings","label":"Booking"},{"id":"favorites","label":"Tersimpan"},{"id":"profile","label":"Profil"}] as const).map(item => <button key={item.id} onClick={() => setTab(item.id)} aria-current={tab === item.id ? "page" : undefined} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold ${tab === item.id ? "bg-accentText text-white" : "hover:bg-[#FFF0E8]"}`}>{item.label}</button>)}</nav>
    {message && <p role="status" className="mt-5 rounded-xl bg-[#FFF0E8] p-4 text-sm font-bold text-accentText">{message}</p>}
    {tab === "bookings" && <section className="mt-7"><h2 className="text-xl font-extrabold">Booking saya</h2>{bookings.length ? <div className="mt-4 space-y-4">{bookings.map(booking => <BookingRow key={booking.id} booking={booking} reviewed={reviewedIds.includes(booking.id)} onMessage={setMessage} nowMs={nowMs} />)}</div> : <div className="card mt-4 p-8 text-center"><CalendarDays size={34} className="mx-auto text-accentText" /><h3 className="mt-4 text-lg font-extrabold">Belum ada booking</h3><p className="mt-2 text-muted">Temukan layanan yang cocok untukmu.</p><Link href="/explore" className="btn-primary mt-5">Jelajahi tempat <ArrowRight size={16} /></Link></div>}</section>}
    {tab === "favorites" && <section className="mt-7"><h2 className="text-xl font-extrabold">Tempat tersimpan</h2>{favorites.length ? <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{favorites.map(item => <LiveBusinessCard key={item.id} business={item} saved signedIn />)}</div> : <div className="card mt-4 p-8 text-center"><Heart className="mx-auto text-accentText" /><p className="mt-4 font-bold">Belum ada tempat tersimpan.</p><Link href="/explore" className="btn-outline mt-5">Cari tempat</Link></div>}</section>}
    {tab === "profile" && <section className="card mt-7 max-w-xl p-6"><h2 className="text-xl font-extrabold">Profil saya</h2><p className="mt-2 text-sm text-muted">Email masuk: {email}</p><form onSubmit={event => { event.preventDefault(); startTransition(async () => { const result = await updateProfile({ displayName: name, phone }); setMessage(result.ok ? "Profil tersimpan." : result.error); }); }} className="mt-6 space-y-4"><div><label htmlFor="profile-name" className="label">Nama lengkap</label><input id="profile-name" value={name} onChange={event => setName(event.target.value)} className="field" required /></div><div><label htmlFor="profile-phone" className="label">Telepon (opsional)</label><input id="profile-phone" value={phone} onChange={event => setPhone(event.target.value)} className="field" inputMode="tel" /></div><button disabled={pending} className="btn-primary" type="submit">Simpan profil</button></form></section>}
  </main>;
}

function BookingRow({ booking, reviewed, onMessage, nowMs }: { booking: LiveBooking; reviewed: boolean; onMessage: (value: string) => void; nowMs: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [reviewDone, setReviewDone] = useState(reviewed);
  const timeUntilStart = new Date(booking.starts_at).getTime() - nowMs;
  const canCancel = canCustomerCancel(booking.status, booking.starts_at, nowMs);
  return <article className="card p-5 md:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><Link href={`/business/${booking.businesses?.slug || ""}`} className="text-lg font-extrabold hover:text-accentText">{booking.businesses?.name || "Tempat usaha"}</Link><p className="mt-1 font-semibold">{booking.service_name}</p><p className="mt-2 text-sm text-muted">{formatJakartaDateTime(booking.starts_at)} · {rupiah(booking.price_idr)} · bayar di tempat</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${booking.status === "accepted" ? "bg-[#E6F6ED] text-[#17643A]" : booking.status === "pending" ? "bg-[#FFF0E8] text-[#A54D2C]" : "bg-[#F3EEE9] text-muted"}`}>{statusText[booking.status] || booking.status}</span></div>
    {booking.status === "pending" && <p className="mt-4 text-sm text-muted">Tempat usaha akan merespons dalam 24 jam atau sebelum batas waktu permintaan.</p>}
    {booking.status === "accepted" && <p className="mt-4 text-sm text-muted">Datang sesuai jadwal ke {booking.businesses?.address}.</p>}
    {canCancel && <button disabled={pending} type="button" onClick={() => { if (!window.confirm("Batalkan permintaan booking ini?")) return; startTransition(async () => { const result = await changeBookingStatus({ bookingId: booking.id, action: "cancel_customer" }); onMessage(result.ok ? "Booking dibatalkan." : result.error); if (result.ok) router.refresh(); }); }} className="mt-4 text-sm font-bold text-accentText underline">Batalkan booking</button>}
    {booking.status === "accepted" && !canCancel && <p className="mt-4 text-sm font-bold text-accentText">{timeUntilStart > 0 ? "Kurang dari 12 jam menuju jadwal." : "Jadwal telah dimulai."} Hubungi tempat usaha di {booking.businesses?.contact_phone || "nomor pada profil toko"} untuk perubahan.</p>}
    {booking.status === "completed" && !reviewDone && <form onSubmit={event => { event.preventDefault(); startTransition(async () => { const result = await submitReview({ bookingId: booking.id, rating, body }); if (result.ok) setReviewDone(true); onMessage(result.ok ? "Terima kasih, ulasanmu sudah tampil." : result.error); }); }} className="mt-5 border-t border-[#EBDCD3] pt-5"><h3 className="flex items-center gap-2 font-extrabold"><Star size={17} /> Beri ulasan terverifikasi</h3><div className="mt-3 flex flex-wrap gap-3"><label className="text-sm font-bold">Nilai <select value={rating} onChange={event => setRating(Number(event.target.value))} className="ml-2 rounded-xl border px-3 py-2">{[5,4,3,2,1].map(item => <option key={item} value={item}>{item} / 5</option>)}</select></label><input value={body} onChange={event => setBody(event.target.value)} placeholder="Ceritakan pengalamanmu (opsional)" className="field flex-1" /></div><button disabled={pending} className="btn-primary mt-3 text-sm" type="submit">Kirim ulasan</button></form>}
  </article>;
}
