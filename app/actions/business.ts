"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CATEGORIES } from "@/lib/live-types";
import { requireAdmin, requireBusinessOwner, requireIdentity } from "@/lib/permissions";
import type { ActionResponse } from "./booking";

const basicsSchema = z.object({
  businessId: z.string().uuid().optional(), name: z.string().trim().min(3).max(70),
  category: z.enum([CATEGORIES[0], CATEGORIES[1], CATEGORIES[2], CATEGORIES[3]]), area: z.string().trim().min(3).max(80),
  address: z.string().trim().min(8).max(250), description: z.string().trim().min(20).max(1000),
  contactPhone: z.string().trim().regex(/^[+\d\s()-]{8,25}$/),
  lat: z.number().min(-6.5).max(-5.9), lng: z.number().min(106.5).max(107.2),
});

export async function saveBusinessBasics(input: z.infer<typeof basicsSchema>): Promise<ActionResponse> {
  try {
    const value = basicsSchema.parse(input);
    const { user, admin } = await requireIdentity();
    if (value.businessId) {
      const { business } = await requireBusinessOwner(value.businessId);
      const status = business.status === "published" ? "pending_review" : business.status;
      const { error } = await admin.from("businesses").update({
        name: value.name, category: value.category, area: value.area, address: value.address,
        description: value.description, contact_phone: value.contactPhone, lat: value.lat, lng: value.lng, status,
        rejection_reason: null, updated_at: new Date().toISOString(),
      }).eq("id", value.businessId);
      if (error) throw error;
      revalidatePath("/seller/dashboard"); revalidatePath("/explore");
      return { ok: true, id: value.businessId };
    }
    const suffix = crypto.randomUUID().slice(0, 8);
    const slug = `${value.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${suffix}`;
    const { data, error } = await admin.from("businesses").insert({
      owner_id: user.id, slug, name: value.name, category: value.category, area: value.area,
      address: value.address, description: value.description, contact_phone: value.contactPhone, lat: value.lat, lng: value.lng,
    }).select("id").single();
    if (error || !data) throw error || new Error("Toko gagal dibuat.");
    const hours = Array.from({ length: 7 }, (_, day) => ({ business_id: data.id, day_of_week: day, opens_at: day === 0 ? null : "09:00", closes_at: day === 0 ? null : "18:00" }));
    await admin.from("weekly_hours").insert(hours);
    revalidatePath("/seller/dashboard");
    return { ok: true, id: data.id };
  } catch (error) { return { ok: false, error: error instanceof z.ZodError ? "Periksa nama, alamat, deskripsi, dan pin lokasi." : error instanceof Error ? error.message : "Toko gagal disimpan." }; }
}

export async function saveService(input: { businessId: string; serviceId?: string; name: string; priceIdr: number; durationMinutes: number; active?: boolean }): Promise<ActionResponse> {
  try {
    const { admin } = await requireBusinessOwner(input.businessId);
    const name = input.name.trim();
    if (!name || name.length > 100 || !Number.isInteger(input.priceIdr) || input.priceIdr < 1000 || !Number.isInteger(input.durationMinutes) || input.durationMinutes < 15 || input.durationMinutes > 480 || input.durationMinutes % 15 !== 0) return { ok: false, error: "Periksa nama, harga, dan durasi layanan." };
    const payload = { name, price_idr: input.priceIdr, duration_minutes: input.durationMinutes, active: input.active ?? true };
    const result = input.serviceId
      ? await admin.from("services").update(payload).eq("id", input.serviceId).eq("business_id", input.businessId).select("id").single()
      : await admin.from("services").insert({ ...payload, business_id: input.businessId }).select("id").single();
    if (result.error || !result.data) throw result.error || new Error("Layanan tidak ditemukan.");
    revalidatePath("/seller/dashboard"); revalidatePath("/explore");
    return { ok: true, id: result.data.id };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Layanan gagal disimpan." }; }
}

export async function saveWeeklyHours(businessId: string, hours: { day: number; open: string | null; close: string | null }[]): Promise<ActionResponse> {
  try {
    const { admin } = await requireBusinessOwner(businessId);
    if (hours.length !== 7 || new Set(hours.map(item => item.day)).size !== 7 || hours.some(item => item.day < 0 || item.day > 6 || ((item.open === null) !== (item.close === null)) || (item.open !== null && (!/^\d{2}:\d{2}$/.test(item.open) || !/^\d{2}:\d{2}$/.test(item.close || "") || item.open >= (item.close || ""))))) return { ok: false, error: "Jam buka tidak valid." };
    const { data: accepted } = await admin.from("bookings").select("starts_at, ends_at").eq("business_id", businessId).in("status", ["pending", "accepted"]).gte("starts_at", new Date().toISOString());
    for (const booking of accepted || []) {
      const start = new Date(booking.starts_at);
      const end = new Date(booking.ends_at);
      const day = new Date(start.getTime() + 7 * 60 * 60_000).getUTCDay();
      const rule = hours.find(item => item.day === day);
      const startTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(start);
      const endTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(end);
      if (!rule?.open || !rule.close || startTime < rule.open || endTime > rule.close) return { ok: false, error: "Jam baru bertabrakan dengan booking aktif." };
    }
    const { error } = await admin.from("weekly_hours").upsert(hours.map(item => ({ business_id: businessId, day_of_week: item.day, opens_at: item.open, closes_at: item.close })), { onConflict: "business_id,day_of_week" });
    if (error) throw error;
    revalidatePath("/seller/dashboard"); revalidatePath("/explore");
    return { ok: true };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Jam buka gagal disimpan." }; }
}

export async function setDateClosure(businessId: string, date: string, closed: boolean): Promise<ActionResponse> {
  try {
    const { admin } = await requireBusinessOwner(businessId);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: "Tanggal tidak valid." };
    if (closed) {
      const start = `${date}T00:00:00+07:00`;
      const end = `${date}T23:59:59+07:00`;
      const { count } = await admin.from("bookings").select("id", { count: "exact", head: true }).eq("business_id", businessId).in("status", ["pending", "accepted"]).gte("starts_at", new Date(start).toISOString()).lte("starts_at", new Date(end).toISOString());
      if (count) return { ok: false, error: "Selesaikan booking aktif sebelum menutup tanggal ini." };
      const { error } = await admin.from("date_blocks").upsert({ business_id: businessId, blocked_date: date }, { onConflict: "business_id,blocked_date" });
      if (error) throw error;
    } else {
      const { error } = await admin.from("date_blocks").delete().eq("business_id", businessId).eq("blocked_date", date);
      if (error) throw error;
    }
    revalidatePath("/seller/dashboard");
    return { ok: true };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Tanggal gagal diubah." }; }
}

export async function uploadBusinessPhoto(businessId: string, formData: FormData): Promise<ActionResponse> {
  try {
    const { admin, business } = await requireBusinessOwner(businessId);
    const file = formData.get("photo");
    if (!(file instanceof File) || file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) return { ok: false, error: "Pilih JPG, PNG, atau WebP maksimal 5 MB." };
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${businessId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await admin.storage.from("business-images").upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    const { data } = admin.storage.from("business-images").getPublicUrl(path);
    const { error: saveError } = await admin.from("businesses").update({ cover_url: data.publicUrl, status: business.status === "published" ? "pending_review" : business.status, updated_at: new Date().toISOString() }).eq("id", businessId);
    if (saveError) throw saveError;
    revalidatePath("/seller/dashboard");
    return { ok: true };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Foto gagal diunggah." }; }
}

export async function submitBusinessForReview(businessId: string): Promise<ActionResponse> {
  try {
    const { admin } = await requireBusinessOwner(businessId);
    const [{ data: business }, { count: services }, { count: hours }] = await Promise.all([
      admin.from("businesses").select("cover_url").eq("id", businessId).single(),
      admin.from("services").select("id", { count: "exact", head: true }).eq("business_id", businessId).eq("active", true),
      admin.from("weekly_hours").select("business_id", { count: "exact", head: true }).eq("business_id", businessId).not("opens_at", "is", null),
    ]);
    if (!business?.cover_url || !services || !hours) return { ok: false, error: "Lengkapi foto, layanan, dan jam buka sebelum mengirim." };
    const { error } = await admin.from("businesses").update({ status: "pending_review", rejection_reason: null, updated_at: new Date().toISOString() }).eq("id", businessId);
    if (error) throw error;
    revalidatePath("/seller/dashboard"); revalidatePath("/admin");
    return { ok: true };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Pengajuan gagal dikirim." }; }
}

export async function moderateBusiness(businessId: string, decision: "approve" | "reject", reason?: string): Promise<ActionResponse> {
  try {
    const { admin } = await requireAdmin();
    if (decision === "reject" && !reason?.trim()) return { ok: false, error: "Isi alasan penolakan." };
    const { data, error } = await admin.from("businesses").update({ status: decision === "approve" ? "published" : "rejected", rejection_reason: decision === "reject" ? reason?.trim() : null, updated_at: new Date().toISOString() }).eq("id", businessId).eq("status", "pending_review").select("id").single();
    if (error || !data) return { ok: false, error: "Pengajuan sudah berubah atau tidak ditemukan." };
    revalidatePath("/admin"); revalidatePath("/explore"); revalidatePath("/");
    return { ok: true };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Gagal meninjau toko." }; }
}
