"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, Store } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { areas, categories } from "@/lib/data";
import { Business, Category } from "@/lib/types";

const categoryImages: Record<Category, string> = {
  Salon: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=85",
  Barbershop: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=85",
  "Nail Studio": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=85",
  Spa: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=85"
};

export default function SellerStart() {
  const router = useRouter();
  const { saveBusiness, setSellerId } = useApp();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Salon");
  const [area, setArea] = useState(areas[0].name);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const selectedArea = areas.find(item => item.name === area)!;
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const id = crypto.randomUUID();
    const slug = `${name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${id.slice(0, 6)}`;
    const business: Business = {
      id, slug, name: name.trim(), category, area, address: address.trim(), description: description.trim(),
      lat: selectedArea.lat, lng: selectedArea.lng, image: categoryImages[category], rating: 5, reviewCount: 0,
      services: [{ id: crypto.randomUUID(), name: serviceName.trim(), price: Number(price), duration: Number(duration) }],
      openingTime: "09:00", closingTime: "18:00", ownerCreated: true
    };
    saveBusiness(business); setSellerId(id); router.push("/seller/dashboard");
  };

  return <main className="container-page grid gap-12 py-12 lg:grid-cols-[.85fr_1.15fr] lg:py-20"><div className="lg:sticky lg:top-32 lg:h-fit"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-peach text-coral"><Store size={28} /></div><p className="eyebrow mt-8">MULAI DARI SINI</p><h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight md:text-5xl">Buka toko dan mulai ditemukan.</h1><p className="mt-5 max-w-md leading-8 text-muted">Ceritakan sedikit tentang usahamu. Profilmu akan langsung muncul di katalog prototipe ini.</p><div className="mt-9 space-y-4 text-sm"><p className="flex items-center gap-3"><Check size={18} className="text-coral" /> Tampilkan layanan dan harga</p><p className="flex items-center gap-3"><Check size={18} className="text-coral" /> Terima booking dalam dashboard</p><p className="flex items-center gap-3"><Check size={18} className="text-coral" /> Atur profil dan jam buka kapan saja</p></div><Link href="/seller/dashboard" className="mt-9 inline-block text-sm font-semibold text-forest underline underline-offset-4">Lihat dashboard demo</Link></div>
    <form onSubmit={submit} className="card space-y-7 p-6 md:p-9"><div><h2 className="text-2xl font-bold">Tentang usahamu</h2><p className="mt-2 text-sm text-muted">Isi informasi dasar untuk membuat etalase pertama.</p></div><div><label htmlFor="business-name" className="label">Nama usaha</label><input id="business-name" className="field" value={name} onChange={event => setName(event.target.value)} placeholder="Contoh: Studio Cantik Pagi" required maxLength={70} /></div><div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="category" className="label">Kategori</label><select id="category" className="field" value={category} onChange={event => setCategory(event.target.value as Category)}>{categories.map(item => <option key={item}>{item}</option>)}</select></div><div><label htmlFor="area" className="label">Area</label><select id="area" className="field" value={area} onChange={event => setArea(event.target.value)}>{areas.map(item => <option key={item.name}>{item.name}</option>)}</select></div></div><div><label htmlFor="address" className="label">Alamat lengkap</label><input id="address" className="field" value={address} onChange={event => setAddress(event.target.value)} placeholder="Jalan, nomor, dan area" required /></div><div><label htmlFor="description" className="label">Cerita singkat tentang usaha</label><textarea id="description" className="field min-h-28" value={description} onChange={event => setDescription(event.target.value)} placeholder="Apa yang membuat tempatmu spesial?" required /></div><div className="border-t border-[#e9ebe3] pt-7"><h2 className="text-xl font-bold">Layanan pertamamu</h2><p className="mt-2 text-sm text-muted">Kamu bisa menambah layanan lain di dashboard.</p></div><div><label htmlFor="service-name" className="label">Nama layanan</label><input id="service-name" className="field" value={serviceName} onChange={event => setServiceName(event.target.value)} placeholder="Contoh: Haircut & Styling" required /></div><div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="price" className="label">Harga (Rp)</label><input id="price" type="number" min="1000" className="field" value={price} onChange={event => setPrice(event.target.value)} placeholder="150000" required /></div><div><label htmlFor="duration" className="label">Durasi (menit)</label><input id="duration" type="number" min="15" step="15" className="field" value={duration} onChange={event => setDuration(event.target.value)} required /></div></div><div className="rounded-2xl bg-[#F2F4EE] p-4 text-xs leading-6 text-muted">Foto tempat memakai gambar contoh sesuai kategori. Semua data tersimpan di browser ini sebagai simulasi.</div><button type="submit" className="btn-primary w-full">Buka toko sekarang <ArrowRight size={18} /></button></form>
  </main>;
}
