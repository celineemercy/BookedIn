import Link from "next/link";
import { getBusinessAvailability, getCurrentUser, getPublicBusinessBySlug } from "@/lib/live-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import BookingView from "./view";

export default async function BookingPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ service?: string }> }) {
  const { slug } = await params;
  const { service } = await searchParams;
  const [business, user] = await Promise.all([getPublicBusinessBySlug(slug), getCurrentUser()]);
  if (!business) return <main className="container-page min-h-[60vh] py-20"><h1 className="text-3xl font-extrabold">Tempat tidak tersedia</h1><Link href="/explore" className="btn-outline mt-6">Kembali ke katalog</Link></main>;
  const availability = await getBusinessAvailability(business.id);
  const client = await createSupabaseServerClient();
  const profile = user && client ? await client.from("profiles").select("display_name, phone").eq("id", user.id).single() : null;
  return <BookingView business={business} availability={availability} initialService={service || ""} signedIn={!!user} profile={profile?.data || null} />;
}
