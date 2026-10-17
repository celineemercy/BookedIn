"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireIdentity } from "@/lib/permissions";
import type { ActionResponse } from "./booking";
import { canReviewBooking } from "@/lib/booking-policy";

export async function updateProfile(input: { displayName: string; phone?: string }): Promise<ActionResponse> {
  try {
    const { user, admin } = await requireIdentity();
    const name = input.displayName.trim();
    const phone = input.phone?.trim() || null;
    if (name.length < 2 || name.length > 80 || (phone && !/^[+\d\s()-]{8,25}$/.test(phone))) return { ok: false, error: "Periksa nama dan nomor telepon." };
    const { error } = await admin.from("profiles").update({ display_name: name, phone }).eq("id", user.id);
    if (error) throw error;
    revalidatePath("/account");
    return { ok: true };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Profil gagal disimpan." }; }
}

export async function toggleFavorite(businessId: string): Promise<ActionResponse> {
  try {
    const { user, admin } = await requireIdentity();
    const { data: business } = await admin.from("businesses").select("id").eq("id", businessId).eq("status", "published").single();
    if (!business) return { ok: false, error: "Toko tidak tersedia." };
    const { data: current } = await admin.from("favorites").select("business_id").eq("customer_id", user.id).eq("business_id", businessId).maybeSingle();
    const result = current
      ? await admin.from("favorites").delete().eq("customer_id", user.id).eq("business_id", businessId)
      : await admin.from("favorites").insert({ customer_id: user.id, business_id: businessId });
    if (result.error) throw result.error;
    revalidatePath("/account"); revalidatePath("/explore");
    return { ok: true };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Favorit gagal diubah." }; }
}

export async function submitReview(input: { bookingId: string; rating: number; body: string }): Promise<ActionResponse> {
  try {
    const { user, admin } = await requireIdentity();
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5 || input.body.trim().length > 1500) return { ok: false, error: "Ulasan tidak valid." };
    const { data: booking } = await admin.from("bookings").select("business_id, customer_id, status").eq("id", input.bookingId).single();
    if (!booking || !canReviewBooking(booking.status, booking.customer_id, user.id)) return { ok: false, error: "Ulasan hanya tersedia untuk kunjungan selesai." };
    const { error } = await admin.from("reviews").insert({ booking_id: input.bookingId, business_id: booking.business_id, customer_id: user.id, rating: input.rating, body: input.body.trim() });
    if (error) return { ok: false, error: error.code === "23505" ? "Kunjungan ini sudah diulas." : error.message };
    revalidatePath("/account"); revalidatePath("/explore");
    return { ok: true };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Ulasan gagal dikirim." }; }
}

export async function reportReview(reviewId: string, reason: string): Promise<ActionResponse> {
  try {
    const { admin } = await requireIdentity();
    if (reason.trim().length < 5) return { ok: false, error: "Jelaskan alasan laporan." };
    const { error } = await admin.from("reviews").update({ reported_at: new Date().toISOString(), report_reason: reason.trim() }).eq("id", reviewId).eq("visible", true);
    if (error) throw error;
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Ulasan gagal dilaporkan." }; }
}

export async function moderateReview(reviewId: string, hide: boolean): Promise<ActionResponse> {
  try {
    const { admin } = await requireAdmin();
    const { error } = await admin.from("reviews").update({ visible: !hide, reported_at: null, report_reason: null }).eq("id", reviewId);
    if (error) throw error;
    revalidatePath("/admin"); revalidatePath("/explore");
    return { ok: true };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Ulasan gagal ditinjau." }; }
}
