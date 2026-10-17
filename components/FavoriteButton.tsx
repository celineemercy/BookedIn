"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/actions/account";

export function FavoriteButton({ businessId, initial, signedIn }: { businessId: string; initial: boolean; signedIn: boolean }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [pending, startTransition] = useTransition();
  return <button type="button" disabled={pending} aria-label={saved ? "Hapus dari tempat tersimpan" : "Simpan tempat"} aria-pressed={saved} onClick={() => {
    if (!signedIn) { router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`); return; }
    startTransition(async () => { const result = await toggleFavorite(businessId); if (result.ok) setSaved(!saved); });
  }} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-cobalt shadow-sm hover:bg-[#EDF2FF] disabled:opacity-50"><Heart size={18} fill={saved ? "currentColor" : "none"} /></button>;
}
