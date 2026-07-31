import { describe, it, expect } from 'vitest';
import {
  validateInputs,
  validatePageReference,
  getScopeWarnings,
  trimInput,
  isNotePublicSafe,
} from '../engine/validation';
import {
  normalizeNumberInput,
  normalizeOptionalBaseline,
} from '../components/AgentInputForm';
import type { PageInput } from '../types/agent';

const BASE_INPUT: PageInput = {
  pageReference: 'Test Page A',
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
  reviewerNotes: '',
  outputLanguage: 'en',
};

describe('Input Validation & Normalisation', () => {
  // Test 1: Clicks greater than impressions
  it('rejects clicks greater than impressions', () => {
    const errors = validateInputs({ ...BASE_INPUT, clicks: 2000, impressions: 1000 });
    const clickError = errors.find(e => e.field === 'clicks');
    expect(clickError).toBeDefined();
    expect(clickError!.message).toContain('cannot exceed impressions');
  });

  // Test 2: URL entered as page reference
  it('rejects URL as page reference', () => {
    const errors = validatePageReference('https://example.com/page');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('URLs');
  });

  // Test 3: Email entered as page reference
  it('rejects email as page reference', () => {
    const errors = validatePageReference('user@example.com');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('Email');
  });

  // Test 4: Active days greater than available days
  it('rejects active days greater than available days', () => {
    const errors = validateInputs({ ...BASE_INPUT, activeDays: 20, availableDays: 15 });
    const dayError = errors.find(e => e.field === 'activeDays');
    expect(dayError).toBeDefined();
    expect(dayError!.message).toContain('cannot exceed');
  });

  // Test 11: Impressions below 500
  it('warns when impressions below 500', () => {
    const warnings = getScopeWarnings({ ...BASE_INPUT, impressions: 100 });
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].message).toContain('500');
  });

  // Test 12: Available days below 5
  it('warns when available days below 5', () => {
    const warnings = getScopeWarnings({ ...BASE_INPUT, availableDays: 3 });
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].message).toContain('5');
  });

  // Test 13: Position above 20
  it('warns when position above 20', () => {
    const warnings = getScopeWarnings({ ...BASE_INPUT, averagePosition: 25 });
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].message).toContain('20');
  });

  // Page-reference trimming
  it('trims leading and trailing whitespace from page reference', () => {
    const input = { ...BASE_INPUT, pageReference: '   Guide A   ' };
    const trimmed = trimInput(input);
    expect(trimmed.pageReference).toBe('Guide A');
  });

  // Reviewer-notes trimming
  it('trims leading and trailing whitespace from reviewer notes', () => {
    const input = { ...BASE_INPUT, reviewerNotes: '   Review note text   ' };
    const trimmed = trimInput(input);
    expect(trimmed.reviewerNotes).toBe('Review note text');
  });

  // Numeric leading-zero normalisation
  it('normalises numeric inputs removing leading zeroes', () => {
    expect(normalizeNumberInput('072')).toBe(72);
    expect(normalizeNumberInput('000.5')).toBe(0.5);
    expect(normalizeNumberInput('0015')).toBe(15);
  });

  // Empty optional baseline score remains null
  it('preserves empty optional baseline score as null', () => {
    expect(normalizeOptionalBaseline('')).toBeNull();
    expect(normalizeOptionalBaseline('   ')).toBeNull();
    expect(normalizeOptionalBaseline(null)).toBeNull();
    expect(normalizeOptionalBaseline('072')).toBe(72);
  });

  // Note safety validation
  it('validates public safety of reviewer notes', () => {
    expect(isNotePublicSafe('Legitimate internal review note.')).toBe(true);
    expect(isNotePublicSafe('Check https://secret-client.com')).toBe(false);
    expect(isNotePublicSafe('Contact client@company.org')).toBe(false);
    expect(isNotePublicSafe('API_KEY=12345')).toBe(false);
  });

  it('rejects negative impressions', () => {
    const errors = validateInputs({ ...BASE_INPUT, impressions: -10 });
    expect(errors.find(e => e.field === 'impressions')).toBeDefined();
  });

  it('rejects risk score out of range', () => {
    const errors = validateInputs({ ...BASE_INPUT, modelRiskScore: 1.5 });
    expect(errors.find(e => e.field === 'modelRiskScore')).toBeDefined();
  });

  it('rejects position less than or equal to zero', () => {
    const errors = validateInputs({ ...BASE_INPUT, averagePosition: 0 });
    expect(errors.find(e => e.field === 'averagePosition')).toBeDefined();
  });

  it('rejects baseline score out of range', () => {
    const errors = validateInputs({ ...BASE_INPUT, baselineScore: 150 });
    expect(errors.find(e => e.field === 'baselineScore')).toBeDefined();
  });
});
