import { task, logger } from "@trigger.dev/sdk/v3";
import { getAnthropic } from "../lib/anthropic";
import { parseQualificationResult, fallbackResult } from "../lib/scorer";
import { LeadInputSchema, LeadInput, QualificationResult } from "../lib/schema";

const SYSTEM_PROMPT = `You are an expert sales qualification specialist for a digital agency that builds custom web applications, AI integrations, and software solutions for businesses.

Your job is to analyze inbound leads and score them on their likelihood to become a successful, profitable client engagement.

Evaluate the lead using the BANT framework (Budget, Authority, Need, Timeline) combined with Agency ICP fit criteria:
- Project type fit: Does this match a typical agency service offering (web apps, AI, automation, custom software)?
- Scope clarity: Is the project well-defined enough to quote and deliver?
- Budget reality: Does the stated budget match the project complexity?
- Previous agency experience: Experienced clients have realistic expectations.
- Stakeholder count: Fewer decision-makers = faster close.

Score the lead from 0 to 100:
- 80-100: Excellent fit, high close probability. Prioritize immediately.
- 60-79: Good fit, worth pursuing with some nurturing.
- 40-59: Marginal fit, proceed with caution.
- 20-39: Weak fit, low priority.
- 0-19: Disqualify. Not a fit for the agency.

Respond ONLY with a valid JSON object. No preamble, no explanation, no markdown code fences.`;

function buildUserPrompt(lead: LeadInput): string {
  return `Qualify this agency lead and respond with JSON only:

${JSON.stringify(lead, null, 2)}

Required JSON structure:
{
  "score": <number 0-100>,
  "grade": "<A|B|C|D|F>",
  "summary": "<2-4 sentence summary of lead quality and key factors>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "concerns": ["<concern 1>", "<concern 2>"],
  "nextAction": "<specific recommended next step for the sales rep>",
  "disqualified": <true|false>,
  "disqualifyReason": "<reason if disqualified — omit this field if not disqualified>"
}`;
}

export const qualifyLead = task({
  id: "qualify-lead",
  maxDuration: 120,
  run: async (payload: LeadInput): Promise<QualificationResult> => {
    const lead = LeadInputSchema.parse(payload);
    logger.log("Qualifying lead", { company: lead.companyName, contact: lead.contactName });

    try {
      const response = await getAnthropic().messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(lead) }],
      });

      const rawText = response.content[0].type === "text" ? response.content[0].text : "";
      logger.log("Raw AI response received", { length: rawText.length });

      const result = parseQualificationResult(rawText);
      logger.log("Lead qualified", { score: result.score, grade: result.grade });

      return result;
    } catch (err: any) {
      logger.error("Qualification failed", { error: err.message });
      return fallbackResult(err.message ?? "Unknown error");
    }
  },
});
