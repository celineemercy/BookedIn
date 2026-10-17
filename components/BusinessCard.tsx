import Link from "next/link";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import { Business } from "@/lib/types";
import { rupiah } from "@/lib/data";

export function BusinessCard({ business, distance }: { business: Business; distance?: number }) {
  const min = Math.min(...business.services.map(service => service.price));
  return <Link href={`/business/${business.slug}`} className="group overflow-hidden rounded-[26px] border border-[#e9e9e1] bg-white transition hover:-translate-y-1 hover:shadow-soft">
    <div className="relative h-56 overflow-hidden bg-peach"><img src={business.image} alt={`Suasana ${business.name}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold">{business.category}</span></div>
    <div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="text-xl font-bold">{business.name}</h3><ArrowUpRight size={20} className="shrink-0 text-coral" /></div>
      <div className="mt-2 flex items-center gap-1 text-sm text-muted"><MapPin size={14} />{business.area}{distance !== undefined && <span> · {distance < 1 ? distance.toFixed(1) : distance.toFixed(1)} km</span>}</div>
      <div className="mt-5 flex items-end justify-between border-t border-[#eff0e9] pt-4"><div><span className="text-xs text-muted">Mulai dari</span><p className="font-bold text-forest">{rupiah(min)}</p></div><div className="flex items-center gap-1 text-sm font-bold"><Star size={15} className="fill-[#E9AD5C] text-[#E9AD5C]" />{business.rating.toFixed(1)} <span className="font-normal text-muted">({business.reviewCount})</span></div></div>
    </div>
  </Link>;
}
