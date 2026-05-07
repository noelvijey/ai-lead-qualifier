import { NextRequest, NextResponse } from "next/server";
import { runs } from "@trigger.dev/sdk/v3";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { runId } = await params;
    const run = await runs.retrieve(runId);

    return NextResponse.json({
      status: run.status,
      output: run.output ?? null,
    });
  } catch (err: any) {
    console.error("[/api/run] Error:", err.message);
    return NextResponse.json({ error: "Failed to retrieve run" }, { status: 500 });
  }
}
