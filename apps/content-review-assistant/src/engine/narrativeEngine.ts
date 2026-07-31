// ─── Narrative Engine ───
// Generates plain-English and Roman Urdu explanations from deterministic results.
// The optional AI layer (disabled by default) may improve wording only —
// it cannot override the deterministic engine.

import type { PageInput, DerivedMetrics, ReasonCodeResult, ReviewResult } from '../types/agent';
import { computeDerivedMetrics } from './derivedMetrics';
import { evaluateReasonCode } from './reasonCodeEngine';
import { getHumanActions } from './actionEngine';
import { trimInput } from './validation';
import { TRANSLATIONS } from '../data/translations';

function formatPageRefText(ref: string, lang: 'en' | 'ur'): string {
  const trimmed = ref ? ref.trim() : '';
  if (!trimmed) return '';
  return lang === 'ur' ? `Page “${trimmed}” ` : `Page “${trimmed}” `;
}

function buildExplanation(
  input: PageInput,
  derived: DerivedMetrics,
  reasonCode: ReasonCodeResult
): string {
  const parts: string[] = [];
  const pageRefLabel = formatPageRefText(input.pageReference, 'en');

  parts.push(
    `${pageRefLabel}has a model risk score of ${input.modelRiskScore.toFixed(3)}, ` +
    `placing it in the "${derived.riskLevel}" category.`
  );

  parts.push(
    `With ${input.impressions.toLocaleString()} impressions over ${input.activeDays} active days ` +
    `(of ${input.availableDays} available), the page exhibits "${derived.visibilityLevel}" visibility.`
  );

  parts.push(
    `The average position of ${input.averagePosition.toFixed(2)} places this item in the ` +
    `"${derived.positionBand}" band, while position volatility of ${input.positionVolatility.toFixed(2)} ` +
    `is classified as "${derived.volatilityLevel}".`
  );

  const ctrPct = (derived.ctr * 100).toFixed(4);
  parts.push(
    `Observed CTR is ${ctrPct}%, categorized under "${derived.ctrCategory}".`
  );

  parts.push(
    `Rule ${reasonCode.ruleIndex} matched (${reasonCode.code}), triggering recommended action "${reasonCode.action}".`
  );

  parts.push(reasonCode.description);

  if (derived.studyScopeStatus === 'Outside validated population') {
    parts.push(TRANSLATIONS.en.outsideScopeWarning);
  }

  return parts.join(' ');
}

function buildExplanationUr(
  input: PageInput,
  derived: DerivedMetrics,
  reasonCode: ReasonCodeResult
): string {
  const parts: string[] = [];
  const pageRefLabel = formatPageRefText(input.pageReference, 'ur');

  parts.push(
    `${pageRefLabel}ka model risk score ${input.modelRiskScore.toFixed(3)} hai, ` +
    `jo "${derived.riskLevel}" category mein aata hai.`
  );

  parts.push(
    `${input.impressions.toLocaleString()} impressions ke saath ${input.activeDays} active dinon mein ` +
    `(${input.availableDays} available mein se), is page ki visibility "${derived.visibilityLevel}" hai.`
  );

  parts.push(
    `Average position ${input.averagePosition.toFixed(2)} is page ko ` +
    `"${derived.positionBand}" band mein rakhti hai, jabke position volatility ${input.positionVolatility.toFixed(2)} ` +
    `"${derived.volatilityLevel}" classify ki gayi hai.`
  );

  const ctrPct = (derived.ctr * 100).toFixed(4);
  parts.push(
    `Calculate ki gayi CTR ${ctrPct}% hai, jo "${derived.ctrCategory}" categorise ki gayi hai.`
  );

  parts.push(
    `Rule ${reasonCode.ruleIndex} match hua (${reasonCode.code}), jis se tajweez karda action "${reasonCode.action}" banta hai.`
  );

  parts.push(reasonCode.descriptionUr);

  if (derived.studyScopeStatus === 'Outside validated population') {
    parts.push(TRANSLATIONS.ur.outsideScopeWarning);
  }

  return parts.join(' ');
}

export function generateReview(rawInput: PageInput): ReviewResult {
  const input = trimInput(rawInput);
  const derived = computeDerivedMetrics(input);
  const reasonCode = evaluateReasonCode(input);
  const actions = getHumanActions(reasonCode.code);

  return {
    input,
    derived,
    reasonCode,
    actions,
    explanation: buildExplanation(input, derived, reasonCode),
    explanationUr: buildExplanationUr(input, derived, reasonCode),
    confidenceNote: TRANSLATIONS.en.confidenceNote,
    confidenceNoteUr: TRANSLATIONS.ur.confidenceNote,
    responsibleUseWarning: TRANSLATIONS.en.responsibleUseWarning,
    responsibleUseWarningUr: TRANSLATIONS.ur.responsibleUseWarning,
    timestamp: new Date().toISOString(),
  };
}

// Optional AI narrative support — disabled by default
export function isAINarrativeEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_AI_NARRATIVE === 'true';
}

export function getAIEndpoint(): string {
  return import.meta.env.VITE_AI_API_ENDPOINT || '';
}
