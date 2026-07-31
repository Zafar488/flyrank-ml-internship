import { Target } from 'lucide-react';
import type { ReasonCodeResult, HumanAction, OutputLanguage } from '../types/agent';

interface ActionRecommendationProps {
  result: ReasonCodeResult;
  actions: HumanAction[];
  language: OutputLanguage;
}

export default function ActionRecommendation({ result, actions, language }: ActionRecommendationProps) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-5 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-cyan-500/20 p-2">
          <Target className="h-5 w-5 text-cyan-400" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-slate-400">Recommended Action</h3>
          <p className="mt-1 text-xl font-bold text-cyan-300">{result.action}</p>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="mb-3 text-sm font-semibold text-slate-300">Human-Review Actions</h4>
        <ul className="space-y-2">
          {actions.map((action) => (
            <li
              key={action.id}
              className="flex items-start gap-2 text-sm text-slate-300"
            >
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400" aria-hidden="true" />
              {language === 'ur' ? action.labelUr : action.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
