import { useState, useCallback, useEffect } from 'react';
import { Send, AlertCircle, Info } from 'lucide-react';
import type {
  PageInput,
  ContentContext,
  BusinessImportance,
  OutputLanguage,
  ValidationError,
  ScopeWarning,
} from '../types/agent';
import { validateInputs, getScopeWarnings, getPageReferenceWarnings, trimInput } from '../engine/validation';

interface AgentInputFormProps {
  onSubmit: (input: PageInput) => void;
  prefill?: PageInput | null;
}

const CONTENT_CONTEXTS: ContentContext[] = [
  'Blog post', 'Product page', 'Landing page', 'Guide or tutorial',
  'News or editorial', 'Category page', 'FAQ or help', 'Other',
];

const BUSINESS_LEVELS: BusinessImportance[] = ['Low', 'Medium', 'High', 'Critical'];
const LANGUAGES: { value: OutputLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'Roman Urdu' },
];

const EMPTY: PageInput = {
  pageReference: '',
  impressions: 0,
  clicks: 0,
  averagePosition: 1,
  positionVolatility: 0,
  activeDays: 1,
  availableDays: 1,
  modelRiskScore: 0.5,
  baselineScore: null,
  contentContext: 'Blog post',
  businessImportance: 'Medium',
  reviewerNotes: '',
  outputLanguage: 'en',
};

// Helper for numeric normalisation (e.g., "072" -> 72, "000.5" -> 0.5)
export function normalizeNumberInput(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const str = String(value).trim();
  if (!str) return 0;
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

export function normalizeOptionalBaseline(value: string | number | null): number | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (str === '') return null;
  const parsed = parseFloat(str);
  if (isNaN(parsed)) return null;
  return Math.min(100, Math.max(0, parsed));
}

export default function AgentInputForm({ onSubmit, prefill }: AgentInputFormProps) {
  const [form, setForm] = useState<PageInput>(EMPTY);
  const [baselineInput, setBaselineInput] = useState<string>('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [scopeWarnings, setScopeWarnings] = useState<ScopeWarning[]>([]);
  const [refWarnings, setRefWarnings] = useState<string[]>([]);
  const [hasBaseline, setHasBaseline] = useState(false);

  useEffect(() => {
    if (prefill) {
      const trimmedPrefill = trimInput(prefill);
      setForm(trimmedPrefill);
      setHasBaseline(trimmedPrefill.baselineScore !== null);
      setBaselineInput(trimmedPrefill.baselineScore !== null ? String(trimmedPrefill.baselineScore) : '');
      setErrors([]);
    }
  }, [prefill]);

  const updateField = useCallback(<K extends keyof PageInput>(key: K, value: PageInput[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleBlurNumber = (key: keyof PageInput, value: number | string) => {
    const norm = normalizeNumberInput(value);
    updateField(key, norm);
  };

  const handleBlurBaseline = () => {
    const norm = normalizeOptionalBaseline(baselineInput);
    updateField('baselineScore', norm);
    setBaselineInput(norm !== null ? String(norm) : '');
  };

  const handleBlurTrim = (key: 'pageReference' | 'reviewerNotes') => {
    const trimmed = form[key] ? form[key].trim() : '';
    updateField(key, trimmed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedForm = trimInput({
      ...form,
      baselineScore: hasBaseline ? normalizeOptionalBaseline(baselineInput) : null,
    });

    const validationErrors = validateInputs(trimmedForm);
    setErrors(validationErrors);

    const warnings = getScopeWarnings(trimmedForm);
    setScopeWarnings(warnings);

    const rw = getPageReferenceWarnings(trimmedForm.pageReference);
    setRefWarnings(rw);

    if (validationErrors.length === 0) {
      onSubmit(trimmedForm);
    }
  };

  const fieldError = (field: string) => errors.find(e => e.field === field)?.message;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate aria-label="Content Performance Form">
      {/* Privacy notice */}
      <div className="flex items-start gap-2 rounded-lg border border-slate-700/40 bg-slate-800/30 p-3" role="note">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-400" aria-hidden="true" />
        <p className="text-xs text-slate-400">
          Your analysis remains in this browser unless you explicitly enable and consent to an
          external AI explanation. No data is stored, no cookies are set, no analytics capture form inputs.
        </p>
      </div>

      {/* Page Reference */}
      <div>
        <label htmlFor="pageReference" className="mb-1 block text-sm font-medium text-slate-300">
          Page Reference <span className="text-red-400" aria-hidden="true">*</span>
        </label>
        <input
          id="pageReference"
          type="text"
          value={form.pageReference}
          onChange={e => updateField('pageReference', e.target.value)}
          onBlur={() => handleBlurTrim('pageReference')}
          placeholder='e.g. "Guide A" — use a generic label'
          className={`w-full rounded-lg border bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            fieldError('pageReference') ? 'border-red-500' : 'border-slate-600'
          }`}
          aria-describedby={fieldError('pageReference') ? 'pageRef-error' : undefined}
          required
        />
        {fieldError('pageReference') && (
          <p id="pageRef-error" className="mt-1 flex items-center gap-1 text-xs text-red-400" role="alert">
            <AlertCircle className="h-3 w-3" aria-hidden="true" /> {fieldError('pageReference')}
          </p>
        )}
        {refWarnings.map((w, i) => (
          <p key={i} className="mt-1 text-xs text-amber-400">{w}</p>
        ))}
      </div>

      {/* Numeric fields grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Impressions */}
        <div>
          <label htmlFor="impressions" className="mb-1 block text-sm font-medium text-slate-300">
            Feature-Window Impressions <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <input
            id="impressions"
            type="number"
            min={0}
            value={form.impressions}
            onChange={e => updateField('impressions', e.target.value === '' ? 0 : Number(e.target.value))}
            onBlur={e => handleBlurNumber('impressions', e.target.value)}
            className={`w-full rounded-lg border bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              fieldError('impressions') ? 'border-red-500' : 'border-slate-600'
            }`}
            aria-describedby={fieldError('impressions') ? 'impressions-error' : undefined}
            required
          />
          {fieldError('impressions') && (
            <p id="impressions-error" className="mt-1 flex items-center gap-1 text-xs text-red-400" role="alert">
              <AlertCircle className="h-3 w-3" aria-hidden="true" /> {fieldError('impressions')}
            </p>
          )}
        </div>

        {/* Clicks */}
        <div>
          <label htmlFor="clicks" className="mb-1 block text-sm font-medium text-slate-300">
            Feature-Window Clicks <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <input
            id="clicks"
            type="number"
            min={0}
            value={form.clicks}
            onChange={e => updateField('clicks', e.target.value === '' ? 0 : Number(e.target.value))}
            onBlur={e => handleBlurNumber('clicks', e.target.value)}
            className={`w-full rounded-lg border bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              fieldError('clicks') ? 'border-red-500' : 'border-slate-600'
            }`}
            aria-describedby={fieldError('clicks') ? 'clicks-error' : undefined}
            required
          />
          {fieldError('clicks') && (
            <p id="clicks-error" className="mt-1 flex items-center gap-1 text-xs text-red-400" role="alert">
              <AlertCircle className="h-3 w-3" aria-hidden="true" /> {fieldError('clicks')}
            </p>
          )}
        </div>

        {/* Calculated CTR (read-only) */}
        <div>
          <label htmlFor="calculatedCtrDisplay" className="mb-1 block text-sm font-medium text-slate-300">
            Calculated CTR
          </label>
          <div id="calculatedCtrDisplay" className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-400">
            {form.impressions > 0
              ? `${((form.clicks / form.impressions) * 100).toFixed(4)}%`
              : '0.0000%'}
          </div>
        </div>

        {/* Average Position */}
        <div>
          <label htmlFor="averagePosition" className="mb-1 block text-sm font-medium text-slate-300">
            Average Search Position <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <input
            id="averagePosition"
            type="number"
            min={0.01}
            step={0.01}
            value={form.averagePosition}
            onChange={e => updateField('averagePosition', e.target.value === '' ? 0 : Number(e.target.value))}
            onBlur={e => handleBlurNumber('averagePosition', e.target.value)}
            className={`w-full rounded-lg border bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              fieldError('averagePosition') ? 'border-red-500' : 'border-slate-600'
            }`}
            aria-describedby={fieldError('averagePosition') ? 'avgPos-error' : undefined}
            required
          />
          {fieldError('averagePosition') && (
            <p id="avgPos-error" className="mt-1 flex items-center gap-1 text-xs text-red-400" role="alert">
              <AlertCircle className="h-3 w-3" aria-hidden="true" /> {fieldError('averagePosition')}
            </p>
          )}
        </div>

        {/* Position Volatility */}
        <div>
          <label htmlFor="positionVolatility" className="mb-1 block text-sm font-medium text-slate-300">
            Position Volatility <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <input
            id="positionVolatility"
            type="number"
            min={0}
            step={0.01}
            value={form.positionVolatility}
            onChange={e => updateField('positionVolatility', e.target.value === '' ? 0 : Number(e.target.value))}
            onBlur={e => handleBlurNumber('positionVolatility', e.target.value)}
            className={`w-full rounded-lg border bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              fieldError('positionVolatility') ? 'border-red-500' : 'border-slate-600'
            }`}
            aria-describedby={fieldError('positionVolatility') ? 'vol-error' : undefined}
            required
          />
          {fieldError('positionVolatility') && (
            <p id="vol-error" className="mt-1 flex items-center gap-1 text-xs text-red-400" role="alert">
              <AlertCircle className="h-3 w-3" aria-hidden="true" /> {fieldError('positionVolatility')}
            </p>
          )}
        </div>

        {/* Active Days */}
        <div>
          <label htmlFor="activeDays" className="mb-1 block text-sm font-medium text-slate-300">
            Active Days <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <input
            id="activeDays"
            type="number"
            min={0}
            value={form.activeDays}
            onChange={e => updateField('activeDays', e.target.value === '' ? 0 : Number(e.target.value))}
            onBlur={e => handleBlurNumber('activeDays', e.target.value)}
            className={`w-full rounded-lg border bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              fieldError('activeDays') ? 'border-red-500' : 'border-slate-600'
            }`}
            aria-describedby={fieldError('activeDays') ? 'activeDays-error' : undefined}
            required
          />
          {fieldError('activeDays') && (
            <p id="activeDays-error" className="mt-1 flex items-center gap-1 text-xs text-red-400" role="alert">
              <AlertCircle className="h-3 w-3" aria-hidden="true" /> {fieldError('activeDays')}
            </p>
          )}
        </div>

        {/* Available Days */}
        <div>
          <label htmlFor="availableDays" className="mb-1 block text-sm font-medium text-slate-300">
            Available Measurement Days <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <input
            id="availableDays"
            type="number"
            min={1}
            value={form.availableDays}
            onChange={e => updateField('availableDays', e.target.value === '' ? 0 : Number(e.target.value))}
            onBlur={e => handleBlurNumber('availableDays', e.target.value)}
            className={`w-full rounded-lg border bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              fieldError('availableDays') ? 'border-red-500' : 'border-slate-600'
            }`}
            aria-describedby={fieldError('availableDays') ? 'availDays-error' : undefined}
            required
          />
          {fieldError('availableDays') && (
            <p id="availDays-error" className="mt-1 flex items-center gap-1 text-xs text-red-400" role="alert">
              <AlertCircle className="h-3 w-3" aria-hidden="true" /> {fieldError('availableDays')}
            </p>
          )}
        </div>

        {/* Model Risk Score */}
        <div>
          <label htmlFor="modelRiskScore" className="mb-1 block text-sm font-medium text-slate-300">
            Model Risk Score (0–1) <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <input
            id="modelRiskScore"
            type="number"
            min={0}
            max={1}
            step={0.001}
            value={form.modelRiskScore}
            onChange={e => updateField('modelRiskScore', e.target.value === '' ? 0 : Number(e.target.value))}
            onBlur={e => handleBlurNumber('modelRiskScore', e.target.value)}
            className={`w-full rounded-lg border bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              fieldError('modelRiskScore') ? 'border-red-500' : 'border-slate-600'
            }`}
            aria-describedby={fieldError('modelRiskScore') ? 'riskScore-error' : undefined}
            required
          />
          {fieldError('modelRiskScore') && (
            <p id="riskScore-error" className="mt-1 flex items-center gap-1 text-xs text-red-400" role="alert">
              <AlertCircle className="h-3 w-3" aria-hidden="true" /> {fieldError('modelRiskScore')}
            </p>
          )}
        </div>

        {/* Baseline Score (optional) */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <label htmlFor="baselineToggle" className="text-sm font-medium text-slate-300">
              Baseline Action Score
            </label>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                id="baselineToggle"
                type="checkbox"
                checked={hasBaseline}
                onChange={e => {
                  setHasBaseline(e.target.checked);
                  if (!e.target.checked) {
                    updateField('baselineScore', null);
                    setBaselineInput('');
                  }
                }}
                className="peer sr-only"
                aria-label="Toggle Baseline Action Score"
              />
              <div className="h-5 w-9 rounded-full bg-slate-600 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-500 peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-indigo-400" />
            </label>
          </div>
          {hasBaseline && (
            <input
              id="baselineScore"
              type="number"
              min={0}
              max={100}
              placeholder="0–100"
              value={baselineInput}
              onChange={e => setBaselineInput(e.target.value)}
              onBlur={handleBlurBaseline}
              className={`w-full rounded-lg border bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                fieldError('baselineScore') ? 'border-red-500' : 'border-slate-600'
              }`}
              aria-describedby={fieldError('baselineScore') ? 'baselineScore-error' : undefined}
            />
          )}
          {fieldError('baselineScore') && (
            <p id="baselineScore-error" className="mt-1 flex items-center gap-1 text-xs text-red-400" role="alert">
              <AlertCircle className="h-3 w-3" aria-hidden="true" /> {fieldError('baselineScore')}
            </p>
          )}
        </div>
      </div>

      {/* Selects row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="contentContext" className="mb-1 block text-sm font-medium text-slate-300">
            Content Context
          </label>
          <select
            id="contentContext"
            value={form.contentContext}
            onChange={e => updateField('contentContext', e.target.value as ContentContext)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {CONTENT_CONTEXTS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="businessImportance" className="mb-1 block text-sm font-medium text-slate-300">
            Business Importance
          </label>
          <select
            id="businessImportance"
            value={form.businessImportance}
            onChange={e => updateField('businessImportance', e.target.value as BusinessImportance)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {BUSINESS_LEVELS.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="outputLanguage" className="mb-1 block text-sm font-medium text-slate-300">
            Output Language
          </label>
          <select
            id="outputLanguage"
            value={form.outputLanguage}
            onChange={e => updateField('outputLanguage', e.target.value as OutputLanguage)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviewer Notes */}
      <div>
        <label htmlFor="reviewerNotes" className="mb-1 block text-sm font-medium text-slate-300">
          Reviewer Notes (optional)
        </label>
        <textarea
          id="reviewerNotes"
          value={form.reviewerNotes}
          onChange={e => updateField('reviewerNotes', e.target.value)}
          onBlur={() => handleBlurTrim('reviewerNotes')}
          rows={3}
          placeholder="Any additional context for the review..."
          className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Scope warnings */}
      {scopeWarnings.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3" role="region" aria-label="Study Scope Warnings">
          <p className="mb-2 text-sm font-semibold text-amber-300">Study-Scope Warnings</p>
          {scopeWarnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-200">{w.message}</p>
          ))}
          <p className="mt-2 text-xs font-medium text-amber-300">
            This input is outside the validated analytical population.
            Interpret the result with additional caution.
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-[0.98]"
        aria-label="Analyse Page metrics"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        Analyse Page
      </button>
    </form>
  );
}
