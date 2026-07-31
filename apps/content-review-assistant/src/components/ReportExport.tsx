import { useState, useEffect } from 'react';
import { FileDown, Trash2, Lock } from 'lucide-react';
import type { ReviewResult, OutputLanguage } from '../types/agent';
import { isNotePublicSafe } from '../engine/validation';

interface ReportExportProps {
  result: ReviewResult | null;
  language: OutputLanguage;
  onClear: () => void;
}

export function generateReportHTML(
  result: ReviewResult,
  language: OutputLanguage,
  includeNotes: boolean = false
): string {
  const isUr = language === 'ur';
  const explanation = isUr ? result.explanationUr : result.explanation;
  const confidence = isUr ? result.confidenceNoteUr : result.confidenceNote;
  const responsible = isUr ? result.responsibleUseWarningUr : result.responsibleUseWarning;
  const ctrPct = (result.derived.ctr * 100).toFixed(4);

  const rawNotes = result.input.reviewerNotes ? result.input.reviewerNotes.trim() : '';
  const canShowNotes = includeNotes && rawNotes.length > 0 && isNotePublicSafe(rawNotes);

  return `<!DOCTYPE html>
<html lang="${isUr ? 'ur' : 'en'}">
<head>
<meta charset="UTF-8">
<title>Content Review Report — ${result.input.pageReference || 'Analysis'}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1e293b; line-height: 1.6; }
  h1 { color: #1e293b; border-bottom: 2px solid #6366f1; padding-bottom: 8px; }
  h2 { color: #334155; margin-top: 28px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
  th { background: #f1f5f9; font-weight: 600; }
  .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; margin: 12px 0; font-size: 13px; }
  .notes { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin: 12px 0; font-size: 13px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
  ul { padding-left: 20px; }
  li { margin: 4px 0; font-size: 14px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<h1>FlyRank Content Review Report</h1>
<p><strong>Generated:</strong> ${result.timestamp}</p>
<p><strong>Page Reference:</strong> ${result.input.pageReference ? `“${result.input.pageReference}”` : 'N/A'}</p>

<h2>Input Values</h2>
<table>
  <tr><th>Metric</th><th>Value</th></tr>
  <tr><td>Impressions</td><td>${result.input.impressions.toLocaleString()}</td></tr>
  <tr><td>Clicks</td><td>${result.input.clicks.toLocaleString()}</td></tr>
  <tr><td>Average Position</td><td>${result.input.averagePosition.toFixed(2)}</td></tr>
  <tr><td>Position Volatility</td><td>${result.input.positionVolatility.toFixed(2)}</td></tr>
  <tr><td>Active Days</td><td>${result.input.activeDays}</td></tr>
  <tr><td>Available Days</td><td>${result.input.availableDays}</td></tr>
  <tr><td>Model Risk Score</td><td>${result.input.modelRiskScore.toFixed(3)}</td></tr>
  ${result.input.baselineScore !== null ? `<tr><td>Baseline Score</td><td>${result.input.baselineScore}</td></tr>` : ''}
  <tr><td>Content Context</td><td>${result.input.contentContext}</td></tr>
  <tr><td>Business Importance</td><td>${result.input.businessImportance}</td></tr>
</table>

<h2>Derived Values</h2>
<table>
  <tr><th>Metric</th><th>Value</th></tr>
  <tr><td>CTR</td><td>${ctrPct}%</td></tr>
  <tr><td>CTR Category</td><td>${result.derived.ctrCategory}</td></tr>
  <tr><td>Position Band</td><td>${result.derived.positionBand}</td></tr>
  <tr><td>Visibility Level</td><td>${result.derived.visibilityLevel}</td></tr>
  <tr><td>Volatility Level</td><td>${result.derived.volatilityLevel}</td></tr>
  <tr><td>Risk Level</td><td>${result.derived.riskLevel}</td></tr>
  <tr><td>Study Scope Status</td><td>${result.derived.studyScopeStatus}</td></tr>
</table>

<h2>Result</h2>
<table>
  <tr><td><strong>Reason Code</strong></td><td>${result.reasonCode.code}</td></tr>
  <tr><td><strong>Recommended Action</strong></td><td>${result.reasonCode.action}</td></tr>
  <tr><td><strong>Human Review Required</strong></td><td>Yes</td></tr>
</table>

<h2>Explanation</h2>
<p>${explanation}</p>

<div class="warning">
  <strong>Confidence Note:</strong> ${confidence}
</div>

${canShowNotes ? `<h2>Reviewer Notes</h2>\n<div class="notes"><p>${rawNotes}</p></div>` : ''}

<h2>Human-Review Actions</h2>
<ul>
${result.actions.map(a => `  <li>${isUr ? a.labelUr : a.label}</li>`).join('\n')}
</ul>

<h2>What Could Make This Recommendation Wrong?</h2>
<ul>
${[
  'Temporary demand changes',
  'Seasonality',
  'Tracking errors',
  'Availability gaps',
  'Query-mix changes',
  'SERP layout changes',
  'Competitor movement',
  'Indexing changes',
  'Brand context not represented',
  'Business value not represented',
  'Conversion value not represented',
  'Content quality not directly measured',
  'Legal or compliance context not represented',
  ...(result.derived.studyScopeStatus === 'Outside validated population'
    ? ['Input outside the validated population']
    : []),
].map(item => `  <li>${item}</li>`).join('\n')}
</ul>

<h2>Limitations</h2>
<ul>
  <li>Results come from one grouped-client March 2026 validation design.</li>
  <li>The target is a later-impression decline proxy, not content quality.</li>
  <li>Feature importance is directional, not causal.</li>
  <li>Risk categories are explanatory interface categories, not validated production thresholds.</li>
</ul>

<div class="warning">
  <strong>Responsible-Use Warning:</strong> ${responsible}
</div>

<div class="footer">
  <p>FlyRank Content Review Assistant — Built by Zafar Ullah</p>
  <p>This report is decision support only. The final decision belongs to a human reviewer.</p>
</div>
</body>
</html>`;
}

export default function ReportExport({ result, language, onClear }: ReportExportProps) {
  const [includeNotes, setIncludeNotes] = useState(false);

  useEffect(() => {
    if (!result) {
      setIncludeNotes(false);
    }
  }, [result]);

  const handleExport = () => {
    if (!result) return;
    const html = generateReportHTML(result, language, includeNotes);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.addEventListener('afterprint', () => URL.revokeObjectURL(url));
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const handleClearAll = () => {
    setIncludeNotes(false);
    onClear();
  };

  return (
    <div className="space-y-4">
      {/* Checkbox for reviewer notes export */}
      <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-3">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={includeNotes}
            onChange={e => setIncludeNotes(e.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-2 focus:ring-indigo-400"
          />
          <span className="font-medium">Include reviewer notes in report</span>
        </label>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
          <Lock className="h-3 w-3 text-slate-500" aria-hidden="true" />
          Reviewer notes are excluded by default to reduce accidental disclosure of sensitive context.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExport}
          disabled={!result}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
          aria-label="Export review report"
        >
          <FileDown className="h-4 w-4" aria-hidden="true" />
          Export Review Report
        </button>
        <button
          onClick={handleClearAll}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:border-slate-500 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-[0.98]"
          aria-label="Clear analysis"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Clear Analysis
        </button>
      </div>
    </div>
  );
}
