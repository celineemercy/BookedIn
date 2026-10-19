import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/live-data";
import SellerStartView from "./view";

export const dynamic = "force-dynamic";

export default async function SellerStartPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/seller/start");
  return <SellerStartView />;
}
