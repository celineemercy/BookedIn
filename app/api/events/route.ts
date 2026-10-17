import { NextRequest, NextResponse } from "next/server";
import { PRODUCT_EVENTS } from "@/lib/analytics";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin !== request.nextUrl.origin || Number(request.headers.get("content-length") || 0) > 300) return new NextResponse(null, { status: 403 });
  let body: { event?: string; session?: string };
  try { const raw = await request.text(); if (raw.length > 300) return new NextResponse(null, { status: 413 }); body = JSON.parse(raw); } catch { return new NextResponse(null, { status: 400 }); }
  if (!PRODUCT_EVENTS.includes(body.event as (typeof PRODUCT_EVENTS)[number]) || !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(body.session || "")) return new NextResponse(null, { status: 400 });
  const admin = createSupabaseAdminClient();
  if (!admin) return new NextResponse(null, { status: 204 });
  const { error } = await admin.from("product_events").insert({ event_name: body.event, anonymous_session: body.session });
  return new NextResponse(null, { status: error ? 503 : 204 });
}
