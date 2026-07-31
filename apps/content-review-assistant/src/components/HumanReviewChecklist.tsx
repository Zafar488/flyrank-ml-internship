import { useState } from 'react';
import { ClipboardCheck, CheckCircle2 } from 'lucide-react';
import type { ChecklistItem } from '../types/agent';

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'data-availability', label: 'Data availability verified', checked: false },
  { id: 'tracking-changes', label: 'Tracking changes checked', checked: false },
  { id: 'indexing-status', label: 'Indexing status checked', checked: false },
  { id: 'canonical-redirect', label: 'Canonical and redirect status checked', checked: false },
  { id: 'query-intent', label: 'Query intent reviewed', checked: false },
  { id: 'serp-features', label: 'SERP features reviewed', checked: false },
  { id: 'competitor-movement', label: 'Competitor movement reviewed', checked: false },
  { id: 'seasonality', label: 'Seasonality considered', checked: false },
  { id: 'content-accuracy', label: 'Content accuracy reviewed', checked: false },
  { id: 'successful-sections', label: 'Existing successful sections identified', checked: false },
  { id: 'business-importance', label: 'Business importance reviewed', checked: false },
  { id: 'legal-compliance', label: 'Legal and compliance restrictions checked', checked: false },
  { id: 'measurement-window', label: 'Measurement window defined', checked: false },
  { id: 'rollback-condition', label: 'Rollback condition defined', checked: false },
  { id: 'human-approval', label: 'Human approval recorded', checked: false },
];

interface HumanReviewChecklistProps {
  onApprovalChange?: (approved: boolean) => void;
}

export default function HumanReviewChecklist({ onApprovalChange }: HumanReviewChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);

  const handleToggle = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updated);

    const humanApproval = updated.find(i => i.id === 'human-approval');
    onApprovalChange?.(humanApproval?.checked ?? false);
  };

  const completedCount = items.filter(i => i.checked).length;
  const totalCount = items.length;
  const allApproved = items.every(i => i.checked);
  const humanApproved = items.find(i => i.id === 'human-approval')?.checked ?? false;

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-violet-400" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-slate-100">Verification Steps</h3>
        </div>
        <span className="text-sm text-slate-400">
          {completedCount} / {totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-label={`${completedCount} of ${totalCount} checklist items completed`}
        />
      </div>

      <fieldset>
        <legend className="sr-only">Human-review checklist</legend>
        <div className="space-y-2">
          {items.map((item) => {
            const isLast = item.id === 'human-approval';
            return (
              <label
                key={item.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-700/40 ${
                  isLast ? 'mt-4 border border-dashed border-slate-600' : ''
                } ${item.checked ? 'bg-slate-700/20' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleToggle(item.id)}
                  className="sr-only"
                  aria-label={item.label}
                />
                <span
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                    item.checked
                      ? 'border-violet-500 bg-violet-500 text-white'
                      : 'border-slate-500 bg-slate-700'
                  }`}
                  aria-hidden="true"
                >
                  {item.checked && <CheckCircle2 className="h-3.5 w-3.5" />}
                </span>
                <span className={`text-sm ${item.checked ? 'text-slate-300 line-through' : 'text-slate-200'}`}>
                  {item.label}
                </span>
                {isLast && !humanApproved && (
                  <span className="ml-auto text-xs text-amber-400">Required to approve</span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Approval status */}
      <div className={`mt-4 rounded-lg p-3 text-center text-sm font-medium ${
        allApproved
          ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/30'
          : humanApproved
            ? 'bg-amber-900/30 text-amber-300 border border-amber-500/30'
            : 'bg-slate-700/40 text-slate-400'
      }`}>
        {allApproved
          ? '✓ All checks complete — recommendation approved'
          : humanApproved
            ? 'Human approval recorded — complete remaining checks'
            : 'Complete all checks and record human approval'
        }
      </div>
    </div>
  );
}
