import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { LeadInput, QualificationResult } from "@/lib/types";

interface SaveResultBody {
  leadInput: LeadInput;
  qualificationResult: QualificationResult;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: SaveResultBody = await req.json();
    const { leadInput, qualificationResult } = body;

    const { error } = await supabase.from("lead_results").insert({
      user_id: user.id,
      company_name: leadInput.companyName,
      contact_name: leadInput.contactName || null,
      lead_input: leadInput,
      qualification_result: qualificationResult,
      score: qualificationResult.score,
      grade: qualificationResult.grade,
    });

    if (error) {
      console.error("[/api/results] Supabase insert error:", error.message);
      return NextResponse.json({ error: "Failed to save result" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/results] Error:", message);
    return NextResponse.json({ error: "Failed to save result" }, { status: 500 });
  }
}
