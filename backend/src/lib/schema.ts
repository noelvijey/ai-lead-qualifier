import { z } from "zod";

export const LeadInputSchema = z.object({
  // Identity
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  industry: z.string().min(1),

  // Project Scope
  projectType: z.string().min(1),
  projectDescription: z.string().min(10),
  estimatedBudget: z.string().min(1),
  decisionTimeline: z.string().min(1),
  projectDurationEstimate: z.string().min(1),

  // Authority
  decisionMakerAccess: z.boolean(),
  stakeholderCount: z.number().int().min(1),

  // Pain & Fit
  painPoints: z.string().min(1),
  currentSolution: z.string().min(1),
  desiredOutcome: z.string().min(1),
  previousAgencyExperience: z.boolean(),

  // Lead Source
  leadSource: z.string().min(1),
  notes: z.string().optional(),
});

export const QualificationResultSchema = z.object({
  score: z.number().int().min(0).max(100),
  grade: z.enum(["A", "B", "C", "D", "F"]),
  summary: z.string(),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  nextAction: z.string(),
  disqualified: z.boolean(),
  disqualifyReason: z.string().optional(),
});

export type LeadInput = z.infer<typeof LeadInputSchema>;
export type QualificationResult = z.infer<typeof QualificationResultSchema>;
