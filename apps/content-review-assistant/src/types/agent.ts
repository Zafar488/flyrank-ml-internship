// ─── Core Types for FlyRank Content Review Assistant ───

export type OutputLanguage = 'en' | 'ur';

export type ContentContext =
  | 'Blog post'
  | 'Product page'
  | 'Landing page'
  | 'Guide or tutorial'
  | 'News or editorial'
  | 'Category page'
  | 'FAQ or help'
  | 'Other';

export type BusinessImportance = 'Low' | 'Medium' | 'High' | 'Critical';

export interface PageInput {
  pageReference: string;
  impressions: number;
  clicks: number;
  averagePosition: number;
  positionVolatility: number;
  activeDays: number;
  availableDays: number;
  modelRiskScore: number;
  baselineScore: number | null;
  contentContext: ContentContext;
  businessImportance: BusinessImportance;
  reviewerNotes: string;
  outputLanguage: OutputLanguage;
}

export type PositionBand = 'Top 3' | 'Page 1' | 'Page 2' | 'Deep visibility';

export type VisibilityLevel = 'Low' | 'Moderate' | 'High' | 'Very high';

export type CTRCategory =
  | 'Zero observed CTR'
  | 'Very low observed CTR'
  | 'Low observed CTR'
  | 'Moderate observed CTR'
  | 'Higher observed CTR';

export type VolatilityLevel = 'Stable' | 'Moderate' | 'High' | 'Very high';

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical review priority';

export type StudyScopeStatus = 'Within validated population' | 'Outside validated population';

export interface DerivedMetrics {
  ctr: number;
  positionBand: PositionBand;
  visibilityLevel: VisibilityLevel;
  ctrCategory: CTRCategory;
  volatilityLevel: VolatilityLevel;
  riskLevel: RiskLevel;
  studyScopeStatus: StudyScopeStatus;
  scopeWarnings: string[];
}

export type ReasonCode =
  | 'OUTSIDE_VALIDATED_POPULATION'
  | 'CTR_GAP_HIGH_VISIBILITY'
  | 'HIGH_VALUE_PAGE_2'
  | 'HIGH_RISK_HIGH_VOLATILITY'
  | 'HIGH_RISK_STABLE_PAGE_1'
  | 'LOW_RISK_HIGH_VISIBILITY'
  | 'BORDERLINE_MEASURED_RISK'
  | 'HIGH_RISK_NO_CLEAR_ARCHETYPE';

export type RecommendedAction =
  | 'Manual Review'
  | 'CTR Review'
  | 'Expand and Optimise'
  | 'Refresh Review'
  | 'Refresh and Protect'
  | 'Protect'
  | 'Monitor';

export interface ReasonCodeResult {
  code: ReasonCode;
  action: RecommendedAction;
  ruleIndex: number;
  description: string;
  descriptionUr: string;
  conciseExplanation: string;
  conciseExplanationUr: string;
}

export interface HumanAction {
  id: string;
  label: string;
  labelUr: string;
}

export interface ReviewResult {
  input: PageInput;
  derived: DerivedMetrics;
  reasonCode: ReasonCodeResult;
  actions: HumanAction[];
  explanation: string;
  explanationUr: string;
  confidenceNote: string;
  confidenceNoteUr: string;
  responsibleUseWarning: string;
  responsibleUseWarningUr: string;
  timestamp: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ScopeWarning {
  field: string;
  message: string;
}
