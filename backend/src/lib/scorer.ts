import { QualificationResult, QualificationResultSchema } from "./schema";

export function parseQualificationResult(rawText: string): QualificationResult {
  // Strip markdown code fences if Claude added them despite instructions
  const cleaned = rawText
    .replace(/^```json\s*/m, "")
    .replace(/^```\s*/m, "")
    .replace(/```\s*$/m, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  return QualificationResultSchema.parse(parsed);
}

export function fallbackResult(reason: string): QualificationResult {
  return {
    score: 0,
    grade: "F",
    summary: "AI qualification failed. Please review this lead manually.",
    strengths: [],
    concerns: [reason],
    nextAction: "Review manually — AI analysis unavailable",
    disqualified: true,
    disqualifyReason: `AI qualification failed — ${reason}`,
  };
}
