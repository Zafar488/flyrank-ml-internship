// ─── Example Inputs ───
import type { PageInput } from '../types/agent';

export const EXAMPLE_INPUT: PageInput = {
  pageReference: 'Example Guide A',
  impressions: 943,
  clicks: 0,
  averagePosition: 8.38,
  positionVolatility: 11.92,
  activeDays: 15,
  availableDays: 15,
  modelRiskScore: 0.743,
  baselineScore: 72,
  contentContext: 'Guide or tutorial',
  businessImportance: 'Medium',
  reviewerNotes: '',
  outputLanguage: 'en',
};

export const EXAMPLE_EXPECTED = {
  reasonCode: 'CTR_GAP_HIGH_VISIBILITY' as const,
  action: 'CTR Review' as const,
  riskLevel: 'Critical review priority' as const,
  humanReview: 'Required',
};
