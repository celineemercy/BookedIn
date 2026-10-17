import { Suspense } from "react";
import { getCurrentUser, getPublicBusinesses } from "@/lib/live-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ExploreView from "./view";

export default async function ExplorePage() {
  const [businesses, user] = await Promise.all([getPublicBusinesses(), getCurrentUser()]);
  const client = await createSupabaseServerClient();
  const favoriteResult = user && client ? await client.from("favorites").select("business_id").eq("customer_id", user.id) : null;
  const favorites = (favoriteResult?.data || []).map(item => item.business_id);
  return <Suspense fallback={<main className="container-page min-h-[65vh] py-20">Memuat katalog...</main>}><ExploreView businesses={businesses} favorites={favorites} signedIn={!!user} /></Suspense>;
}
