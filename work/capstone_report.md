# Can Historical Search Signals Prioritise Pages for Content Review? A Leakage-Safe Grouped-Client Study

**Author:** Zafar Ullah  
**Lane:** Refresh / Content Opportunity Scoring  
**Repo:** https://github.com/Zafar488/flyrank-ml-internship  
**Deployed paper:** https://zafar488.github.io/flyrank-ml-internship/  
**Date:** 2026-07-30  

## Abstract

This study asks whether historical search-performance signals can prioritise eligible content pages for human review. Using 9,841,378 daily warehouse rows from March 2026, it creates 34,038 eligible anonymised client-page records from separated feature and outcome windows. A transparent ML-07 baseline, Logistic Regression, and Random Forest are evaluated on the same grouped-client holdout, while a deliberate future-field experiment audits leakage. Logistic Regression measured a Precision@50 of 0.640 compared with 0.520 for the frozen baseline, while the validation base rate was 0.301. The observed result supports directional human decision-support and does not establish causal refresh impact, guaranteed recovery, or automatic editing.

## 1. Problem Framing

Can historical prediction-time search-performance signals rank eligible content pages so that the first 50 human-reviewed pages contain a higher observed later-decline rate than a transparent fixed-rule baseline?

The output is a ranked page-review queue. A human uses the score,
action, reason code, and confidence note to decide what to inspect
first. A wrong call can waste editorial capacity or damage existing
visibility, so no page change is automatic.

## 2. Data Safety

The analysis uses the March 2026 daily performance partition.
Features use 2026-03-01 to 2026-03-15; the proxy outcome uses
2026-03-16 to 2026-03-31. Public outputs exclude client names,
raw URLs, domains, private queries, tokens, and direct business
identifiers.

## 3. Baseline

The frozen baseline uses 70% position-adjusted CTR weakness and 30%
visibility percentile, with training-only references.

Grouped-holdout Precision@50: 0.520.

## 4. Model / Analysis

Selected method: Logistic Regression.  
Features: log_feature_impressions, feature_clicks, feature_ctr, feature_avg_position, feature_active_days, feature_position_volatility, position_band.  
Target: later average daily impressions below 80% of the feature-window
average.  
Validation: grouped by anonymised client, seed 42, test size
0.25.

## 5. Evaluation

Validation base rate: 0.301.  
Model Precision@50: 0.640.  
Baseline Precision@50: 0.520.  
Absolute measured difference: 0.120.  
Average Precision: 0.3939.  
ROC-AUC: 0.6175.  
Client overlap: 0.  
Top-50 proxy positives: 32.  

At the diagnostic threshold, accuracy was 0.562
versus majority accuracy 0.699; the ranked queue is
the useful product.

## 6. Interpretation

The model relied most on CTR, position band, average position, and
position volatility. These are measured model-reliance signals, not
causal effects.

## 7. Recommendation

The action playbook supports CTR review, expansion review, refresh
review, protect, monitor, manual review, and no immediate action.
Every action requires page-level human verification.

## 8. Reproducibility

```bash
git clone https://github.com/Zafar488/flyrank-ml-internship
cd flyrank-ml-internship
pip install -r requirements.txt
jupyter nbconvert --execute --to notebook --inplace work/notebooks/capstone.ipynb
```

Seed: 42. Dataset access requires HF_TOKEN.

## Limitations

On one grouped-client holdout, Logistic Regression measured a Precision@50 of 0.640, compared with 0.520 for the frozen ML-07 baseline, an absolute measured difference of 0.120. This observed result supports directional human decision-support for content-review prioritisation within the March 2026 evaluation design. It does not establish causal refresh impact, guarantee future performance, or support automatic content changes.

## Acknowledgments and Data Credit

Built on the [FlyRank ML Internship dataset](https://flyrank.ai).
