
const LIMITATIONS = [
  'Results come from one grouped-client March 2026 validation design.',
  'The target is a later-impression decline proxy, not content quality.',
  'Feature window: March 1–15, 2026. Outcome window: March 16–31, 2026.',
  'Accuracy and F1 are diagnostic threshold metrics. Precision@50 is the primary operational metric.',
  'Feature importance is directional, not causal.',
  'The model does not predict Google\'s algorithm.',
  'The model does not establish causal refresh impact.',
  'Risk categories are explanatory interface categories, not validated production thresholds.',
  'CTR categories are interface demonstration categories, not universal SEO benchmarks.',
  'Content quality is not directly measured.',
  'No new result or unsupported metric may be invented.',
];

export default function LimitationsPanel() {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-sm">
      <ul className="space-y-2" role="list">
        {LIMITATIONS.map((limitation, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-400" aria-hidden="true" />
            {limitation}
          </li>
        ))}
      </ul>
    </div>
  );
}
