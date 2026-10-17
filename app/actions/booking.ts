"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireBusinessOwner, requireIdentity } from "@/lib/permissions";
import { isBookingLaunchReady } from "@/lib/launch";

export type ActionResponse = { ok: true; id?: string } | { ok: false; error: string };

export async function requestBooking(input: { businessId: string; serviceId: string; startsAt: string; customerName: string; customerPhone?: string }): Promise<ActionResponse> {
  try {
    if (!isBookingLaunchReady()) return { ok: false, error: "Booking belum dibuka. Silakan coba lagi nanti." };
    await requireIdentity();
    const client = await createSupabaseServerClient();
    if (!client) return { ok: false, error: "Booking belum tersedia." };
    const { data, error } = await client.rpc("create_booking", {
      p_business_id: input.businessId, p_service_id: input.serviceId, p_starts_at: input.startsAt,
      p_customer_name: input.customerName, p_customer_phone: input.customerPhone || null,
    });
    if (error) return { ok: false, error: error.code === "23P01" ? "Jadwal baru saja terisi. Pilih waktu lain." : error.message };
    revalidatePath("/account");
    revalidatePath("/seller/dashboard");
    return { ok: true, id: String(data) };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Gagal membuat permintaan." }; }
}

export async function changeBookingStatus(input: { bookingId: string; action: "accept" | "decline" | "cancel_customer" | "cancel_seller" | "complete"; reason?: string }): Promise<ActionResponse> {
  try {
    const { user, admin } = await requireIdentity();
    const { data: booking } = await admin.from("bookings").select("id, business_id, customer_id, status, starts_at, ends_at, expires_at").eq("id", input.bookingId).single();
    if (!booking) return { ok: false, error: "Booking tidak ditemukan." };
    const sellerAction = input.action === "accept" || input.action === "decline" || input.action === "cancel_seller" || input.action === "complete";
    if (sellerAction) await requireBusinessOwner(booking.business_id);
    else if (booking.customer_id !== user.id) return { ok: false, error: "Booking ini bukan milikmu." };
    const now = Date.now();
    const start = new Date(booking.starts_at).getTime();
    let status: string;
    let expected: string;
    if (input.action === "accept" || input.action === "decline") {
      if (booking.status !== "pending" || new Date(booking.expires_at).getTime() <= now) return { ok: false, error: "Permintaan ini sudah tidak berlaku." };
      status = input.action === "accept" ? "accepted" : "declined"; expected = "pending";
    } else if (input.action === "cancel_customer") {
      if (booking.status !== "pending" && booking.status !== "accepted") return { ok: false, error: "Booking tidak dapat dibatalkan." };
      if (start <= now) return { ok: false, error: "Jadwal sudah dimulai. Hubungi tempat usaha." };
      if (booking.status === "accepted" && start - now < 12 * 60 * 60_000) return { ok: false, error: "Hubungi tempat usaha untuk pembatalan kurang dari 12 jam." };
      status = "cancelled_by_customer"; expected = booking.status;
    } else if (input.action === "cancel_seller") {
      if (booking.status !== "accepted" || !input.reason?.trim()) return { ok: false, error: "Isi alasan pembatalan." };
      status = "cancelled_by_seller"; expected = "accepted";
    } else {
      if (booking.status !== "accepted" || new Date(booking.ends_at).getTime() > now) return { ok: false, error: "Booking belum dapat ditandai selesai." };
      status = "completed"; expected = "accepted";
    }
    const { data, error } = await admin.from("bookings").update({ status, cancellation_reason: input.reason?.trim() || null, updated_at: new Date().toISOString() }).eq("id", booking.id).eq("status", expected).select("id").single();
    if (error || !data) return { ok: false, error: "Status berubah. Muat ulang lalu coba lagi." };
    revalidatePath("/account"); revalidatePath("/seller/dashboard");
    return { ok: true };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Gagal mengubah booking." }; }
}
