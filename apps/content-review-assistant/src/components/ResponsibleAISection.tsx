import type { OutputLanguage } from '../types/agent';
import { TRANSLATIONS } from '../data/translations';

interface ResponsibleAISectionProps {
  language: OutputLanguage;
}

const PRINCIPLES = [
  {
    title: 'Human-in-the-Loop',
    desc: 'Every recommendation requires explicit human review and approval before action.',
    descUr: 'Har sifarish ko action se pehle human review aur approval zaruri hai.',
  },
  {
    title: 'Leakage-Aware',
    desc: 'The model was validated against deliberately leaked scores to confirm honest evaluation.',
    descUr: 'Model ko deliberately leaked scores ke khilaf validate kiya gaya taake honest evaluation confirm ho.',
  },
  {
    title: 'Public-Safe',
    desc: 'No client names, domains, private URLs, or raw queries are used or stored.',
    descUr: 'Koi client names, domains, private URLs, ya raw queries use ya store nahi hote.',
  },
  {
    title: 'Decision Support Only',
    desc: 'Results are measured review priority, not traffic improvement predictions.',
    descUr: 'Results measured review priority hain, traffic improvement predictions nahi.',
  },
  {
    title: 'No Automatic Changes',
    desc: 'This tool does not edit, publish, delete, merge, redirect, canonicalise, prune, or no-index any page.',
    descUr: 'Yeh tool koi page edit, publish, delete, merge, redirect, canonicalise, prune, ya no-index nahi karta.',
  },
];

export default function ResponsibleAISection({ language }: ResponsibleAISectionProps) {
  const t = TRANSLATIONS[language];

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-sm">

      <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-4">
        <p className="text-sm leading-relaxed text-emerald-200">
          {t.responsibleUseWarning}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRINCIPLES.map((p) => (
          <div key={p.title} className="rounded-lg border border-slate-700/40 bg-slate-800/30 p-4">
            <h3 className="mb-2 text-sm font-semibold text-emerald-300">{p.title}</h3>
            <p className="text-xs leading-relaxed text-slate-300">
              {language === 'ur' ? p.descUr : p.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
