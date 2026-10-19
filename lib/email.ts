import "server-only";
import { Resend } from "resend";
import { createSupabaseAdminClient } from "./supabase/admin";
import { formatJakartaDateTime } from "./scheduling";

type OutboxRow = { id: string; booking_id: string; recipient_email: string; event: string; attempts: number };

export async function processEmailOutbox() {
  const admin = createSupabaseAdminClient();
  const key = process.env.RESEND_API_KEY;
  const sender = process.env.EMAIL_FROM;
  if (!admin || !key || !sender) return { sent: 0, error: "Email belum dikonfigurasi." };
  const resend = new Resend(key);
  const { data, error } = await admin.rpc("claim_email_batch", { p_limit: 20 });
  if (error) return { sent: 0, error: error.message };
  let sent = 0;
  for (const item of (data || []) as OutboxRow[]) {
    try {
      const { data: booking, error: bookingError } = await admin.from("bookings").select("service_name, starts_at, status, businesses(name, address)").eq("id", item.booking_id).single();
      if (bookingError || !booking) throw bookingError || new Error("Booking tidak ditemukan");
      const business = booking.businesses as unknown as { name: string; address: string };
      const audience = item.event.startsWith("seller_") ? "Pemilik usaha" : "Pelanggan";
      const state = item.event.replace(/^(seller|customer)_/, "");
      const labels: Record<string, string> = {
        pending: "Menunggu konfirmasi", accepted: "Dikonfirmasi", declined: "Ditolak",
        expired: "Kedaluwarsa", cancelled_by_customer: "Dibatalkan pelanggan",
        cancelled_by_seller: "Dibatalkan tempat usaha", completed: "Selesai",
      };
      const subject = `BookedIn: ${labels[state] || state} — ${business.name}`;
      const message = `${audience}, status permintaan untuk ${booking.service_name} di ${business.name} pada ${formatJakartaDateTime(booking.starts_at)} adalah ${labels[state] || state}. Lokasi: ${business.address}. Lihat status terbaru di ${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/account.`;
      const result = await resend.emails.send({ from: sender, to: item.recipient_email, subject, text: message }, { idempotencyKey: item.id });
      if (result.error) throw new Error(result.error.message);
      await admin.from("email_outbox").update({ sent_at: new Date().toISOString(), claimed_until: null, last_error: null }).eq("id", item.id);
      sent++;
    } catch (sendError) {
      const attempts = item.attempts + 1;
      const delayMinutes = Math.min(60, 2 ** Math.min(attempts, 6));
      await admin.from("email_outbox").update({ attempts, claimed_until: null, next_attempt_at: new Date(Date.now() + delayMinutes * 60_000).toISOString(), last_error: sendError instanceof Error ? sendError.message.slice(0, 500) : "Unknown email error" }).eq("id", item.id);
    }
  }
  return { sent, claimed: (data || []).length };
}
