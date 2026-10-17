import Link from "next/link";
import { ArrowRight, CalendarCheck2, MapPin, Search, Scissors, Sparkles, Hand, Flower2 } from "lucide-react";
import { getPublicBusinesses } from "@/lib/live-data";
import { CATEGORIES, JAKARTA_AREAS } from "@/lib/live-types";
import { LiveBusinessCard } from "@/components/LiveBusinessCard";

const icons = [Scissors, Sparkles, Hand, Flower2];

export default async function Home() {
  const businesses = await getPublicBusinesses();
  const featured = [...businesses].sort((a, b) => (a.next_available || "z").localeCompare(b.next_available || "z")).slice(0, 3);
  return <main>
    <section className="overflow-hidden bg-[#E9EEFF]"><div className="container-page grid gap-8 py-12 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-20">
      <div><span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-cobalt"><span className="h-2 w-2 rounded-full bg-tangerine" />Jasa pilihan di Jakarta</span>
        <h1 className="mt-7 max-w-2xl text-[clamp(2.8rem,5.8vw,5.3rem)] font-extrabold leading-[1.04] tracking-[-.055em]">Cari tempatnya.<br /><span className="text-cobalt">Pilih waktunya.</span></h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-muted md:text-lg">Salon, barbershop, nail studio, dan spa dalam satu tempat. Bandingkan layanan dan harga, lalu ajukan jadwal langsung ke pemilik usaha.</p>
        <form action="/explore" className="mt-8 grid gap-3 rounded-[22px] bg-white p-3 shadow-soft sm:grid-cols-[1fr_180px_auto] sm:items-center">
          <label className="flex items-center gap-3 rounded-xl px-3"><Search size={19} className="text-cobalt" /><span className="sr-only">Cari layanan atau tempat</span><input name="q" placeholder="Cari haircut, nail art, spa..." className="w-full py-3 outline-none" /></label>
          <label className="flex items-center gap-2 rounded-xl border-t border-[#E7EAF3] px-3 sm:border-l sm:border-t-0"><MapPin size={18} className="text-cobalt" /><span className="sr-only">Pilih area</span><select name="area" className="w-full bg-transparent py-3 text-sm font-bold outline-none"><option value="">Semua Jakarta</option>{JAKARTA_AREAS.map(area => <option key={area.name} value={area.name}>{area.name}</option>)}</select></label>
          <button className="btn-primary" type="submit">Cari tempat <ArrowRight size={17} /></button>
        </form>
        <p className="mt-4 text-sm text-muted">Booking dikirim sebagai permintaan. Tempat usaha akan mengonfirmasinya.</p>
      </div>
      <div aria-hidden="true" className="relative hidden h-[460px] lg:block"><div className="absolute inset-8 rotate-6 rounded-[48px] bg-cobalt" /><div className="absolute inset-0 -rotate-3 rounded-[48px] bg-tangerine" /><div className="absolute inset-8 flex flex-col justify-between rounded-[38px] bg-paper p-10 shadow-soft"><span className="text-7xl font-extrabold tracking-tighter text-cobalt">BOOK<br />YOUR<br /><span className="text-tangerine">MOMENT.</span></span><div className="flex items-center gap-3 rounded-2xl bg-[#E9EEFF] p-4"><CalendarCheck2 className="text-cobalt" /><div><strong className="block">Rencanakan waktumu</strong><small className="text-muted">Tanpa chat panjang untuk cari slot</small></div></div></div></div>
    </div></section>

    <section className="container-page py-14 md:py-20"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Mulai dari sini</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight">Lagi cari apa?</h2></div><Link href="/explore" className="inline-flex items-center gap-2 font-bold text-cobalt">Semua tempat <ArrowRight size={18} /></Link></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{CATEGORIES.map((category, index) => { const Icon = icons[index]; return <Link key={category} href={`/explore?category=${encodeURIComponent(category)}`} className="group flex min-h-40 flex-col justify-between rounded-[22px] border border-[#E2E8F2] bg-white p-5 transition hover:-translate-y-1 hover:border-cobalt hover:shadow-soft"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E9EEFF] text-cobalt group-hover:bg-cobalt group-hover:text-white"><Icon size={23} /></span><span className="flex items-center justify-between text-lg font-extrabold">{category}<ArrowRight size={17} className="text-tangerine" /></span></Link>; })}</div></section>

    <section className="bg-[#F1F4FB] py-14 md:py-20"><div className="container-page"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Bisa kamu jelajahi</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight">Tempat dengan jadwal terdekat</h2></div><Link href="/explore" className="font-bold text-cobalt">Lihat katalog →</Link></div>
      {featured.length ? <div className="grid gap-5 md:grid-cols-3">{featured.map(business => <LiveBusinessCard key={business.id} business={business} />)}</div> : <div className="rounded-[24px] border border-dashed border-[#AAB9DB] bg-white p-8"><h3 className="text-xl font-extrabold">Tempat terverifikasi segera hadir.</h3><p className="mt-2 max-w-xl text-muted">Kami sedang meninjau usaha pertama di BookedIn. Kamu bisa mencoba alurnya melalui katalog demo tanpa membuat janji sungguhan.</p><Link href="/demo" className="btn-outline mt-5">Jelajahi demo <ArrowRight size={17} /></Link></div>}
    </div></section>

    <section className="container-page py-14 md:py-20"><div className="grid gap-8 overflow-hidden rounded-[30px] bg-cobalt p-8 text-white md:grid-cols-[1fr_auto] md:items-center md:p-12"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#FFD0BD]">Untuk pemilik usaha</p><h2 className="mt-3 max-w-xl text-3xl font-extrabold tracking-tight md:text-4xl">Usahamu layak ditemukan lebih banyak orang.</h2><p className="mt-4 max-w-xl leading-7 text-white/80">Tampilkan layanan, atur ketersediaan, dan tanggapi permintaan booking dari satu dashboard.</p></div><Link href="/seller/start" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-cobalt">Daftarkan usaha <ArrowRight size={18} /></Link></div></section>
  </main>;
}
