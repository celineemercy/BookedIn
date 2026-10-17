"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const next = String(formData.get("next") || "/account");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/login?error=email");
  const client = await createSupabaseServerClient();
  if (!client) redirect("/login?error=setup");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await client.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(safeNext)}` },
  });
  if (error) redirect("/login?error=send");
  redirect("/login?sent=1");
}

export async function signOut() {
  const client = await createSupabaseServerClient();
  await client?.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
