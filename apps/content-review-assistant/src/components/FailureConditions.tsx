import { AlertTriangle } from 'lucide-react';

const BASE_FAILURE_CONDITIONS = [
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
];

interface FailureConditionsProps {
  isOutsideScope?: boolean;
}

export default function FailureConditions({ isOutsideScope = false }: FailureConditionsProps) {
  const conditions = isOutsideScope
    ? [...BASE_FAILURE_CONDITIONS, 'Input outside the validated population']
    : BASE_FAILURE_CONDITIONS;

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-amber-200">
          Potential Risk Factors
        </h3>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2" role="list">
        {conditions.map((condition) => (
          <li key={condition} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
            {condition}
          </li>
        ))}
      </ul>
    </div>
  );
}
