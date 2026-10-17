import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/live-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LiveBooking, LiveBusiness, LiveService } from "@/lib/live-types";
import type { DateBlock, WeeklyHour } from "@/lib/scheduling";
import DashboardView from "./view";
import { serverNowMs } from "@/lib/server-time";

export default async function SellerDashboard({ searchParams }: { searchParams: Promise<{ shop?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/seller/dashboard");
  const client = await createSupabaseServerClient();
  const { data: shops } = await client!.from("businesses").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
  const businesses = (shops || []) as LiveBusiness[];
  const { shop } = await searchParams;
  const selected = businesses.find(item => item.id === shop) || businesses[0];
  if (!selected) return <main className="container-page min-h-[65vh] py-16"><p className="eyebrow">Dashboard usaha</p><h1 className="mt-2 text-3xl font-extrabold">Belum ada toko</h1><p className="mt-3 text-muted">Daftarkan tempat pertamamu untuk mulai menerima permintaan booking.</p><a href="/seller/start" className="btn-primary mt-6">Daftarkan usaha</a></main>;
  const [services, hours, blocks, bookings] = await Promise.all([
    client!.from("services").select("*").eq("business_id", selected.id).order("created_at"),
    client!.from("weekly_hours").select("*").eq("business_id", selected.id),
    client!.from("date_blocks").select("*").eq("business_id", selected.id).gte("blocked_date", new Date().toISOString().slice(0, 10)),
    client!.from("bookings").select("*").eq("business_id", selected.id).order("starts_at", { ascending: true }),
  ]);
  return <DashboardView shops={businesses} business={selected} services={(services.data || []) as LiveService[]} hours={(hours.data || []) as WeeklyHour[]} blocks={(blocks.data || []) as DateBlock[]} bookings={(bookings.data || []) as LiveBooking[]} nowMs={await serverNowMs()} />;
}
