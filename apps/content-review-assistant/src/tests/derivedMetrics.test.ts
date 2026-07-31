import { describe, it, expect } from 'vitest';
import {
  calculateCTR,
  getPositionBand,
  getVisibilityLevel,
  getCTRCategory,
  getVolatilityLevel,
  getRiskLevel,
} from '../engine/derivedMetrics';

describe('Derived Metrics', () => {
  describe('calculateCTR', () => {
    it('returns 0 when impressions are zero', () => {
      expect(calculateCTR(10, 0)).toBe(0);
    });

    it('calculates CTR correctly', () => {
      expect(calculateCTR(5, 1000)).toBeCloseTo(0.005);
    });

    it('returns 0 when clicks are zero', () => {
      expect(calculateCTR(0, 1000)).toBe(0);
    });
  });

  describe('getPositionBand', () => {
    it('returns Top 3 for position 1–3', () => {
      expect(getPositionBand(1)).toBe('Top 3');
      expect(getPositionBand(3)).toBe('Top 3');
    });

    it('returns Page 1 for position 4–10', () => {
      expect(getPositionBand(4)).toBe('Page 1');
      expect(getPositionBand(10)).toBe('Page 1');
    });

    it('returns Page 2 for position 11–20', () => {
      expect(getPositionBand(11)).toBe('Page 2');
      expect(getPositionBand(20)).toBe('Page 2');
    });

    it('returns Deep visibility for position > 20', () => {
      expect(getPositionBand(21)).toBe('Deep visibility');
    });
  });

  describe('getVisibilityLevel', () => {
    it('returns Low for < 500', () => {
      expect(getVisibilityLevel(100)).toBe('Low');
    });

    it('returns Moderate for 500–1999', () => {
      expect(getVisibilityLevel(500)).toBe('Moderate');
      expect(getVisibilityLevel(1999)).toBe('Moderate');
    });

    it('returns High for 2000–9999', () => {
      expect(getVisibilityLevel(2000)).toBe('High');
    });

    it('returns Very high for >= 10000', () => {
      expect(getVisibilityLevel(10000)).toBe('Very high');
    });
  });

  describe('getCTRCategory', () => {
    it('returns Zero observed CTR for 0', () => {
      expect(getCTRCategory(0)).toBe('Zero observed CTR');
    });

    it('returns Very low for CTR > 0 and < 0.001', () => {
      expect(getCTRCategory(0.0005)).toBe('Very low observed CTR');
    });

    it('returns Low for CTR >= 0.001 and < 0.003', () => {
      expect(getCTRCategory(0.001)).toBe('Low observed CTR');
    });

    it('returns Moderate for CTR >= 0.003 and < 0.01', () => {
      expect(getCTRCategory(0.005)).toBe('Moderate observed CTR');
    });

    it('returns Higher for CTR >= 0.01', () => {
      expect(getCTRCategory(0.05)).toBe('Higher observed CTR');
    });
  });

  describe('getVolatilityLevel', () => {
    it('returns Stable for < 1', () => {
      expect(getVolatilityLevel(0.5)).toBe('Stable');
    });

    it('returns Moderate for 1–4.99', () => {
      expect(getVolatilityLevel(3)).toBe('Moderate');
    });

    it('returns High for 5–9.99', () => {
      expect(getVolatilityLevel(7)).toBe('High');
    });

    it('returns Very high for >= 10', () => {
      expect(getVolatilityLevel(15)).toBe('Very high');
    });
  });

  describe('getRiskLevel', () => {
    it('returns Low for < 0.35', () => {
      expect(getRiskLevel(0.20)).toBe('Low');
    });

    it('returns Moderate for 0.35–0.49', () => {
      expect(getRiskLevel(0.40)).toBe('Moderate');
    });

    it('returns High for 0.50–0.69', () => {
      expect(getRiskLevel(0.60)).toBe('High');
    });

    it('returns Critical review priority for >= 0.70', () => {
      expect(getRiskLevel(0.80)).toBe('Critical review priority');
    });
  });
});
