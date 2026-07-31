import { useState, useRef, useCallback } from 'react';
import {
  Sparkles, BookOpen, ExternalLink, Mail, Code, User,
  Shield, AlertTriangle, Zap, Lock, Ban, Lightbulb, Workflow, Info, Beaker,
} from 'lucide-react';
import type { PageInput, ReviewResult, OutputLanguage } from '../types/agent';
import { generateReview } from '../engine/narrativeEngine';
import { RESEARCH_URL, GITHUB_URL, CONTACT_EMAIL, PORTFOLIO_URL, isResearchPaperAvailable } from '../data/links';

import AgentInputForm from '../components/AgentInputForm';
import MetricSummary from '../components/MetricSummary';
import ReasonCodeCard from '../components/ReasonCodeCard';
import ActionRecommendation from '../components/ActionRecommendation';
import HumanReviewChecklist from '../components/HumanReviewChecklist';
import FailureConditions from '../components/FailureConditions';
import ResearchEvidence from '../components/ResearchEvidence';
import WorkflowDiagram from '../components/WorkflowDiagram';
import ResponsibleAISection from '../components/ResponsibleAISection';
import LimitationsPanel from '../components/LimitationsPanel';
import ExampleLoader from '../components/ExampleLoader';
import ReportExport from '../components/ReportExport';

const BADGES = [
  { icon: Shield, label: 'Human-in-the-Loop', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { icon: AlertTriangle, label: 'Leakage-Aware', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { icon: Lock, label: 'Public-Safe', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  { icon: Zap, label: 'Decision Support', color: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
  { icon: Ban, label: 'No Automatic Changes', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
];

export default function ContentReviewAssistant() {
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [prefill, setPrefill] = useState<PageInput | null>(null);
  const [language, setLanguage] = useState<OutputLanguage>('en');
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback((input: PageInput) => {
    const review = generateReview(input);
    setResult(review);
    setLanguage(input.outputLanguage);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleClear = useCallback(() => {
    setResult(null);
    setPrefill(null);
  }, []);

  const handleLoadExample = useCallback((input: PageInput) => {
    setPrefill(input);
  }, []);

  const isUr = language === 'ur';
  const paperAvailable = isResearchPaperAvailable();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* ─── 1. Hero ─── */}
      <header className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-transparent to-violet-950/30" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-indigo-400" aria-hidden="true" />
            <span className="text-sm font-medium text-indigo-300 uppercase tracking-wider">
              General AI Fluency Capstone
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            FlyRank Content Review Assistant
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300 sm:text-xl">
            Turn historical search signals into a clear, human-reviewed content action plan.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {BADGES.map(b => (
              <span
                key={b.label}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${b.color}`}
              >
                <b.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-16">
        {/* ─── 2. Research Context ─── */}
        <section id="research-context" aria-labelledby="research-ctx">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Background</span>
          <h2 id="research-ctx" className="mb-3 text-2xl font-bold text-slate-100">Research Context</h2>
          <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-sm">
            <p className="text-sm leading-relaxed text-slate-300">
              This assistant extends validated research from the FlyRank Machine Learning Internship —
              Refresh / Content Opportunity Scoring lane. It converts page-level search metrics and a
              precomputed machine-learning risk score into structured review recommendations. The
              feature window is March 1–15, 2026. The outcome window is March 16–31, 2026. The target
              is a later-impression decline proxy — not content quality. Results come from one
              grouped-client March 2026 validation design.
            </p>
          </div>
        </section>

        {/* ─── 3. Input Form ─── */}
        <section id="page-analysis" aria-labelledby="input-form">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Interactive Tool</span>
          <h2 id="input-form" className="mb-3 text-2xl font-bold text-slate-100">Page Analysis</h2>
          <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-sm">
            <AgentInputForm onSubmit={handleSubmit} prefill={prefill} />
          </div>
        </section>

        {/* ─── 5. Results Dashboard ─── */}
        {result && (
          <div ref={resultsRef} className="space-y-8" aria-live="polite">
            <section id="results" aria-labelledby="results-heading">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Analysis Output</span>
              <h2 id="results-heading" className="mb-4 text-2xl font-bold text-slate-100">
                {isUr ? 'Review Summary' : 'Results Dashboard'}
              </h2>

              <MetricSummary input={result.input} derived={result.derived} language={language} />

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <ReasonCodeCard result={result.reasonCode} language={language} />
                <ActionRecommendation
                  result={result.reasonCode}
                  actions={result.actions}
                  language={language}
                />
              </div>

              {/* Full Narrative Explanation */}
              <div className="mt-6 rounded-xl border border-slate-700/60 bg-slate-800/50 p-5 backdrop-blur-sm">
                <h3 className="mb-3 text-sm font-semibold text-slate-300">
                  {isUr ? 'Why This Page Was Flagged' : 'Detailed Explanation'}
                </h3>
                <p className="text-sm leading-relaxed text-slate-300">
                  {isUr ? result.explanationUr : result.explanation}
                </p>
                <div className="mt-4 rounded-lg border border-sky-500/20 bg-sky-950/20 p-3">
                  <p className="text-xs text-sky-200">
                    <strong>{isUr ? 'Human Review Note' : 'Confidence note'}:</strong>{' '}
                    {isUr ? result.confidenceNoteUr : result.confidenceNote}
                  </p>
                </div>
              </div>

              {/* Responsible-use warning in result */}
              <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3">
                <p className="text-xs text-emerald-200">
                  <strong>{isUr ? 'Responsible-Use Warning' : 'Responsible-use warning'}:</strong>{' '}
                  {isUr ? result.responsibleUseWarningUr : result.responsibleUseWarning}
                </p>
              </div>

              {/* Export / Clear */}
              <div className="mt-6">
                <ReportExport result={result} language={language} onClear={handleClear} />
              </div>
            </section>

            {/* ─── 6. Human-Review Checklist ─── */}
            <section id="checklist" aria-labelledby="checklist-heading">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">Quality Assurance</span>
              <h2 id="checklist-heading" className="mb-4 text-2xl font-bold text-slate-100">
                {isUr ? 'Human Review Checklist' : 'Human-Review Checklist'}
              </h2>
              <HumanReviewChecklist />
            </section>

            {/* ─── 7. Failure Conditions ─── */}
            <section id="failure-conditions" aria-labelledby="failure-heading">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Risk Assessment</span>
              <h2 id="failure-heading" className="mb-4 text-2xl font-bold text-slate-100">
                {isUr ? 'What Could Make the Recommendation Wrong' : 'What Could Make This Recommendation Wrong'}
              </h2>
              <FailureConditions isOutsideScope={result.derived.studyScopeStatus === 'Outside validated population'} />
            </section>
          </div>
        )}

        {/* ─── 8. How the Assistant Works ─── */}
        <section id="how-it-works" aria-labelledby="workflow-heading">
          <div className="mb-3 flex items-center gap-2">
            <Workflow className="h-5 w-5 text-teal-400" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">Methodology</span>
          </div>
          <h2 id="workflow-heading" className="mb-4 text-2xl font-bold text-slate-100">How the Assistant Works</h2>
          <WorkflowDiagram />
        </section>

        {/* ─── 9–10. Research Evidence ─── */}
        <section id="research-evidence" aria-labelledby="evidence-heading">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-400" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Validation Results</span>
          </div>
          <h2 id="evidence-heading" className="mb-4 text-2xl font-bold text-slate-100">Research Evidence</h2>
          <ResearchEvidence />
        </section>

        {/* ─── 11. Responsible AI ─── */}
        <section id="responsible-ai" aria-labelledby="responsible-ai-heading">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Ethics & Guardrails</span>
          </div>
          <h2 id="responsible-ai-heading" className="mb-4 text-2xl font-bold text-slate-100">Responsible AI</h2>
          <ResponsibleAISection language={language} />
        </section>

        {/* ─── 12. Limitations ─── */}
        <section id="limitations" aria-labelledby="limitations-heading">
          <div className="mb-3 flex items-center gap-2">
            <Info className="h-5 w-5 text-sky-400" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">Scope & Constraints</span>
          </div>
          <h2 id="limitations-heading" className="mb-4 text-2xl font-bold text-slate-100">Limitations</h2>
          <LimitationsPanel />
        </section>

        {/* ─── 13. Example ─── */}
        <section id="example-analysis" aria-labelledby="example-heading">
          <div className="mb-3 flex items-center gap-2">
            <Beaker className="h-5 w-5 text-fuchsia-400" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider text-fuchsia-400">Demonstration</span>
          </div>
          <h2 id="example-heading" className="mb-4 text-2xl font-bold text-slate-100">Example Analysis</h2>
          <ExampleLoader onLoad={handleLoadExample} />
        </section>

        {/* ─── 14. About ─── */}
        <section id="about-author" aria-labelledby="about-heading">
          <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-400" aria-hidden="true" />
              <h2 id="about-heading" className="text-xl font-bold text-slate-100">Built by Zafar Ullah</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Zafar Ullah is an AI and Machine Learning developer focused on practical, transparent,
              and human-centred AI systems. This assistant extends his FlyRank Machine Learning capstone
              by converting validated model outputs into a structured content-review workflow.
            </p>
          </div>
        </section>

        {/* ─── 15. General AI Fluency Impact Project ─── */}
        <section id="fluency-project" aria-labelledby="fluency-heading">
          <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-400" aria-hidden="true" />
              <h2 id="fluency-heading" className="text-xl font-bold text-slate-100">
                General AI Fluency Impact Project
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-indigo-300">Problem</h3>
                <p className="text-sm text-slate-300">
                  Search metrics and model scores required manual interpretation.
                </p>

                <h3 className="mb-2 mt-4 text-sm font-semibold text-indigo-300">Solution</h3>
                <p className="text-sm text-slate-300">
                  A deterministic personal agent converts measurements into a reason code, action,
                  evidence summary, checklist, uncertainty note, and responsible-use warning.
                </p>

                <h3 className="mb-2 mt-4 text-sm font-semibold text-emerald-300">AI Role</h3>
                <p className="text-sm text-slate-300">
                  AI may improve explanation only. It cannot override the deterministic engine.
                </p>

                <h3 className="mb-2 mt-4 text-sm font-semibold text-cyan-300">Human Role</h3>
                <p className="text-sm text-slate-300">
                  A human remains accountable for every action.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-200">Before → After</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-red-500/20 bg-red-950/10 p-3">
                    <p className="mb-2 font-semibold text-red-300">Before</p>
                    <ul className="space-y-1 text-slate-400">
                      <li>• Manual metric interpretation</li>
                      <li>• Inconsistent reasoning</li>
                      <li>• Limitations could be overlooked</li>
                      <li>• Human checks were scattered</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/10 p-3">
                    <p className="mb-2 font-semibold text-emerald-300">After</p>
                    <ul className="space-y-1 text-slate-400">
                      <li>• Validated input</li>
                      <li>• Consistent reason codes</li>
                      <li>• Clear actions</li>
                      <li>• Visible uncertainty</li>
                      <li>• Structured human-review checklist</li>
                      <li>• No automatic changes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 16. Links ─── */}
        <section id="external-links" aria-labelledby="links-heading">
          <h2 id="links-heading" className="mb-4 text-2xl font-bold text-slate-100">Links</h2>
          <div className="flex flex-wrap gap-3">
            {paperAvailable ? (
              <a
                href={RESEARCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-indigo-500 hover:text-indigo-300"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" /> Research Paper
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            ) : (
              <span
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed"
                title="Research paper deployment is pending verification"
                aria-disabled="true"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" /> Research Paper — Deployment Pending
              </span>
            )}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-indigo-500 hover:text-indigo-300"
            >
              <Code className="h-4 w-4" aria-hidden="true" /> GitHub
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
            {PORTFOLIO_URL !== '#portfolio' && (
              <a
                href={PORTFOLIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-indigo-500 hover:text-indigo-300"
              >
                <User className="h-4 w-4" aria-hidden="true" /> Portfolio
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
            <a
              href={CONTACT_EMAIL}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-indigo-500 hover:text-indigo-300"
            >
              <Mail className="h-4 w-4" aria-hidden="true" /> Contact
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-500 sm:px-6">
          <p>FlyRank Content Review Assistant — Built by Zafar Ullah</p>
          <p className="mt-1">Decision support only. The final decision always belongs to a human reviewer.</p>
        </div>
      </footer>
    </div>
  );
}
