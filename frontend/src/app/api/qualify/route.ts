import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription, getTodayUsageCount } from "@/lib/subscription";
import type { LeadInput } from "@/lib/types";

const FREE_TIER_DAILY_LIMIT = 2;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Plan enforcement
  const subscription = await getUserSubscription(user.id);
  const isPro = subscription.plan === "pro" && subscription.status === "active";

  if (!isPro) {
    const todayCount = await getTodayUsageCount(user.id);
    if (todayCount >= FREE_TIER_DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: "Daily limit reached",
          message: `Free plan allows ${FREE_TIER_DAILY_LIMIT} qualifications per day. Upgrade to Pro for unlimited access.`,
          upgradeUrl: "/pricing",
          limitReached: true,
        },
        { status: 429 }
      );
    }
  }

  try {
    const lead: LeadInput = await req.json();
    const handle = await tasks.trigger("qualify-lead", lead);
    return NextResponse.json({ runId: handle.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/qualify] Error:", message);
    return NextResponse.json(
      { error: "Failed to trigger qualification" },
      { status: 500 }
    );
  }
}
