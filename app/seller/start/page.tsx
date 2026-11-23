import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/live-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SellerStartView from "./view";

export const dynamic = "force-dynamic";

export default async function SellerStartPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/seller/start");
  const client = await createSupabaseServerClient();
  const { data: business } = await client!.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
  if (business) redirect("/seller/dashboard");
  return <SellerStartView />;
}
