"use client";

import { useState } from "react";
import type { LeadInput, QualificationResult } from "@/lib/types";

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "running"; runId: string }
  | { status: "done"; result: QualificationResult }
  | { status: "error"; message: string };

const TERMINAL_STATUSES = new Set(["COMPLETED", "FAILED", "CRASHED", "CANCELED", "TIMED_OUT", "SYSTEM_FAILURE"]);
const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 90; // 90 × 2s = 3 minutes max wait

export function useLeadQualification() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function qualify(lead: LeadInput) {
    setState({ status: "submitting" });

    try {
      // Step 1: Trigger the task via the server-side proxy
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 429 && body.limitReached) {
          throw new Error(
            body.message ?? "Daily limit reached. Upgrade to Pro for unlimited access."
          );
        }
        throw new Error(body.error ?? "Failed to start qualification");
      }

      const { runId } = await res.json();
      setState({ status: "running", runId });

      // Step 2: Poll the server-side status endpoint until the run completes
      for (let i = 0; i < MAX_POLLS; i++) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

        const statusRes = await fetch(`/api/run/${runId}`);
        if (!statusRes.ok) continue;

        const { status, output } = await statusRes.json();

        if (!TERMINAL_STATUSES.has(status)) continue;

        if (status === "COMPLETED" && output) {
          const result = output as QualificationResult;
          setState({ status: "done", result });

          // Fire-and-forget: save to history (non-blocking, failure is silent)
          fetch("/api/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leadInput: lead, qualificationResult: result }),
          }).catch((err: unknown) => {
            console.warn("[useLeadQualification] Failed to save result:", err);
          });

          return;
        }

        throw new Error(`Run ended with status: ${status}`);
      }

      throw new Error("Timed out waiting for qualification result");
    } catch (err: any) {
      setState({ status: "error", message: err.message ?? "Unknown error" });
    }
  }

  function reset() {
    setState({ status: "idle" });
  }

  return { state, qualify, reset };
}
