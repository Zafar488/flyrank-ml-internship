// ─── Reason Code Definitions ───
import type { ReasonCode, RecommendedAction } from '../types/agent';

export interface ReasonCodeDefinition {
  code: ReasonCode;
  action: RecommendedAction;
  ruleIndex: number;
  title: string;
  description: string;
  descriptionUr: string;
  conciseExplanation: string;
  conciseExplanationUr: string;
}

export const REASON_CODE_DEFINITIONS: Record<ReasonCode, ReasonCodeDefinition> = {
  OUTSIDE_VALIDATED_POPULATION: {
    code: 'OUTSIDE_VALIDATED_POPULATION',
    action: 'Manual Review',
    ruleIndex: 0,
    title: 'Outside Validated Population',
    description:
      'This input is outside the validated analytical population boundaries (impressions < 500, available days < 5, or position > 20). Manual expert review is required before interpreting results.',
    descriptionUr:
      'Yeh input validated analytical population se bahar hai (impressions < 500, available days < 5, ya position > 20). Nateejay samajhne se pehle manual expert review zaroori hai.',
    conciseExplanation:
      'Outside validated analytical dataset limits. Requires manual expert review.',
    conciseExplanationUr:
      'Validated analytical dataset ki hudood se bahar hai. Expert manual review zaroori hai.',
  },
  CTR_GAP_HIGH_VISIBILITY: {
    code: 'CTR_GAP_HIGH_VISIBILITY',
    action: 'CTR Review',
    ruleIndex: 1,
    title: 'CTR Gap at High Visibility',
    description:
      'High model risk with Page 1 visibility (positions 4–10) and zero or relatively weak observed CTR (< 0.3%). A human should review title, description, query intent, SERP features, tracking consistency, and competing results before deciding whether any change is appropriate.',
    descriptionUr:
      'Page 1 visibility (positions 4-10) par high model risk aur kam CTR (< 0.3%) hai. Human reviewer ko title, description, query intent, aur SERP features ka jaiza lena chahiye.',
    conciseExplanation:
      'Meaningful Page-1 visibility with zero or relatively weak observed CTR.',
    conciseExplanationUr:
      'Meaningful Page-1 visibility par zero ya kam CTR observed hai.',
  },
  HIGH_VALUE_PAGE_2: {
    code: 'HIGH_VALUE_PAGE_2',
    action: 'Expand and Optimise',
    ruleIndex: 2,
    title: 'High-Value Page 2',
    description:
      'High model risk score on Page 2 (positions 11–20). A human should review content depth and SERP alignment before deciding whether optimization is appropriate.',
    descriptionUr:
      'Page 2 (positions 11-20) par high model risk score hai. Human reviewer ko content depth aur SERP alignment ka jaiza lena chahiye.',
    conciseExplanation:
      'High-risk Page 2 content near the Page 1 visibility threshold.',
    conciseExplanationUr:
      'Page 1 threshold ke qareeb high-risk Page 2 content hai.',
  },
  HIGH_RISK_HIGH_VOLATILITY: {
    code: 'HIGH_RISK_HIGH_VOLATILITY',
    action: 'Refresh Review',
    ruleIndex: 3,
    title: 'High Risk with High Volatility',
    description:
      'High model risk score combined with position volatility (>= 5). Unstable search rankings warrant human review of content relevance.',
    descriptionUr:
      'High model risk score aur position volatility (>= 5) ik इकट्ठे hain. Unstable rankings ke liye content refresh ka jaiza lein.',
    conciseExplanation:
      'Elevated risk score paired with significant search ranking instability.',
    conciseExplanationUr:
      'High risk score ke saath search ranking mein instability hai.',
  },
  HIGH_RISK_STABLE_PAGE_1: {
    code: 'HIGH_RISK_STABLE_PAGE_1',
    action: 'Refresh and Protect',
    ruleIndex: 4,
    title: 'High Risk on Stable Page 1',
    description:
      'High model risk score on a stable Page 1 ranking. Human review is advised to evaluate proactive refresh options.',
    descriptionUr:
      'Stable Page 1 ranking par high model risk score hai. Proactive content refresh ke liye human review zaroori hai.',
    conciseExplanation:
      'Stable Page 1 position requiring proactive refresh to protect traffic.',
    conciseExplanationUr:
      'Traffic ko mehfooz rakhne ke liye stable Page 1 position par refresh zaroori hai.',
  },
  LOW_RISK_HIGH_VISIBILITY: {
    code: 'LOW_RISK_HIGH_VISIBILITY',
    action: 'Protect',
    ruleIndex: 5,
    title: 'Low Risk with High Visibility',
    description:
      'Low model risk score (< 0.35) and high search visibility. Maintain existing content structure without unnecessary changes.',
    descriptionUr:
      'Kam model risk score (< 0.35) aur high visibility hai. Mojooda content ko bina ziada tabdeeli ke barqarar rakhein.',
    conciseExplanation:
      'Low measured risk with strong organic visibility. Protect current state.',
    conciseExplanationUr:
      'Ziyada organic visibility ke saath kam risk hai. Current state barqarar rakhein.',
  },
  BORDERLINE_MEASURED_RISK: {
    code: 'BORDERLINE_MEASURED_RISK',
    action: 'Monitor',
    ruleIndex: 6,
    title: 'Borderline Measured Risk',
    description:
      'Borderline model risk score (0.35–0.50). Signals are inconclusive; ongoing monitoring is recommended before taking intervention.',
    descriptionUr:
      'Borderline model risk score (0.35-0.50) hai. Action lene se pehle continuous monitoring ki sifarish ki jati hai.',
    conciseExplanation:
      'Moderate/borderline risk level. Monitor performance before editing.',
    conciseExplanationUr:
      'Borderline risk level. Content edit karne se pehle monitor karein.',
  },
  HIGH_RISK_NO_CLEAR_ARCHETYPE: {
    code: 'HIGH_RISK_NO_CLEAR_ARCHETYPE',
    action: 'Manual Review',
    ruleIndex: 7,
    title: 'High Risk — No Clear Archetype',
    description:
      'High model risk score without fitting specific rule archetypes. Detailed manual inspection is required.',
    descriptionUr:
      'High model risk score hai lekin koi specific archetype match nahi hota. Tafseeli manual review zaroori hai.',
    conciseExplanation:
      'High risk detected without fitting standard rule archetypes.',
    conciseExplanationUr:
      'High risk detect hua hai lekin standard rule archetype fit nahi hota.',
  },
};
