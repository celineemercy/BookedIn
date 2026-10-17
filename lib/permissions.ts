import "server-only";
import { createSupabaseAdminClient } from "./supabase/admin";
import { getCurrentUser } from "./live-data";

export async function requireIdentity() {
  const user = await getCurrentUser();
  const admin = createSupabaseAdminClient();
  if (!user || !admin) throw new Error("Masuk ke akun untuk melanjutkan.");
  return { user, admin };
}

export async function requireAdmin() {
  const identity = await requireIdentity();
  const { data } = await identity.admin.from("profiles").select("is_admin").eq("id", identity.user.id).single();
  if (!data?.is_admin) throw new Error("Akses admin diperlukan.");
  return identity;
}

export async function requireBusinessOwner(businessId: string) {
  const identity = await requireIdentity();
  const { data } = await identity.admin.from("businesses").select("id, owner_id, status, gallery_urls").eq("id", businessId).single();
  if (!data || data.owner_id !== identity.user.id) throw new Error("Toko tidak ditemukan untuk akun ini.");
  return { ...identity, business: data };
}
