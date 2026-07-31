// ─── Input Validation Engine ───
import type { PageInput, ValidationError, ScopeWarning } from '../types/agent';

const URL_PATTERN = /https?:\/\/[^\s]+/i;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const SENSITIVE_PATTERNS = [
  /\.(com|net|org|io|co|uk|de|fr|es|it|nl|ca|au|nz)/i,
  /www\./i,
  /api[_-]?key/i,
  /secret/i,
  /bearer\s+[a-zA-Z0-9._-]+/i,
];

export function trimInput(input: PageInput): PageInput {
  return {
    ...input,
    pageReference: input.pageReference ? input.pageReference.trim() : '',
    reviewerNotes: input.reviewerNotes ? input.reviewerNotes.trim() : '',
    contentContext: input.contentContext ? (input.contentContext.trim() as any) : input.contentContext,
  };
}

export function isNotePublicSafe(notes: string): boolean {
  if (!notes || !notes.trim()) return true;
  const trimmed = notes.trim();

  if (URL_PATTERN.test(trimmed)) return false;
  if (EMAIL_PATTERN.test(trimmed)) return false;

  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(trimmed)) return false;
  }

  return true;
}

export function validatePageReference(value: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmed = value ? value.trim() : '';

  if (!trimmed) {
    errors.push({ field: 'pageReference', message: 'Page reference is required.' });
    return errors;
  }

  if (URL_PATTERN.test(trimmed)) {
    errors.push({
      field: 'pageReference',
      message: 'URLs (http:// or https://) are not allowed. Use a generic label such as "Blog Post A".',
    });
  }

  if (EMAIL_PATTERN.test(trimmed)) {
    errors.push({
      field: 'pageReference',
      message: 'Email addresses are not allowed. Use a generic label.',
    });
  }

  return errors;
}

export function getPageReferenceWarnings(value: string): string[] {
  const warnings: string[] = [];
  const trimmed = value ? value.trim() : '';
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(trimmed)) {
      warnings.push(
        'This may contain a domain or client identifier. Consider using a generic label to keep results public-safe.'
      );
      break;
    }
  }
  return warnings;
}

export function validateInputs(input: Partial<PageInput>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Page reference
  if (input.pageReference !== undefined) {
    errors.push(...validatePageReference(input.pageReference));
  } else {
    errors.push({ field: 'pageReference', message: 'Page reference is required.' });
  }

  // Impressions
  if (input.impressions !== undefined) {
    if (input.impressions < 0) {
      errors.push({ field: 'impressions', message: 'Impressions cannot be negative.' });
    }
  }

  // Clicks
  if (input.clicks !== undefined) {
    if (input.clicks < 0) {
      errors.push({ field: 'clicks', message: 'Clicks cannot be negative.' });
    }
    if (input.impressions !== undefined && input.clicks > input.impressions) {
      errors.push({ field: 'clicks', message: 'Clicks cannot exceed impressions.' });
    }
  }

  // Average position
  if (input.averagePosition !== undefined) {
    if (input.averagePosition <= 0) {
      errors.push({ field: 'averagePosition', message: 'Position must be greater than zero.' });
    }
  }

  // Position volatility
  if (input.positionVolatility !== undefined) {
    if (input.positionVolatility < 0) {
      errors.push({ field: 'positionVolatility', message: 'Volatility cannot be negative.' });
    }
  }

  // Active days
  if (input.activeDays !== undefined) {
    if (input.activeDays < 0) {
      errors.push({ field: 'activeDays', message: 'Active days cannot be negative.' });
    }
  }

  // Available days
  if (input.availableDays !== undefined) {
    if (input.availableDays < 1) {
      errors.push({ field: 'availableDays', message: 'Available days must be at least 1.' });
    }
    if (input.activeDays !== undefined && input.activeDays > input.availableDays) {
      errors.push({ field: 'activeDays', message: 'Active days cannot exceed available days.' });
    }
  }

  // Model risk score
  if (input.modelRiskScore !== undefined) {
    if (input.modelRiskScore < 0 || input.modelRiskScore > 1) {
      errors.push({ field: 'modelRiskScore', message: 'Risk score must be between 0 and 1.' });
    }
  }

  // Baseline score
  if (input.baselineScore !== undefined && input.baselineScore !== null) {
    if (input.baselineScore < 0 || input.baselineScore > 100) {
      errors.push({ field: 'baselineScore', message: 'Baseline score must be between 0 and 100.' });
    }
  }

  return errors;
}

export function getScopeWarnings(input: PageInput): ScopeWarning[] {
  const warnings: ScopeWarning[] = [];

  if (input.impressions < 500) {
    warnings.push({
      field: 'impressions',
      message: 'Impressions below 500 — outside the validated analytical population.',
    });
  }

  if (input.availableDays < 5) {
    warnings.push({
      field: 'availableDays',
      message: 'Available days below 5 — outside the validated analytical population.',
    });
  }

  if (input.averagePosition > 20) {
    warnings.push({
      field: 'averagePosition',
      message: 'Average position above 20 — outside the validated analytical population.',
    });
  }

  return warnings;
}
