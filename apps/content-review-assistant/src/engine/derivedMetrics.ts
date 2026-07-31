// ─── Derived Metrics Engine ───
import type {
  PageInput,
  DerivedMetrics,
  PositionBand,
  VisibilityLevel,
  CTRCategory,
  VolatilityLevel,
  RiskLevel,
  StudyScopeStatus,
} from '../types/agent';
import { getScopeWarnings } from './validation';

export function calculateCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return clicks / impressions;
}

export function getPositionBand(position: number): PositionBand {
  if (position > 0 && position <= 3) return 'Top 3';
  if (position > 3 && position <= 10) return 'Page 1';
  if (position > 10 && position <= 20) return 'Page 2';
  return 'Deep visibility';
}

export function getVisibilityLevel(impressions: number): VisibilityLevel {
  if (impressions < 500) return 'Low';
  if (impressions < 2000) return 'Moderate';
  if (impressions < 10000) return 'High';
  return 'Very high';
}

export function getCTRCategory(ctr: number): CTRCategory {
  if (ctr === 0) return 'Zero observed CTR';
  if (ctr < 0.001) return 'Very low observed CTR';
  if (ctr < 0.003) return 'Low observed CTR';
  if (ctr < 0.01) return 'Moderate observed CTR';
  return 'Higher observed CTR';
}

export function getVolatilityLevel(volatility: number): VolatilityLevel {
  if (volatility < 1) return 'Stable';
  if (volatility < 5) return 'Moderate';
  if (volatility < 10) return 'High';
  return 'Very high';
}

export function getRiskLevel(score: number): RiskLevel {
  if (score < 0.35) return 'Low';
  if (score < 0.50) return 'Moderate';
  if (score < 0.70) return 'High';
  return 'Critical review priority';
}

export function getStudyScopeStatus(input: PageInput): StudyScopeStatus {
  const warnings = getScopeWarnings(input);
  return warnings.length > 0 ? 'Outside validated population' : 'Within validated population';
}

export function computeDerivedMetrics(input: PageInput): DerivedMetrics {
  const ctr = calculateCTR(input.clicks, input.impressions);
  const scopeWarnings = getScopeWarnings(input);

  return {
    ctr,
    positionBand: getPositionBand(input.averagePosition),
    visibilityLevel: getVisibilityLevel(input.impressions),
    ctrCategory: getCTRCategory(ctr),
    volatilityLevel: getVolatilityLevel(input.positionVolatility),
    riskLevel: getRiskLevel(input.modelRiskScore),
    studyScopeStatus: scopeWarnings.length > 0
      ? 'Outside validated population'
      : 'Within validated population',
    scopeWarnings: scopeWarnings.map(w => w.message),
  };
}
