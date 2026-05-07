# Lead Qualification Logic

How the AI scores and grades agency leads.

---

## Scoring Framework

Leads are scored 0–100 using two weighted frameworks:

| Framework | Weight | What it measures |
|---|---|---|
| BANT | 50% | Budget, Authority, Need, Timeline |
| Agency ICP Fit | 50% | Project fit, scope clarity, complexity match |

### BANT Breakdown (50 points total)

| Signal | Max points | Strong signal | Weak signal |
|---|---|---|---|
| Budget clarity | 15 | Specific dollar range stated | "Unknown" or refuses to share |
| Budget reality | 5 | Range matches project complexity | Budget is too low for stated scope |
| Authority | 15 | Talking to the contract signer | Influencer only; "need to check with boss" |
| Need urgency | 10 | Specific, painful problem with business impact | Vague exploration; "just curious" |
| Timeline | 5 | Starting this month or next | "Someday", "no rush", just exploring |

### Agency ICP Fit Breakdown (50 points total)

| Signal | Max points | Strong signal | Weak signal |
|---|---|---|---|
| Project type fit | 20 | Matches our service offering | Out of scope (e.g. hardware, physical product) |
| Scope clarity | 15 | Well-defined requirements or clear goal | "I don't know what I need yet" |
| Previous agency experience | 5 | Has worked with agencies before | First time; may have unrealistic expectations |
| Stakeholder count | 5 | 1–2 decision-makers | Committee of 5+; long approval chains |
| Desired outcome clarity | 5 | Clear measurable success criteria | "I'll know it when I see it" |

---

## Grading Thresholds

| Grade | Score range | Meaning |
|---|---|---|
| A | 80–100 | Hot lead — strong fit, fast close likely. Prioritize immediately. |
| B | 60–79 | Good lead — worth nurturing, some gaps to address. |
| C | 40–59 | Marginal — proceed carefully, significant qualification gaps. |
| D | 20–39 | Weak lead — invest minimal time; re-qualify if situation changes. |
| F | 0–19 | Disqualify — not a fit. Politely close the loop. |

---

## AI Prompt Design

The prompt sent to Claude is structured as follows. Edit `backend/src/tasks/qualify-lead.ts` to change it.

```
You are an expert sales qualification specialist for a digital agency. 
Your job is to analyze inbound leads and score them on their likelihood 
to become a successful client engagement.

Evaluate the following lead using the BANT framework (Budget, Authority, 
Need, Timeline) combined with Agency ICP fit criteria (project type fit, 
scope clarity, stakeholder count, previous agency experience).

Score the lead from 0 to 100, where:
- 80–100 = Excellent fit, high close probability
- 60–79  = Good fit, worth pursuing with nurturing
- 40–59  = Marginal fit, proceed with caution
- 20–39  = Weak fit, low priority
- 0–19   = Disqualify

Lead Information:
[LEAD DATA AS JSON]

Respond ONLY with valid JSON matching this exact structure:
{
  "score": <number 0-100>,
  "grade": "<A|B|C|D|F>",
  "summary": "<2-4 sentence summary of lead quality and key factors>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "concerns": ["<concern 1>", "<concern 2>", ...],
  "nextAction": "<specific recommended next step for the sales rep>",
  "disqualified": <true|false>,
  "disqualifyReason": "<reason if disqualified, otherwise omit this field>"
}
```

**Important constraints for the AI prompt:**
- Always request JSON-only output to make parsing deterministic.
- Include the full lead data inline so the model has complete context.
- Keep the prompt under 2,000 tokens to minimize latency.

---

## Prompt Tuning

When tuning the prompt, test with `tools/seed-test-leads.ts` which runs a batch of diverse leads and prints all scores. A well-tuned prompt should produce:

- Agency-fit leads: A or B grades
- Budget mismatch leads: C or D grades
- Out-of-scope leads: D or F grades (often disqualified)
- Vague exploratory leads: C grades (not disqualified — they may develop)
