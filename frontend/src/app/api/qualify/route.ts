import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { createClient } from "@/lib/supabase/server";
import type { LeadInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const lead: LeadInput = await req.json();

    // tasks.trigger auto-reads TRIGGER_SECRET_KEY from env
    const handle = await tasks.trigger("qualify-lead", lead);

    return NextResponse.json({ runId: handle.id });
  } catch (err: any) {
    console.error("[/api/qualify] Error:", err.message);
    return NextResponse.json(
      { error: "Failed to trigger qualification" },
      { status: 500 }
    );
  }
}
