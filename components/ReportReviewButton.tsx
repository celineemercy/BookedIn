"use client";

import { useState, useTransition } from "react";
import { reportReview } from "@/app/actions/account";

export function ReportReviewButton({ reviewId, signedIn }: { reviewId: string; signedIn: boolean }) {
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  if (!signedIn) return null;
  return <button type="button" disabled={pending || done} onClick={() => {
    const reason = window.prompt("Mengapa ulasan ini perlu ditinjau?");
    if (!reason) return;
    startTransition(async () => { const result = await reportReview(reviewId, reason); if (result.ok) setDone(true); });
  }} className="text-xs font-semibold text-muted underline underline-offset-2 hover:text-cobalt">{done ? "Dilaporkan" : "Laporkan"}</button>;
}
