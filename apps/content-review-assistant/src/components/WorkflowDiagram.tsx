import { ArrowRight } from 'lucide-react';

const STEPS = [
  {
    num: 1,
    title: 'Input',
    desc: 'Enter page-level search metrics and model risk score.',
  },
  {
    num: 2,
    title: 'Validate',
    desc: 'Input is validated against safety rules and study-scope boundaries.',
  },
  {
    num: 3,
    title: 'Derive',
    desc: 'CTR, position band, visibility, volatility, and risk level are computed.',
  },
  {
    num: 4,
    title: 'Classify',
    desc: 'The deterministic reason-code engine evaluates 8 rules in strict order.',
  },
  {
    num: 5,
    title: 'Recommend',
    desc: 'A review action, checklist, and failure conditions are generated.',
  },
  {
    num: 6,
    title: 'Review',
    desc: 'A human reviewer completes the checklist and records approval.',
  },
];

export default function WorkflowDiagram() {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step.num} className="flex items-center gap-2">
            <div className="w-36 rounded-lg border border-slate-700/40 bg-slate-800/30 p-3 text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-bold text-white">
                {step.num}
              </div>
              <h3 className="text-sm font-semibold text-slate-200">{step.title}</h3>
              <p className="mt-1 text-xs text-slate-400">{step.desc}</p>
            </div>
            {i < STEPS.length - 1 && (
              <ArrowRight className="hidden h-4 w-4 flex-shrink-0 text-slate-500 sm:block" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
