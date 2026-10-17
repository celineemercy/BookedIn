import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock3, MapPin, Star } from "lucide-react";
import type { LiveBusiness } from "@/lib/live-types";
import { formatJakartaDateTime } from "@/lib/scheduling";
import { rupiah } from "@/lib/data";
import { FavoriteButton } from "./FavoriteButton";

export function LiveBusinessCard({ business, distance, saved = false, signedIn = false }: { business: LiveBusiness; distance?: number; saved?: boolean; signedIn?: boolean }) {
  const service = [...(business.services || [])].filter(item => item.active).sort((a, b) => a.price_idr - b.price_idr)[0];
  return <article className="group overflow-hidden rounded-[24px] border border-[#E2E8F2] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
    <div className="relative h-52 bg-[#E9EEFF]">{business.cover_url ? <Image src={business.cover_url} alt={`Foto ${business.name}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" /> : <div className="flex h-full items-center justify-center text-5xl">✳</div>}
      <span className="absolute left-4 top-4 rounded-full bg-paper px-3 py-1.5 text-xs font-bold text-cobalt">{business.category}</span>
      <div className="absolute right-4 top-4"><FavoriteButton businessId={business.id} initial={saved} signedIn={signedIn} /></div>
    </div>
    <Link href={`/business/${business.slug}`} className="block p-5"><div className="flex items-start justify-between gap-3"><h3 className="text-xl font-extrabold leading-snug">{business.name}</h3><ArrowUpRight size={20} className="shrink-0 text-cobalt" /></div>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted"><MapPin size={15} />{business.area}{distance !== undefined && <span> · ±{distance.toFixed(1)} km garis lurus</span>}</p>
      {service && <div className="mt-4 rounded-xl bg-[#F4F6FF] p-3"><strong className="block text-sm">{service.name}</strong><span className="mt-1 block text-xs text-muted">{service.duration_minutes} menit · {rupiah(service.price_idr)}</span></div>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm"><span className="flex items-center gap-1.5 font-semibold text-cobalt"><Clock3 size={15} />{business.next_available ? formatJakartaDateTime(business.next_available) : "Belum ada jadwal"}</span><span className="flex items-center gap-1 font-bold">{business.rating ? <><Star size={15} fill="#F6B946" stroke="#F6B946" />{business.rating.toFixed(1)} <small className="font-normal text-muted">({business.review_count})</small></> : <span className="rounded-full bg-[#FFF0E8] px-2.5 py-1 text-xs text-accentText">Baru di BookedIn</span>}</span></div>
    </Link>
  </article>;
}
