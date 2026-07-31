import { describe, it, expect } from 'vitest';
import { evaluateReasonCode } from '../engine/reasonCodeEngine';
import type { PageInput } from '../types/agent';

const BASE_INPUT: PageInput = {
  pageReference: 'Test Page',
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

describe('Reason Code Engine — Rule Precedence', () => {
  // Test 5: CTR gap rule precedence (the critical precedence test)
  // Input: risk 0.75, position 8, CTR 0, impressions 943, volatility 11.92
  // Expected: CTR_GAP_HIGH_VISIBILITY, CTR Review
  // A Page-1 page with low CTR and high volatility must receive CTR_GAP_HIGH_VISIBILITY
  // because Rule 1 precedes the volatility rule.
  it('applies CTR gap rule (Rule 1) before volatility rule (Rule 3) — required precedence test', () => {
    const result = evaluateReasonCode({
      ...BASE_INPUT,
      modelRiskScore: 0.75,
      averagePosition: 8,
      clicks: 0,
      impressions: 943,
      positionVolatility: 11.92,
    });
    expect(result.code).toBe('CTR_GAP_HIGH_VISIBILITY');
    expect(result.action).toBe('CTR Review');
  });

  // Test: Rule 0 — Outside validated population (impressions < 500)
  it('returns OUTSIDE_VALIDATED_POPULATION for impressions < 500', () => {
    const result = evaluateReasonCode({
      ...BASE_INPUT,
      impressions: 200,
      modelRiskScore: 0.75,
    });
    expect(result.code).toBe('OUTSIDE_VALIDATED_POPULATION');
    expect(result.action).toBe('Manual Review');
  });

  // Test: Rule 0 — Outside validated population (available days < 5)
  it('returns OUTSIDE_VALIDATED_POPULATION for available days < 5', () => {
    const result = evaluateReasonCode({
      ...BASE_INPUT,
      availableDays: 3,
      activeDays: 3,
    });
    expect(result.code).toBe('OUTSIDE_VALIDATED_POPULATION');
  });

  // Test: Rule 0 — Outside validated population (position > 20)
  it('returns OUTSIDE_VALIDATED_POPULATION for position > 20', () => {
    const result = evaluateReasonCode({
      ...BASE_INPUT,
      averagePosition: 25,
    });
    expect(result.code).toBe('OUTSIDE_VALIDATED_POPULATION');
  });

  // Test 6: Page-2 rule
  it('applies HIGH_VALUE_PAGE_2 for Page 2 pages with high risk', () => {
    const result = evaluateReasonCode({
      ...BASE_INPUT,
      modelRiskScore: 0.60,
      averagePosition: 15,
      impressions: 1000,
      positionVolatility: 2,
    });
    expect(result.code).toBe('HIGH_VALUE_PAGE_2');
    expect(result.action).toBe('Expand and Optimise');
  });

  // Test 7: High-volatility rule
  it('applies HIGH_RISK_HIGH_VOLATILITY for high risk + high volatility (not on Page 1 with low CTR)', () => {
    const result = evaluateReasonCode({
      ...BASE_INPUT,
      modelRiskScore: 0.60,
      averagePosition: 2, // Top 3, not Page 1 band (>3)
      positionVolatility: 8,
      impressions: 1000,
      clicks: 50, // CTR is 0.05 so Rule 1 doesn't trigger
    });
    expect(result.code).toBe('HIGH_RISK_HIGH_VOLATILITY');
    expect(result.action).toBe('Refresh Review');
  });

  // Test 8: Stable Page-1 rule
  it('applies HIGH_RISK_STABLE_PAGE_1 for high risk on stable Page 1', () => {
    const result = evaluateReasonCode({
      ...BASE_INPUT,
      modelRiskScore: 0.60,
      averagePosition: 7,
      positionVolatility: 3,
      impressions: 1000,
      clicks: 50, // CTR > 0.003 so Rule 1 doesn't trigger
    });
    expect(result.code).toBe('HIGH_RISK_STABLE_PAGE_1');
    expect(result.action).toBe('Refresh and Protect');
  });

  // Test 9: Low-risk protect rule
  it('applies LOW_RISK_HIGH_VISIBILITY for low risk + high impressions', () => {
    const result = evaluateReasonCode({
      ...BASE_INPUT,
      modelRiskScore: 0.20,
      impressions: 5000,
      averagePosition: 5,
    });
    expect(result.code).toBe('LOW_RISK_HIGH_VISIBILITY');
    expect(result.action).toBe('Protect');
  });

  // Test 10: Borderline monitor rule
  it('applies BORDERLINE_MEASURED_RISK for borderline risk', () => {
    const result = evaluateReasonCode({
      ...BASE_INPUT,
      modelRiskScore: 0.40,
      impressions: 1000,
      averagePosition: 5,
    });
    expect(result.code).toBe('BORDERLINE_MEASURED_RISK');
    expect(result.action).toBe('Monitor');
  });

  // Fallback test
  it('returns HIGH_RISK_NO_CLEAR_ARCHETYPE as fallback', () => {
    const result = evaluateReasonCode({
      ...BASE_INPUT,
      modelRiskScore: 0.60,
      averagePosition: 2, // Top 3
      positionVolatility: 3, // Not high volatility
      impressions: 1000,
      clicks: 50,
    });
    expect(result.code).toBe('HIGH_RISK_NO_CLEAR_ARCHETYPE');
    expect(result.action).toBe('Manual Review');
  });
});
