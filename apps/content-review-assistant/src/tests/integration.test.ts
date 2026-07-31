import { describe, it, expect } from 'vitest';
import { generateReview } from '../engine/narrativeEngine';
import { generateReportHTML } from '../components/ReportExport';
import { isResearchPaperAvailable, RESEARCH_URL } from '../data/links';
import type { PageInput } from '../types/agent';

const BASE_INPUT: PageInput = {
  pageReference: '   Guide A   ',
  impressions: 1000,
  clicks: 10,
  averagePosition: 5,
  positionVolatility: 2,
  activeDays: 10,
  availableDays: 15,
  modelRiskScore: 0.5,
  baselineScore: null,
  contentContext: 'Blog post',
  businessImportance: 'Medium',
  reviewerNotes: '   Initial analysis note   ',
  outputLanguage: 'en',
};

describe('Integration Tests & Refactor Checks', () => {
  // Test 14: Application works without AI API
  it('generates a complete review without any AI API', () => {
    const result = generateReview(BASE_INPUT);
    expect(result).toBeDefined();
    expect(result.reasonCode).toBeDefined();
    expect(result.reasonCode.code).toBeTruthy();
    expect(result.reasonCode.action).toBeTruthy();
    expect(result.derived).toBeDefined();
    expect(result.explanation).toBeTruthy();
    expect(result.confidenceNote).toBeTruthy();
    expect(result.responsibleUseWarning).toBeTruthy();
    expect(result.actions.length).toBeGreaterThan(0);
    expect(result.timestamp).toBeTruthy();
  });

  // Test 15: Roman Urdu output works
  it('generates Roman Urdu output', () => {
    const result = generateReview({ ...BASE_INPUT, outputLanguage: 'ur' });
    expect(result.explanationUr).toBeTruthy();
    expect(result.explanationUr).toContain('Page');
    expect(result.confidenceNoteUr).toBeTruthy();
    expect(result.responsibleUseWarningUr).toBeTruthy();
    expect(result.responsibleUseWarningUr).toContain('decision-support');
  });

  // Whitespace trimming & clean quotes
  it('trims page reference and uses curly quotation marks in narrative', () => {
    const result = generateReview(BASE_INPUT);
    expect(result.input.pageReference).toBe('Guide A');
    expect(result.explanation).toContain('Page “Guide A”');
  });

  // Reason-card text is NOT identical to full narrative
  it('ensures reason-card concise explanation is not identical to full narrative', () => {
    const result = generateReview(BASE_INPUT);
    expect(result.reasonCode.conciseExplanation).toBeTruthy();
    expect(result.explanation).not.toBe(result.reasonCode.conciseExplanation);
    expect(result.explanation.length).toBeGreaterThan(result.reasonCode.conciseExplanation.length);
  });

  // Reviewer notes excluded from report by default
  it('excludes reviewer notes from exported report by default', () => {
    const result = generateReview(BASE_INPUT);
    const htmlDefault = generateReportHTML(result, 'en', false);
    expect(htmlDefault).not.toContain('Reviewer Notes');
    expect(htmlDefault).not.toContain('Initial analysis note');
  });

  // Reviewer notes included after explicit selection
  it('includes reviewer notes in exported report only after explicit selection', () => {
    const result = generateReview(BASE_INPUT);
    const htmlWithNotes = generateReportHTML(result, 'en', true);
    expect(htmlWithNotes).toContain('Reviewer Notes');
    expect(htmlWithNotes).toContain('Initial analysis note');
  });

  // Unsafe notes excluded
  it('excludes unsafe reviewer notes even if inclusion is selected', () => {
    const unsafeInput: PageInput = {
      ...BASE_INPUT,
      reviewerNotes: 'Check client website https://private-client-domain.com for details',
    };
    const result = generateReview(unsafeInput);
    const html = generateReportHTML(result, 'en', true);
    expect(html).not.toContain('Reviewer Notes');
    expect(html).not.toContain('private-client-domain.com');
  });

  // Out-of-population failure condition hiding/showing logic
  it('hides out-of-population failure item for valid in-scope inputs', () => {
    const result = generateReview(BASE_INPUT);
    const html = generateReportHTML(result, 'en', false);
    expect(result.derived.studyScopeStatus).toBe('Within validated population');
    expect(html).not.toContain('Input outside the validated population');
  });

  it('shows out-of-population failure item when impressions < 500', () => {
    const outInput = { ...BASE_INPUT, impressions: 200 };
    const result = generateReview(outInput);
    const html = generateReportHTML(result, 'en', false);
    expect(result.derived.studyScopeStatus).toBe('Outside validated population');
    expect(html).toContain('Input outside the validated population');
  });

  it('shows out-of-population failure item when available days < 5', () => {
    const outInput = { ...BASE_INPUT, availableDays: 3, activeDays: 3 };
    const result = generateReview(outInput);
    const html = generateReportHTML(result, 'en', false);
    expect(result.derived.studyScopeStatus).toBe('Outside validated population');
    expect(html).toContain('Input outside the validated population');
  });

  it('shows out-of-population failure item when position > 20', () => {
    const outInput = { ...BASE_INPUT, averagePosition: 25 };
    const result = generateReview(outInput);
    const html = generateReportHTML(result, 'en', false);
    expect(result.derived.studyScopeStatus).toBe('Outside validated population');
    expect(html).toContain('Input outside the validated population');
  });

  // Wording checks for CTR_GAP_HIGH_VISIBILITY
  it('verifies exact wording updates for CTR_GAP_HIGH_VISIBILITY', () => {
    const exampleInput: PageInput = {
      pageReference: 'Guide A',
      impressions: 943,
      clicks: 0,
      averagePosition: 8.38,
      positionVolatility: 11.92,
      activeDays: 11,
      availableDays: 14,
      modelRiskScore: 0.743,
      baselineScore: 72,
      contentContext: 'Guide or tutorial',
      businessImportance: 'Medium',
      reviewerNotes: '',
      outputLanguage: 'en',
    };

    const result = generateReview(exampleInput);
    expect(result.reasonCode.conciseExplanation).toBe(
      'Meaningful Page-1 visibility with zero or relatively weak observed CTR.'
    );
    expect(result.reasonCode.description).toContain('human should review');
    expect(result.reasonCode.description).not.toContain('optimisation and title/description alignment are recommended');
    expect(result.reasonCode.description).not.toContain('guaranteed');
  });

  // Language switching updates narrative without changing deterministic results
  it('updates visible narrative on language switch without altering deterministic results', () => {
    const enResult = generateReview({ ...BASE_INPUT, outputLanguage: 'en' });
    const urResult = generateReview({ ...BASE_INPUT, outputLanguage: 'ur' });

    expect(enResult.reasonCode.code).toBe(urResult.reasonCode.code);
    expect(enResult.reasonCode.action).toBe(urResult.reasonCode.action);
    expect(enResult.derived.riskLevel).toBe(urResult.derived.riskLevel);
    expect(enResult.derived.ctr).toBe(urResult.derived.ctr);

    expect(enResult.explanation).not.toBe(urResult.explanationUr);
  });

  // Research paper deployment status behavior
  it('validates research paper link deployment status helper', () => {
    expect(isResearchPaperAvailable()).toBe(true);
    expect(RESEARCH_URL).toBe('https://zafar488.github.io/flyrank-ml-internship/');
  });

  // Deterministic precedence test from prompt Section 12
  it('preserves current deterministic logic for the required precedence example', () => {
    const exampleInput: PageInput = {
      pageReference: 'Guide A',
      impressions: 943,
      clicks: 0,
      averagePosition: 8.38,
      positionVolatility: 11.92,
      activeDays: 11,
      availableDays: 14,
      modelRiskScore: 0.743,
      baselineScore: 72,
      contentContext: 'Guide or tutorial',
      businessImportance: 'Medium',
      reviewerNotes: '',
      outputLanguage: 'en',
    };

    const result = generateReview(exampleInput);
    expect(result.derived.studyScopeStatus).toBe('Within validated population');
    expect(result.derived.riskLevel).toBe('Critical review priority');
    expect(result.reasonCode.code).toBe('CTR_GAP_HIGH_VISIBILITY');
    expect(result.reasonCode.ruleIndex).toBe(1);
    expect(result.reasonCode.action).toBe('CTR Review');
  });

  it('includes responsible-use warning in both languages', () => {
    const result = generateReview(BASE_INPUT);
    expect(result.responsibleUseWarning).toContain('decision support only');
    expect(result.responsibleUseWarningUr).toContain('decision-support');
  });
});
