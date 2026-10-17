import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/live-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LiveBusiness, LiveService } from "@/lib/live-types";
import AdminView from "./view";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  const client = await createSupabaseServerClient();
  const { data: profile } = await client!.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return <main className="container-page min-h-[65vh] py-20"><h1 className="text-3xl font-extrabold">Akses admin diperlukan</h1><p className="mt-3 text-muted">Halaman ini hanya untuk tim BookedIn.</p></main>;
  const [businesses, reviews] = await Promise.all([
    client!.from("businesses").select("*, services(*)").eq("status", "pending_review").order("updated_at"),
    client!.from("reviews").select("id, rating, body, report_reason, businesses(name)").not("reported_at", "is", null).order("reported_at"),
  ]);
  return <AdminView businesses={((businesses.data || []) as (LiveBusiness & { services: LiveService[] })[])} reviews={(reviews.data || []) as unknown as { id: string; rating: number; body: string; report_reason: string | null; businesses: { name: string } | null }[]} />;
}
