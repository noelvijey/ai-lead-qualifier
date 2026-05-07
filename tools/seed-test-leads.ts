/**
 * Runs a batch of diverse agency leads through the qualify-lead task.
 * Useful for prompt tuning — run this after changing the qualification prompt.
 * Requires the backend worker to be running: cd backend && npx trigger dev
 */
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

import { configure, tasks, runs } from "@trigger.dev/sdk/v3";

const TRIGGER_SECRET_KEY = process.env.TRIGGER_SECRET_KEY;
if (!TRIGGER_SECRET_KEY) {
  throw new Error("TRIGGER_SECRET_KEY is not set in backend/.env");
}

configure({ secretKey: TRIGGER_SECRET_KEY });

const testLeads = [
  {
    label: "HOT — Strong agency fit, decision-maker, clear budget",
    lead: {
      companyName: "NovaTech Solutions",
      contactName: "Marcus Webb",
      contactEmail: "m.webb@novatech.io",
      industry: "SaaS",
      projectType: "AI integration",
      projectDescription: "Add AI-powered support ticket routing to our existing CRM. We have the data, need the intelligence layer built.",
      estimatedBudget: "$20,000–$30,000",
      decisionTimeline: "This month",
      projectDurationEstimate: "6–8 weeks",
      decisionMakerAccess: true,
      stakeholderCount: 1,
      painPoints: "Support team spending 40% of time routing tickets manually. 200+ tickets/day.",
      currentSolution: "HubSpot with manual routing rules",
      desiredOutcome: "80% of tickets auto-routed correctly.",
      previousAgencyExperience: true,
      leadSource: "Inbound form",
    },
  },
  {
    label: "WARM — Good fit but influencer only, longer timeline",
    lead: {
      companyName: "RetailEdge Co",
      contactName: "Priya Sharma",
      contactEmail: "priya@retailedge.com",
      industry: "Retail",
      projectType: "Web app build",
      projectDescription: "Custom inventory tracking app to replace our Excel-based system.",
      estimatedBudget: "$10,000–$20,000",
      decisionTimeline: "Next quarter",
      projectDurationEstimate: "3–4 months",
      decisionMakerAccess: false,
      stakeholderCount: 4,
      painPoints: "Excel sheets break constantly, no real-time visibility.",
      currentSolution: "Excel + email",
      desiredOutcome: "Real-time inventory dashboard accessible on mobile.",
      previousAgencyExperience: false,
      leadSource: "LinkedIn",
    },
  },
  {
    label: "COLD — Budget mismatch, vague scope, just exploring",
    lead: {
      companyName: "StartupIdea LLC",
      contactName: "Jake Morris",
      contactEmail: "jake@startupidea.com",
      industry: "Unknown",
      projectType: "Consulting",
      projectDescription: "I have an app idea, not sure what to build yet.",
      estimatedBudget: "Under $5,000",
      decisionTimeline: "Just exploring",
      projectDurationEstimate: "Unknown",
      decisionMakerAccess: true,
      stakeholderCount: 1,
      painPoints: "Don't know how to start building my idea.",
      currentSolution: "Nothing",
      desiredOutcome: "A successful app",
      previousAgencyExperience: false,
      leadSource: "Cold outreach",
    },
  },
  {
    label: "DISQUALIFY — Out of scope (hardware)",
    lead: {
      companyName: "HardwarePlus",
      contactName: "Tom Briggs",
      contactEmail: "tom@hardwareplus.com",
      industry: "Manufacturing",
      projectType: "Other",
      projectDescription: "Need a physical IoT sensor device designed and manufactured for our factory floor.",
      estimatedBudget: "Unknown",
      decisionTimeline: "6–12 months",
      projectDurationEstimate: "1 year+",
      decisionMakerAccess: false,
      stakeholderCount: 8,
      painPoints: "Factory sensors are outdated.",
      currentSolution: "Legacy hardware from 2010",
      desiredOutcome: "New physical sensor devices installed across 5 factories.",
      previousAgencyExperience: false,
      leadSource: "Trade show",
    },
  },
];

async function main() {
  console.log(`Running ${testLeads.length} test leads...\n`);

  const results: Array<{ label: string; score?: number; grade?: string; nextAction?: string; error?: string }> = [];

  for (const { label, lead } of testLeads) {
    process.stdout.write(`  Triggering: ${label}... `);

    try {
      const handle = await tasks.trigger("qualify-lead", lead);
      const result = await runs.poll(handle.id, { pollIntervalMs: 2000 });

      if (result.status === "COMPLETED" && result.output) {
        const output = result.output as any;
        console.log(`Score: ${output.score} (${output.grade})`);
        results.push({ label, score: output.score, grade: output.grade, nextAction: output.nextAction });
      } else {
        console.log(`FAILED (${result.status})`);
        results.push({ label, error: result.status });
      }
    } catch (err: any) {
      console.log("ERROR");
      results.push({ label, error: err.message });
    }
  }

  console.log("\n=== Summary ===");
  for (const r of results) {
    if (r.error) {
      console.log(`  [ERROR] ${r.label}: ${r.error}`);
    } else {
      console.log(`  [${r.grade}] ${r.score}/100 — ${r.label}`);
      console.log(`         Next: ${r.nextAction}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
