# FlyRank Content Review Assistant

**Author:** Zafar Ullah  
**Research Lane:** Refresh / Content Opportunity Scoring  
**Capstone:** General AI Fluency Impact Project

---

## Overview

A professional, public-safe web application that converts page-level search metrics and a precomputed machine-learning risk score into structured content-review recommendations. This is a **human decision-support tool** — it does not make automatic changes, predict Google's algorithm, or guarantee outcomes.

### Key Principles

- **Human-in-the-Loop** — every recommendation requires explicit human approval
- **Leakage-Aware** — validated against deliberately leaked scores
- **Public-Safe** — no client names, domains, or private data
- **Decision Support** — measured review priority, not traffic predictions
- **No Automatic Changes** — the tool never edits, publishes, or deletes content

## Quality Improvements Pass Summary

1. **Whitespace Trimming:** `.trim()` applied to Page Reference (`"   Guide A   "` → `"Guide A"`), Reviewer Notes, and Content Context before validation, analysis, narrative generation, and report export.
2. **Numeric Normalisation:** Leading zeroes removed on blur (`072` → `72`, `000.5` → `0.5`). Optional baseline score remains `null` when empty.
3. **Heading Hierarchy Polish:** Duplicate section titles removed across parent page and child components.
4. **Chart Labels & Accessibility:** Recharts Bar chart displays exact values (`0.520`, `0.640`, `0.560`) using `<LabelList>` with an accessible textual summary beneath.
5. **Card & Narrative Hierarchy:** Reason Code card displays a concise (max 2-sentence) rule match summary; full explanation section displays detailed breakdown without repeating identical sentences.
6. **Reviewer Notes Export Privacy:** Reviewer notes excluded from exported report by default; included only after explicit checkbox selection and public-safety validation.
7. **Research Paper Link Deployment Flag:** `VITE_RESEARCH_PAPER_AVAILABLE=true/false` support; when false displays as "Research Paper — Deployment Pending" with disabled navigation.
8. **Dual-Language Switching:** English and Roman Urdu switching supported with clean narrative updates.

## Research Background

This assistant extends validated research from the FlyRank ML Internship. Key metrics:

| Metric | Value |
|---|---|
| Source daily records | 9,841,378 |
| Eligible analytical pages | 34,038 |
| Baseline Precision@50 | 0.520 |
| Logistic Regression Precision@50 | **0.640** |
| Random Forest Precision@50 | 0.560 |
| Selected model | Logistic Regression |
| Client overlap (train/validation) | 0 |
| Validation positive base rate | 0.3008 |

## Responsible-Use Statement

This result is decision support only. It does not predict Google's algorithm, establish causal refresh impact, guarantee ranking, CTR, traffic, conversion, or revenue improvement, or authorise automatic content changes. The final decision always belongs to a human reviewer.

## Folder Structure

```
apps/content-review-assistant/
├── public/
├── src/
│   ├── components/         # 13 UI components
│   ├── data/               # Research metrics, reason codes, translations, examples, links
│   ├── engine/             # Deterministic validation, metrics, reason codes, actions, narrative
│   ├── pages/              # Main page
│   ├── types/              # TypeScript type definitions
│   ├── tests/              # Vitest test suites (61 tests passed)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── DEPLOYMENT.md
```

## Installation

```bash
cd apps/content-review-assistant
npm install
```

## Development

```bash
npm run dev
```

Opens at `http://localhost:5173`.

## Tests

```bash
npm run test
```

61 tests passing across 4 test suites: `validation.test.ts`, `derivedMetrics.test.ts`, `reasonCodeEngine.test.ts`, `integration.test.ts`.

### Required Precedence Test

- **Input:** risk 0.743, position 8.38, CTR 0, impressions 943, volatility 11.92
- **Expected:** `CTR_GAP_HIGH_VISIBILITY`, Rule 1, CTR Review

A Page-1 page with low CTR and high volatility receives `CTR_GAP_HIGH_VISIBILITY` because Rule 1 precedes the volatility rule.

## Build

```bash
npm run build
```

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_ENABLE_AI_NARRATIVE` | `false` | Enable optional AI explanation layer |
| `VITE_AI_API_ENDPOINT` | *(empty)* | AI API endpoint (when enabled) |
| `VITE_PORTFOLIO_URL` | *(empty)* | Portfolio link in the footer |
| `VITE_RESEARCH_PAPER_AVAILABLE` | `true` | Set to false if research paper URL is pending verification |

## Privacy

- No permanent storage
- Browser memory only
- No login, database, or cookies for analysis
- Reviewer notes excluded from exports by default
- No analytics capturing form inputs
- No external API request by default
- No raw FlyRank data access

## Reason-Code Precedence

Rules are evaluated in strict order:

| Rule | Code | Action |
|---|---|---|
| 0 | OUTSIDE_VALIDATED_POPULATION | Manual Review |
| 1 | CTR_GAP_HIGH_VISIBILITY | CTR Review |
| 2 | HIGH_VALUE_PAGE_2 | Expand and Optimise |
| 3 | HIGH_RISK_HIGH_VOLATILITY | Refresh Review |
| 4 | HIGH_RISK_STABLE_PAGE_1 | Refresh and Protect |
| 5 | LOW_RISK_HIGH_VISIBILITY | Protect |
| 6 | BORDERLINE_MEASURED_RISK | Monitor |
| Fallback | HIGH_RISK_NO_CLEAR_ARCHETYPE | Manual Review |

## Portfolio Integration

Set `VITE_PORTFOLIO_URL` in your environment to link to your portfolio page.

## Research Links

- **Research Paper:** https://zafar488.github.io/flyrank-ml-internship/
- **GitHub Repository:** https://github.com/Zafar488/flyrank-ml-internship
- **Contact:** zafarullah1385@gmail.com
