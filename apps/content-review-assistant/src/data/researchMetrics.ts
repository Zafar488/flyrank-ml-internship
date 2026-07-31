// ─── Validated Research Metrics ───
// Source: FlyRank ML Internship Capstone — Refresh / Content Opportunity Scoring
// These are aggregate-only, public-safe values from the validated research.

export const RESEARCH_METRICS = {
  sourceDailyRecords: 9_841_378,
  uniqueClientPagePairs: 331_437,
  eligibleAnalyticalPages: 34_038,
  eligibleAnonymisedClients: 32,
  trainingPages: 18_075,
  validationPages: 15_963,
  trainingClients: 24,
  validationClients: 8,
  clientOverlap: 0,
  validationPositiveBaseRate: 0.3008,
} as const;

export const MODEL_COMPARISON = {
  frozenBaselinePrecisionAt50: 0.520,
  logisticRegressionPrecisionAt50: 0.640,
  randomForestPrecisionAt50: 0.560,
  selectedModel: 'Logistic Regression' as const,
  selectedModelAveragePrecision: 0.3939,
  selectedModelROCAUC: 0.6175,
} as const;

export const DIAGNOSTIC_METRICS = {
  accuracy: 0.562,
  macroF1: 0.549,
  weightedF1: 0.580,
  decliningClassF1: 0.470,
  nonDecliningClassF1: 0.627,
} as const;

export const LEAKAGE_COMPARISON = {
  honestAveragePrecision: 0.3939,
  leakyAveragePrecision: 0.9999,
} as const;

export const TOP50_RESULTS = {
  proxyPositivePages: 32,
  proxyNegativePages: 18,
} as const;

export const RESEARCH_FRAMING = {
  featureWindow: 'March 1–15, 2026',
  outcomeWindow: 'March 16–31, 2026',
  targetDescription: 'Later-impression decline proxy',
  targetClarification: 'The target is not content quality.',
  designDescription: 'One grouped-client March 2026 validation design',
  primaryMetric: 'Precision@50',
  primaryMetricRationale:
    'Precision@50 is the primary operational metric because the product is a ranked review queue with limited capacity.',
  diagnosticNote:
    'Accuracy and F1-score are diagnostic threshold metrics.',
} as const;

export const PRECISION_CHART_DATA = [
  { name: 'ML-07 Baseline', precision: 0.520 },
  { name: 'Logistic Regression', precision: 0.640 },
  { name: 'Random Forest', precision: 0.560 },
];

export const DIAGNOSTIC_TABLE_DATA = [
  { metric: 'Accuracy', value: 0.562 },
  { metric: 'Macro F1', value: 0.549 },
  { metric: 'Weighted F1', value: 0.580 },
  { metric: 'Declining-class F1', value: 0.470 },
  { metric: 'Non-declining-class F1', value: 0.627 },
];
