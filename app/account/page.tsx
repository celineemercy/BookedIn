import { redirect } from "next/navigation";
import { getCurrentUser, getMyBookings, getPublicBusinesses } from "@/lib/live-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AccountView from "./view";
import { serverNowMs } from "@/lib/server-time";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const client = await createSupabaseServerClient();
  const [bookings, businesses, profileResult, favoritesResult, reviewsResult] = await Promise.all([
    getMyBookings(), getPublicBusinesses(), client?.from("profiles").select("display_name, phone, is_admin").eq("id", user.id).single(),
    client?.from("favorites").select("business_id").eq("customer_id", user.id),
    client?.from("reviews").select("booking_id").eq("customer_id", user.id),
  ]);
  const favoriteIds = (favoritesResult?.data || []).map(item => item.business_id);
  return <AccountView email={user.email || ""} profile={profileResult?.data || { display_name: "", phone: null, is_admin: false }} bookings={bookings} favorites={businesses.filter(item => favoriteIds.includes(item.id))} reviewedIds={(reviewsResult?.data || []).map(item => item.booking_id)} nowMs={await serverNowMs()} />;
}
