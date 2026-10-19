import { NextResponse, type NextRequest } from "next/server";
import { processEmailOutbox } from "@/lib/email";

async function run(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await processEmailOutbox());
}

export const GET = run;
export const POST = run;
