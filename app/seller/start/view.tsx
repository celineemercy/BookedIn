"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowRight, Check, ImagePlus, MapPin } from "lucide-react";
import { saveBusinessBasics, saveService, saveWeeklyHours, submitBusinessForReview, uploadBusinessPhoto } from "@/app/actions/business";
import { CATEGORIES, JAKARTA_AREAS, type Category } from "@/lib/live-types";
import { rupiah } from "@/lib/data";
import { trackProductEvent } from "@/lib/analytics";

const MapPinPicker = dynamic(() => import("@/components/MapPinPicker").then(module => module.MapPinPicker), { ssr: false });
const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function SellerStartView() {
  useEffect(() => { trackProductEvent("seller_onboarding_started"); }, []);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessId, setBusinessId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Salon");
  const [area, setArea] = useState<string>(JAKARTA_AREAS[0].name);
  const [address, setAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [description, setDescription] = useState("");
  const [point, setPoint] = useState<{ lat: number; lng: number }>({ lat: JAKARTA_AREAS[0].lat, lng: JAKARTA_AREAS[0].lng });
  const [pinTouched, setPinTouched] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [hours, setHours] = useState(days.map((_, day) => ({ day, open: day === 0 ? null : "09:00", close: day === 0 ? null : "18:00" })));
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const basics = (event: React.FormEvent) => { event.preventDefault(); setError(""); if (!pinTouched) { setError("Pilih titik usaha pada peta atau isi koordinat secara manual."); return; } startTransition(async () => {
    const result = await saveBusinessBasics({ businessId: businessId || undefined, name, category, area, address, contactPhone, description, lat: point.lat, lng: point.lng });
    if (result.ok) { setBusinessId(result.id || ""); setStep(2); } else setError(result.error);
  }); };
  const service = (event: React.FormEvent) => { event.preventDefault(); setError(""); startTransition(async () => {
    const result = await saveService({ businessId, name: serviceName, priceIdr: Number(price), durationMinutes: Number(duration) });
    if (result.ok) setStep(3); else setError(result.error);
  }); };
  const finish = (event: React.FormEvent) => { event.preventDefault(); setError(""); startTransition(async () => {
    const savedHours = await saveWeeklyHours(businessId, hours);
    if (!savedHours.ok) { setError(savedHours.error); return; }
    if (photo) { const data = new FormData(); data.set("photo", photo); const uploaded = await uploadBusinessPhoto(businessId, data); if (!uploaded.ok) { setError(uploaded.error); return; } }
    const result = await submitBusinessForReview(businessId);
    if (result.ok) { trackProductEvent("seller_submitted"); router.push(`/seller/dashboard?shop=${businessId}`); } else setError(result.error);
  }); };

  return <main className="container-page py-9 md:py-14"><p className="eyebrow">Untuk pemilik usaha</p><h1 className="mt-2 text-3xl font-extrabold md:text-4xl">Daftarkan tempatmu</h1><p className="mt-3 max-w-2xl text-muted">Lengkapi tiga langkah berikut. Toko akan muncul di katalog setelah ditinjau tim BookedIn.</p><ol className="mt-7 grid grid-cols-3 gap-2 text-xs font-bold sm:max-w-2xl sm:text-sm">{["Info usaha", "Layanan", "Jadwal & preview"].map((item, index) => <li key={item} className={`rounded-xl px-3 py-3 text-center ${step === index + 1 ? "bg-accentText text-white" : step > index + 1 ? "bg-[#E7F6EE] text-[#17643A]" : "bg-[#FFF0E8] text-muted"}`}>{step > index + 1 ? <Check size={14} className="mr-1 inline" /> : null}{item}</li>)}</ol>
    {error && <p role="alert" className="mt-6 rounded-xl bg-[#FFE5DC] p-4 text-sm font-bold text-[#963C25]">{error}</p>}
    {step === 1 && <form onSubmit={basics} className="card mt-7 max-w-3xl space-y-5 p-6 md:p-8"><h2 className="text-xl font-extrabold">1. Tentang usahamu</h2><div><label htmlFor="seller-name" className="label">Nama usaha</label><input id="seller-name" value={name} onChange={event => setName(event.target.value)} required className="field" placeholder="Contoh: Studio Rambut Pagi" /></div><div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="seller-category" className="label">Kategori</label><select id="seller-category" value={category} onChange={event => setCategory(event.target.value as Category)} className="field">{CATEGORIES.map(item => <option key={item}>{item}</option>)}</select></div><div><label htmlFor="seller-area" className="label">Area</label><select id="seller-area" value={area} onChange={event => { const selected = JAKARTA_AREAS.find(item => item.name === event.target.value)!; setArea(selected.name); setPoint({ lat: selected.lat, lng: selected.lng }); setPinTouched(false); }} className="field">{JAKARTA_AREAS.map(item => <option key={item.name}>{item.name}</option>)}</select></div></div><div><label htmlFor="seller-address" className="label">Alamat lengkap</label><input id="seller-address" value={address} onChange={event => setAddress(event.target.value)} required className="field" placeholder="Nama jalan, nomor, kelurahan" /></div><div><label htmlFor="seller-contact" className="label">Nomor kontak tempat usaha</label><input id="seller-contact" value={contactPhone} onChange={event => setContactPhone(event.target.value)} required inputMode="tel" className="field" placeholder="08xxxxxxxxxx" /></div><div><label htmlFor="seller-description" className="label">Ceritakan usahamu</label><textarea id="seller-description" value={description} onChange={event => setDescription(event.target.value)} required minLength={20} className="field min-h-28" placeholder="Layanan dan suasana seperti apa yang bisa pelanggan harapkan?" /></div><div><h3 className="mb-3 flex items-center gap-2 font-bold"><MapPin size={18} className="text-accentText" /> Titik lokasi usaha</h3><MapPinPicker value={point} onChange={value => { setPoint(value); setPinTouched(true); }} /></div><button disabled={pending} type="submit" className="btn-primary">Simpan dan lanjut <ArrowRight size={17} /></button></form>}
    {step === 2 && <form onSubmit={service} className="card mt-7 max-w-3xl space-y-5 p-6 md:p-8"><h2 className="text-xl font-extrabold">2. Layanan pertamamu</h2><p className="text-sm text-muted">Kamu dapat menambah layanan lain dari dashboard setelah toko dibuat.</p><div><label htmlFor="service-name" className="label">Nama layanan</label><input id="service-name" value={serviceName} onChange={event => setServiceName(event.target.value)} required className="field" placeholder="Contoh: Haircut & Styling" /></div><div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="service-price" className="label">Harga (Rp)</label><input id="service-price" type="number" min="1000" value={price} onChange={event => setPrice(event.target.value)} required className="field" /></div><div><label htmlFor="service-duration" className="label">Durasi (menit)</label><input id="service-duration" type="number" min="15" max="480" step="15" value={duration} onChange={event => setDuration(event.target.value)} required className="field" /></div></div><div className="flex gap-3"><button type="button" onClick={() => setStep(1)} className="btn-outline">Kembali</button><button disabled={pending} type="submit" className="btn-primary">Simpan dan lanjut <ArrowRight size={17} /></button></div></form>}
    {step === 3 && <form onSubmit={finish} className="mt-7 grid max-w-5xl gap-6 lg:grid-cols-[1fr_300px]"><div className="card space-y-5 p-6 md:p-8"><h2 className="text-xl font-extrabold">3. Jam buka dan foto</h2><p className="text-sm text-muted">Satu booking pada satu waktu. Slot ditawarkan setiap 15 menit selama layanan muat dalam jam buka.</p><div className="space-y-3">{hours.map(item => <div key={item.day} className="grid grid-cols-[82px_40px_1fr_1fr] items-center gap-2 sm:grid-cols-[100px_90px_1fr_1fr]"><strong className="text-sm">{days[item.day]}</strong><label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={!!item.open} onChange={event => setHours(hours.map(row => row.day === item.day ? { ...row, open: event.target.checked ? "09:00" : null, close: event.target.checked ? "18:00" : null } : row))} /> <span className="hidden sm:inline">Buka</span></label><input aria-label={`Buka ${days[item.day]}`} type="time" step="900" disabled={!item.open} value={item.open || ""} onChange={event => setHours(hours.map(row => row.day === item.day ? { ...row, open: event.target.value } : row))} className="field !min-h-10 !px-2" /><input aria-label={`Tutup ${days[item.day]}`} type="time" step="900" disabled={!item.open} value={item.close || ""} onChange={event => setHours(hours.map(row => row.day === item.day ? { ...row, close: event.target.value } : row))} className="field !min-h-10 !px-2" /></div>)}</div><div><label htmlFor="seller-photo" className="label flex items-center gap-2"><ImagePlus size={17} /> Foto utama tempat (JPG, PNG, WebP · maks. 5 MB)</label><input id="seller-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setPhoto(event.target.files?.[0] || null)} className="block w-full text-sm" required /></div><div className="flex flex-wrap gap-3"><button type="button" onClick={() => setStep(2)} className="btn-outline">Kembali</button><button disabled={pending} type="submit" className="btn-primary">{pending ? "Mengirim..." : "Kirim untuk ditinjau"} <ArrowRight size={17} /></button></div></div><aside className="card h-fit p-6"><p className="eyebrow">Preview toko</p><div className="mt-4 flex h-36 items-center justify-center rounded-2xl bg-[#FFF0E8] text-4xl text-accentText">{photo ? "✓" : "✳"}</div><h3 className="mt-4 text-xl font-extrabold">{name}</h3><p className="mt-1 text-sm text-muted">{category} · {area}</p><p className="mt-4 text-sm">{serviceName} · {duration} menit</p><strong className="text-accentText">{rupiah(Number(price) || 0)}</strong><p className="mt-4 rounded-xl bg-[#FFF0E8] p-3 text-xs leading-5 text-[#963C25]">Status awal: menunggu peninjauan. Toko belum tampil di katalog.</p></aside></form>}
  </main>;
}
