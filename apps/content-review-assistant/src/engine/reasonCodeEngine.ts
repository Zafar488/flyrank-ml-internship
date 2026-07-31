// ─── Deterministic Reason-Code Engine ───
// Rule precedence is mandatory. Rules are evaluated in strict order 0–6 + fallback.
import type { PageInput, ReasonCodeResult } from '../types/agent';
import { calculateCTR } from './derivedMetrics';
import { REASON_CODE_DEFINITIONS } from '../data/reasonCodes';

function makeResult(code: keyof typeof REASON_CODE_DEFINITIONS): ReasonCodeResult {
  const def = REASON_CODE_DEFINITIONS[code];
  return {
    code: def.code,
    action: def.action,
    ruleIndex: def.ruleIndex,
    description: def.description,
    descriptionUr: def.descriptionUr,
    conciseExplanation: def.conciseExplanation,
    conciseExplanationUr: def.conciseExplanationUr,
  };
}

export function evaluateReasonCode(input: PageInput): ReasonCodeResult {
  const ctr = calculateCTR(input.clicks, input.impressions);
  const { impressions, averagePosition, positionVolatility, modelRiskScore, availableDays } = input;

  // RULE 0: Outside validated population
  if (impressions < 500 || availableDays < 5 || averagePosition > 20) {
    return makeResult('OUTSIDE_VALIDATED_POPULATION');
  }

  // RULE 1: CTR gap at high visibility
  if (
    modelRiskScore >= 0.50 &&
    averagePosition > 3 &&
    averagePosition <= 10 &&
    ctr < 0.003 &&
    impressions >= 500
  ) {
    return makeResult('CTR_GAP_HIGH_VISIBILITY');
  }

  // RULE 2: High-value Page 2
  if (
    modelRiskScore >= 0.50 &&
    averagePosition > 10 &&
    averagePosition <= 20 &&
    impressions >= 500
  ) {
    return makeResult('HIGH_VALUE_PAGE_2');
  }

  // RULE 3: High risk with high volatility
  if (modelRiskScore >= 0.50 && positionVolatility >= 5) {
    return makeResult('HIGH_RISK_HIGH_VOLATILITY');
  }

  // RULE 4: High risk on stable Page 1
  if (
    modelRiskScore >= 0.50 &&
    averagePosition > 3 &&
    averagePosition <= 10 &&
    positionVolatility < 5
  ) {
    return makeResult('HIGH_RISK_STABLE_PAGE_1');
  }

  // RULE 5: Low risk with high visibility
  if (modelRiskScore < 0.35 && impressions >= 2000) {
    return makeResult('LOW_RISK_HIGH_VISIBILITY');
  }

  // RULE 6: Borderline measured risk
  if (modelRiskScore >= 0.35 && modelRiskScore < 0.50) {
    return makeResult('BORDERLINE_MEASURED_RISK');
  }

  // FALLBACK
  return makeResult('HIGH_RISK_NO_CLEAR_ARCHETYPE');
}
