// ─── Human-Review Action Engine ───
import type { ReasonCode, HumanAction } from '../types/agent';

interface ActionDef {
  id: string;
  label: string;
  labelUr: string;
}

const ALL_ACTIONS: ActionDef[] = [
  { id: 'verify-data', label: 'Verify data availability.', labelUr: 'Data ki availability verify karein.' },
  { id: 'check-tracking', label: 'Check tracking changes.', labelUr: 'Tracking ki tabdeeliyan check karein.' },
  { id: 'review-indexing', label: 'Review indexing, canonical, redirects, and rendering.', labelUr: 'Indexing, canonical, redirects, aur rendering ka jaiza lein.' },
  { id: 'review-intent', label: 'Review query intent.', labelUr: 'Query intent ka jaiza lein.' },
  { id: 'review-serp', label: 'Review current SERP features.', labelUr: 'Current SERP features ka jaiza lein.' },
  { id: 'compare-title', label: 'Compare title and description alignment.', labelUr: 'Title aur description ki alignment ka moazna karein.' },
  { id: 'review-topical', label: 'Review topical coverage.', labelUr: 'Topical coverage ka jaiza lein.' },
  { id: 'review-internal-links', label: 'Review internal links.', labelUr: 'Internal links ka jaiza lein.' },
  { id: 'check-seasonality', label: 'Check seasonality.', labelUr: 'Seasonality check karein.' },
  { id: 'check-competitor', label: 'Check competitor movement.', labelUr: 'Competitor movement check karein.' },
  { id: 'preserve-sections', label: 'Preserve successful sections.', labelUr: 'Kamyab sections ko mehfooz rakhein.' },
  { id: 'versioned-plan', label: 'Create a versioned change plan.', labelUr: 'Ek versioned change plan banayein.' },
  { id: 'measurement-window', label: 'Define a measurement window.', labelUr: 'Measurement window define karein.' },
  { id: 'rollback-condition', label: 'Define a rollback condition.', labelUr: 'Rollback condition define karein.' },
  { id: 'escalate-legal', label: 'Escalate legal or compliance-sensitive pages.', labelUr: 'Legal ya compliance-sensitive pages ko escalate karein.' },
  { id: 'monitor-no-edit', label: 'Monitor without editing when evidence is weak.', labelUr: 'Jab evidence kamzor ho to bina edit kiye monitor karein.' },
];

const ACTION_MAP: Record<ReasonCode, string[]> = {
  OUTSIDE_VALIDATED_POPULATION: [
    'verify-data', 'check-tracking', 'review-indexing', 'escalate-legal', 'monitor-no-edit',
  ],
  CTR_GAP_HIGH_VISIBILITY: [
    'verify-data', 'compare-title', 'review-serp', 'review-intent', 'check-competitor', 'measurement-window',
  ],
  HIGH_VALUE_PAGE_2: [
    'verify-data', 'review-topical', 'review-internal-links', 'review-intent', 'versioned-plan', 'measurement-window',
  ],
  HIGH_RISK_HIGH_VOLATILITY: [
    'verify-data', 'check-tracking', 'review-indexing', 'check-seasonality', 'check-competitor', 'rollback-condition',
  ],
  HIGH_RISK_STABLE_PAGE_1: [
    'verify-data', 'preserve-sections', 'review-topical', 'versioned-plan', 'rollback-condition', 'measurement-window',
  ],
  LOW_RISK_HIGH_VISIBILITY: [
    'verify-data', 'preserve-sections', 'review-indexing', 'monitor-no-edit',
  ],
  BORDERLINE_MEASURED_RISK: [
    'verify-data', 'check-tracking', 'check-seasonality', 'monitor-no-edit',
  ],
  HIGH_RISK_NO_CLEAR_ARCHETYPE: [
    'verify-data', 'check-tracking', 'review-indexing', 'review-intent', 'escalate-legal', 'monitor-no-edit',
  ],
};

export function getHumanActions(reasonCode: ReasonCode): HumanAction[] {
  const actionIds = ACTION_MAP[reasonCode] || ACTION_MAP.HIGH_RISK_NO_CLEAR_ARCHETYPE;
  return actionIds
    .map(id => {
      const found = ALL_ACTIONS.find(a => a.id === id);
      return found ? { id: found.id, label: found.label, labelUr: found.labelUr } : null;
    })
    .filter((a): a is HumanAction => a !== null);
}
