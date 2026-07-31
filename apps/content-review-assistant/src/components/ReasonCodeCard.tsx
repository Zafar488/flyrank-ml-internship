import { FileWarning } from 'lucide-react';
import type { ReasonCodeResult, OutputLanguage } from '../types/agent';

interface ReasonCodeCardProps {
  result: ReasonCodeResult;
  language: OutputLanguage;
}

export default function ReasonCodeCard({ result, language }: ReasonCodeCardProps) {
  const conciseText = language === 'ur' ? result.conciseExplanationUr : result.conciseExplanation;

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-5 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-indigo-500/20 p-2">
          <FileWarning className="h-5 w-5 text-indigo-400" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-slate-400">Reason Code</h3>
          <p className="mt-1 font-mono text-lg font-bold text-indigo-300">{result.code}</p>
          <p className="mt-1 text-sm text-slate-300">
            Rule {result.ruleIndex}{result.ruleIndex === 7 ? ' (Fallback)' : ''} — {result.action}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{conciseText}</p>
        </div>
      </div>
    </div>
  );
}
