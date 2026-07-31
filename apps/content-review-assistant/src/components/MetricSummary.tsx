import type { DerivedMetrics, PageInput, OutputLanguage } from '../types/agent';
import { TRANSLATIONS } from '../data/translations';
import RiskBadge from './RiskBadge';
import {
  Activity, Eye, MousePointerClick, MapPin, TrendingUp, BarChart3, AlertCircle,
} from 'lucide-react';

interface MetricSummaryProps {
  input: PageInput;
  derived: DerivedMetrics;
  language: OutputLanguage;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
}

function MetricCard({ icon, label, value, sublabel }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-lg font-bold text-slate-100">{value}</p>
      {sublabel && <p className="mt-0.5 text-xs text-slate-400">{sublabel}</p>}
    </div>
  );
}

export default function MetricSummary({ input, derived, language }: MetricSummaryProps) {
  const t = TRANSLATIONS[language];
  const ctrPct = (derived.ctr * 100).toFixed(4);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <RiskBadge level={derived.riskLevel} size="lg" />
        <span className="text-sm text-slate-400">
          {t.humanReviewRequired}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <MetricCard
          icon={<BarChart3 className="h-4 w-4" aria-hidden="true" />}
          label="Model Score"
          value={input.modelRiskScore.toFixed(3)}
          sublabel={derived.riskLevel}
        />
        {input.baselineScore !== null && (
          <MetricCard
            icon={<Activity className="h-4 w-4" aria-hidden="true" />}
            label="Baseline Score"
            value={input.baselineScore.toString()}
          />
        )}
        <MetricCard
          icon={<MousePointerClick className="h-4 w-4" aria-hidden="true" />}
          label="CTR"
          value={`${ctrPct}%`}
          sublabel={derived.ctrCategory}
        />
        <MetricCard
          icon={<MapPin className="h-4 w-4" aria-hidden="true" />}
          label="Position"
          value={input.averagePosition.toFixed(2)}
          sublabel={derived.positionBand}
        />
        <MetricCard
          icon={<Eye className="h-4 w-4" aria-hidden="true" />}
          label="Impressions"
          value={input.impressions.toLocaleString()}
          sublabel={derived.visibilityLevel}
        />
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" aria-hidden="true" />}
          label="Volatility"
          value={input.positionVolatility.toFixed(2)}
          sublabel={derived.volatilityLevel}
        />
        <MetricCard
          icon={<Activity className="h-4 w-4" aria-hidden="true" />}
          label="Active Days"
          value={`${input.activeDays} / ${input.availableDays}`}
          sublabel="Active / Available"
        />
        <MetricCard
          icon={<AlertCircle className="h-4 w-4" aria-hidden="true" />}
          label="Scope Status"
          value={derived.studyScopeStatus}
        />
      </div>

      <p className="mt-3 text-xs italic text-slate-500">
        {t.ctrDisclaimer} {t.riskDisclaimer}
      </p>
    </div>
  );
}
