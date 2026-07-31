import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { FlaskConical, Database, Users, FileSearch, AlertTriangle } from 'lucide-react';
import {
  RESEARCH_METRICS,
  PRECISION_CHART_DATA,
  DIAGNOSTIC_TABLE_DATA,
  LEAKAGE_COMPARISON,
  TOP50_RESULTS,
  RESEARCH_FRAMING,
} from '../data/researchMetrics';

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-700/40 bg-slate-800/30 p-4 text-center">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20">
        {icon}
      </div>
      <p className="text-xl font-bold text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}

const BAR_COLORS = ['#64748b', '#818cf8', '#6366f1'];

export default function ResearchEvidence() {
  const chartTextSummary =
    'Logistic Regression measured the highest Precision@50 at 0.640, compared with 0.520 for the frozen baseline and 0.560 for Random Forest.';

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<Database className="h-5 w-5 text-indigo-400" />}
            value={RESEARCH_METRICS.sourceDailyRecords.toLocaleString()}
            label="Anonymised daily records"
          />
          <StatCard
            icon={<FileSearch className="h-5 w-5 text-indigo-400" />}
            value={RESEARCH_METRICS.uniqueClientPagePairs.toLocaleString()}
            label="Unique client-page pairs"
          />
          <StatCard
            icon={<FileSearch className="h-5 w-5 text-indigo-400" />}
            value={RESEARCH_METRICS.eligibleAnalyticalPages.toLocaleString()}
            label="Eligible analytical pages"
          />
          <StatCard
            icon={<Users className="h-5 w-5 text-indigo-400" />}
            value={RESEARCH_METRICS.eligibleAnonymisedClients.toString()}
            label="Eligible anonymised clients"
          />
          <StatCard
            icon={<Users className="h-5 w-5 text-indigo-400" />}
            value={RESEARCH_METRICS.clientOverlap.toString()}
            label="Client overlap"
          />
          <StatCard
            icon={<FlaskConical className="h-5 w-5 text-indigo-400" />}
            value="0.520"
            label="Baseline Precision@50"
          />
          <StatCard
            icon={<FlaskConical className="h-5 w-5 text-indigo-400" />}
            value="0.640"
            label="LR Precision@50"
          />
          <StatCard
            icon={<FlaskConical className="h-5 w-5 text-indigo-400" />}
            value={TOP50_RESULTS.proxyPositivePages.toString()}
            label="Proxy-positive in top 50"
          />
        </div>
      </div>

      {/* Precision@50 Chart */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-100">Model Comparison — Precision@50</h3>
        <div className="h-72" role="img" aria-label={`Model Comparison Chart: ${chartTextSummary}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PRECISION_CHART_DATA} margin={{ top: 25, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 1]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                }}
                formatter={(value: any) => [typeof value === 'number' ? value.toFixed(3) : String(value), 'Precision@50']}
              />
              <Bar dataKey="precision" radius={[6, 6, 0, 0]} maxBarSize={80}>
                <LabelList
                  dataKey="precision"
                  position="top"
                  formatter={(val: any) => (typeof val === 'number' ? val.toFixed(3) : String(val))}
                  fill="#cbd5e1"
                  fontSize={13}
                  fontWeight="bold"
                />
                {PRECISION_CHART_DATA.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-xs font-medium leading-relaxed text-slate-300">
          {chartTextSummary}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {RESEARCH_FRAMING.primaryMetricRationale} Results come from one grouped-client March 2026 validation design.
        </p>
      </div>

      {/* Diagnostic Table */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-100">Diagnostic Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label="Diagnostic metrics table">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="py-2 pr-4 text-left font-medium text-slate-400">Metric</th>
                <th className="py-2 text-right font-medium text-slate-400">Value</th>
              </tr>
            </thead>
            <tbody>
              {DIAGNOSTIC_TABLE_DATA.map((row) => (
                <tr key={row.metric} className="border-b border-slate-700/50">
                  <td className="py-2 pr-4 text-slate-300">{row.metric}</td>
                  <td className="py-2 text-right font-mono text-slate-200">{row.value.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {RESEARCH_FRAMING.diagnosticNote} {RESEARCH_FRAMING.primaryMetricRationale}
        </p>
      </div>

      {/* Leakage Comparison */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-6 backdrop-blur-sm">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-amber-200">Leakage Comparison</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-500/20 bg-slate-800/40 p-4">
            <p className="text-xs text-slate-400">Honest Average Precision</p>
            <p className="mt-1 text-2xl font-bold text-emerald-300">
              {LEAKAGE_COMPARISON.honestAveragePrecision.toFixed(4)}
            </p>
            <p className="mt-1 text-xs text-emerald-400">Valid — no future information</p>
          </div>
          <div className="rounded-lg border border-red-500/20 bg-slate-800/40 p-4">
            <p className="text-xs text-slate-400">Leaky Average Precision</p>
            <p className="mt-1 text-2xl font-bold text-red-300">
              {LEAKAGE_COMPARISON.leakyAveragePrecision.toFixed(4)}
            </p>
            <p className="mt-1 text-xs text-red-400">Invalid — uses future-derived information</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-amber-200">
          The leaky score is invalid because it uses future-derived information.
          This comparison demonstrates why temporal leakage validation is essential.
        </p>
      </div>
    </div>
  );
}
