# Agent Design Summary  --  FlyRank Search Opportunity Scout

## Core Job
The agent reads page-level search-performance data and produces a ranked
content-opportunity review queue. It identifies pages with signals such as
high impressions and low CTR, striking-distance positions, declining traffic,
weak engagement, and possible content-refresh opportunities.

## Architecture Overview

```
CSV Upload
    ↓
[1] Inspect       --  shape, memory, column inventory
[2] Validate      --  alias resolution, required-field check
[3] Map Columns   --  canonical name mapping
[4] Preprocess    --  normalise, filter, derive flags
[5] Signals       --  readiness confirmation
[6] Score         --  5-component weighted engine
[7] Reason Codes  --  deterministic rule assignment
[8] Recommend     --  action from priority-ordered code list
[9] Rank          --  sort descending by opportunity_score
[10] Explain      --  plain-language hedged explanations
[11] Privacy      --  optional identifier masking
[12] Export       --  CSV + log output
```

## Scoring Engine (Transparent, Not ML-Fitted)

| Component | Weight | Description |
|---|---|---|
| CTR Opportunity | 35% | Gap between position-bucket median CTR and actual CTR |
| Striking Distance | 25% | Triangular score for positions 3 to 15, peak at 7 |
| Decline | 20% | Negative trend_pct or impression/click delta |
| Engagement Opportunity | 15% | Below-median engagement weighted by log(impressions) |
| Business Value | 5% | Log-scaled conversions + revenue signal |

Weights are user-configurable. Missing optional components redistribute
their weight proportionally to the remaining active components.

## Key Design Decisions

### No ML Fitting
All components use deterministic, readable rules  --  no sklearn model is fitted.
This makes the baseline honest, auditable, and stable.

### Leakage Prevention
- `trend_direction` and `trend_pct` are treated as input signals only.
- No future-outcome columns are used as features.
- The agent never reads data from outside the uploaded file.

### Privacy
- SHA-256 identifier hashing when Privacy Mode is enabled.
- No raw private queries are logged.
- Synthetic data is the only file committed to the repository.

### Guardrails
- Every output row carries a verbatim guardrail note.
- Recommended actions use hedged language (directional, potential, recommended for review).
- No action can publish, delete, edit, merge, or retire content.

## Spec Deviations (FL-07 Accepted)
- CSV upload is the primary live connection (GSC/GA4/BigQuery deferred).
- No Hugging Face connector in MVP.
- These deviations are documented in README and build_log.md.
