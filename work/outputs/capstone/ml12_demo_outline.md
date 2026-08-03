# Five-Minute Demo Outline

## 0:00–0:35 — Problem
Large websites contain more pages than a content team can inspect in one
cycle. The project supports the decision of which eligible pages a human
reviewer should inspect first.

## 0:35–1:15 — Data and Safety
The study used 9,841,378 anonymised
daily records from March 2026, producing 34,038 eligible
client-page rows across 32 clients.
Features use March 1–15 and the outcome proxy uses March 16–31. No client
names, domains, URLs, private queries, or credentials are published.

## 1:15–2:10 — Method
The model uses seven prediction-time features. A frozen baseline combines
70% position-adjusted CTR weakness and 30% visibility percentile.
Logistic Regression and Random Forest are evaluated on the same
grouped-client holdout with zero client overlap.

## 2:10–3:15 — Results
The validation base rate was 0.301. The frozen
baseline measured Precision@50 of 0.520, while
Logistic Regression measured 0.640. The first 50
model-ranked pages contained 32 later-decline proxy
positives. Diagnostic accuracy was 0.562, below the
majority rate of 0.699, so the model is presented as a
ranked queue rather than an automatic classifier.

## 3:15–4:00 — Leakage Audit
Honest Average Precision was
0.3939. A deliberately invalid
future-derived feature raised AP to
0.9999. This near-perfect score
was rejected because it uses the outcome period.

## 4:00–4:40 — Action Playbook
The validated score is translated into reason-coded actions such as CTR
Review, Refresh Review, Protect, Monitor, and Manual Review. Every
recommendation requires human verification and no page is edited
automatically.

## 4:40–5:00 — Limits and Close
The result is observed, measured, and directional. It does not prove
causal refresh impact, Google's algorithm, guaranteed recovery, revenue,
or ROI. The live paper, notebook, figures, receipts, and model are
available in the repository.
