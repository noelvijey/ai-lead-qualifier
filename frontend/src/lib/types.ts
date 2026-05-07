// Mirror of backend/src/lib/schema.ts — keep in sync manually.
// If you rename a field in the backend schema, update this file too.

export interface LeadInput {
  companyName: string;
  contactName: string;
  contactEmail: string;
  industry: string;
  projectType: string;
  projectDescription: string;
  estimatedBudget: string;
  decisionTimeline: string;
  projectDurationEstimate: string;
  decisionMakerAccess: boolean;
  stakeholderCount: number;
  painPoints: string;
  currentSolution: string;
  desiredOutcome: string;
  previousAgencyExperience: boolean;
  leadSource: string;
  notes?: string;
}

export interface QualificationResult {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  summary: string;
  strengths: string[];
  concerns: string[];
  nextAction: string;
  disqualified: boolean;
  disqualifyReason?: string;
}
