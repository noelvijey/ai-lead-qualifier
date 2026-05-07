import { createClient } from "@/lib/supabase/server";

export type Plan = "free" | "pro";

export interface SubscriptionInfo {
  plan: Plan;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
}

const FREE_FALLBACK: SubscriptionInfo = {
  plan: "free",
  status: "inactive",
  cancelAtPeriodEnd: false,
  currentPeriodEnd: null,
};

export async function getUserSubscription(userId: string): Promise<SubscriptionInfo> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan, status, cancel_at_period_end, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return FREE_FALLBACK;

  return {
    plan: data.plan as Plan,
    status: data.status as string,
    cancelAtPeriodEnd: data.cancel_at_period_end as boolean,
    currentPeriodEnd: data.current_period_end
      ? new Date(data.current_period_end as string)
      : null,
  };
}

export async function getTodayUsageCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("lead_results")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", todayStart.toISOString());

  if (error) return 0; // fail open — don't block user on transient DB error
  return count ?? 0;
}
