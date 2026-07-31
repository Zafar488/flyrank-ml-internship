import type { PageInput } from '../types/agent';
import { EXAMPLE_INPUT, EXAMPLE_EXPECTED } from '../data/examples';

interface ExampleLoaderProps {
  onLoad: (input: PageInput) => void;
}

export default function ExampleLoader({ onLoad }: ExampleLoaderProps) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-sm">

      <p className="mb-4 text-sm text-slate-300">
        Load a fictional public-safe example to see how the assistant works.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-lg bg-slate-700/40 p-3">
          <span className="block text-xs text-slate-400">Expected Code</span>
          <span className="font-mono text-xs font-semibold text-fuchsia-300">{EXAMPLE_EXPECTED.reasonCode}</span>
        </div>
        <div className="rounded-lg bg-slate-700/40 p-3">
          <span className="block text-xs text-slate-400">Expected Action</span>
          <span className="text-xs font-semibold text-cyan-300">{EXAMPLE_EXPECTED.action}</span>
        </div>
        <div className="rounded-lg bg-slate-700/40 p-3">
          <span className="block text-xs text-slate-400">Expected Risk</span>
          <span className="text-xs font-semibold text-red-300">{EXAMPLE_EXPECTED.riskLevel}</span>
        </div>
        <div className="rounded-lg bg-slate-700/40 p-3">
          <span className="block text-xs text-slate-400">Human Review</span>
          <span className="text-xs font-semibold text-amber-300">{EXAMPLE_EXPECTED.humanReview}</span>
        </div>
      </div>

      <p className="mb-4 rounded-lg border border-fuchsia-500/20 bg-fuchsia-950/20 p-3 text-xs text-fuchsia-200">
        This is a fictional public-safe demonstration and does not represent a real client or webpage.
      </p>

      <button
        onClick={() => onLoad(EXAMPLE_INPUT)}
        className="rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:from-fuchsia-500 hover:to-violet-500 hover:shadow-fuchsia-500/25 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-[0.98]"
        aria-label="Load example analysis"
      >
        Load Example
      </button>
    </div>
  );
}
