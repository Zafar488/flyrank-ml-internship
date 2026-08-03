# Refresh and Content Opportunity Scoring Using Historical Search Signals: A Leakage-Safe Grouped-Client Machine Learning Study

**Authors:** Zafar Ullah; Afaq Ahmad Khan  
**Affiliation:** Department of Computer Science, University of Engineering & Technology Mardan, Pakistan  
**Corresponding email:** zafarullah1385@gmail.com  
**Version:** 1.3 (Pre-DOI)  
**Paper URL:** https://zafar488.github.io/flyrank-ml-internship/

## Abstract

This study asks whether historical search-performance signals can prioritise eligible content pages for human review. Using 9,841,378 anonymised daily observations from March 2026, the study creates one client-page row from an earlier feature window and evaluates a later impression-decline proxy. A transparent frozen baseline, Logistic Regression, and Random Forest are evaluated on the same grouped-client holdout with zero client overlap, while a deliberate future-derived feature audits leakage. Logistic Regression measured Precision@50 of 0.640 compared with 0.520 for the baseline and 0.540 for Random Forest, and the invalid leaked feature raised Average Precision from 0.3939 to 0.9999. The result is observational and directional and supports a reason-coded human-review queue rather than automatic editing, causal refresh claims, or guaranteed performance improvement.

## 1. Introduction and Problem Statement

Can historical prediction-time search-performance signals rank eligible pages so that the first 50 human-reviewed pages contain a higher observed later-decline rate than a transparent fixed-rule baseline?

The work supports this human decision:

Which eligible pages should a human content team inspect first, and what type of refresh or content-opportunity review appears most reasonable?

The contribution is an applied validation and decision-support workflow,
not a new learning algorithm.

## 2. Data

- Release: March 2026
- Source table: fact_content_daily_performance/month=2026-03
- Source records: 9,841,378
- Unique client-page pairs: 331,437
- Eligible analytical pages: 34,038
- Eligible anonymised clients: 32
- Feature window: 2026-03-01 to 2026-03-15
- Outcome window: 2026-03-16 to 2026-03-31

Client names, URLs, domains, private queries, credentials, and business
identifiers are excluded from public artifacts.

## 3. Methodology

The target is 1 when outcome average daily impressions are below
80% of feature-window average daily
impressions. Seven prediction-time features are used. The baseline
combines 70% position-adjusted CTR weakness and
30% visibility percentile. Logistic
Regression and Random Forest are evaluated on the same grouped-client
holdout. A deliberate future-derived ratio is evaluated only to
demonstrate leakage and is excluded from the honest model.

## 4. Results

On one grouped-client holdout, Logistic Regression measured a Precision@50 of 0.640, compared with 0.520 for the frozen baseline, an absolute measured difference of 0.120. This observed result supports directional human decision-support for content-review prioritisation within the March 2026 evaluation design. It does not establish causal refresh impact, guarantee future performance, or support automatic content changes.

### Model vs Baseline

| method              |   base_rate |   precision@20 |   precision@50 |   lift@50_vs_base_rate |   average_precision |   roc_auc |
|:--------------------|------------:|---------------:|---------------:|-----------------------:|--------------------:|----------:|
| Logistic Regression |      0.3008 |           0.5  |           0.64 |                 0.3392 |              0.3939 |    0.6175 |
| Random Forest       |      0.3008 |           0.4  |           0.52 |                 0.2192 |              0.3909 |    0.6211 |
| ML-07 Baseline      |      0.3008 |           0.55 |           0.52 |                 0.2192 |              0.3776 |    0.6059 |

### Validation Design

| method                       |   validation_rows |   validation_clients |   client_overlap |   base_rate |   precision@50 |   average_precision |   roc_auc |
|:-----------------------------|------------------:|---------------------:|-----------------:|------------:|---------------:|--------------------:|----------:|
| Before — random row split    |              8510 |                   29 |               26 |      0.3089 |           0.5  |              0.4075 |    0.6317 |
| After — grouped client split |             15963 |                    8 |                0 |      0.3008 |           0.64 |              0.3939 |    0.6175 |

### Honest vs Leaky

| feature_set                       |   precision@50 |   average_precision |   roc_auc | contains_future_field   |
|:----------------------------------|---------------:|--------------------:|----------:|:------------------------|
| Honest pre-outcome features       |           0.64 |              0.3939 |    0.6175 | False                   |
| Leaky features plus decline_ratio |           1    |              0.9999 |    1      | True                    |

### Diagnostic Threshold Metrics

|   threshold |   true_negatives |   false_positives |   false_negatives |   true_positives |   threshold_accuracy |   majority_accuracy |   declining_class_precision |   declining_class_recall |   declining_class_f1 |   non_declining_class_f1 |   top_50_proxy_positives |   top_50_proxy_negatives |
|------------:|-----------------:|------------------:|------------------:|-----------------:|---------------------:|--------------------:|----------------------------:|-------------------------:|---------------------:|-------------------------:|-------------------------:|-------------------------:|
|         0.5 |             5880 |              5282 |              1705 |             3096 |               0.5623 |              0.6992 |                      0.3695 |                   0.6449 |               0.4698 |                   0.6273 |                       32 |                       18 |

### Permutation Importance

| feature                     |   importance_mean |   importance_std | stable_positive   |
|:----------------------------|------------------:|-----------------:|:------------------|
| feature_ctr                 |           0.07317 |          0.0036  | True              |
| position_band               |           0.03472 |          0.00268 | True              |
| feature_avg_position        |           0.01569 |          0.00336 | True              |
| feature_position_volatility |           0.0125  |          0.00167 | True              |
| log_feature_impressions     |           0.00108 |          0.00117 | False             |
| feature_clicks              |           0.0003  |          0.00014 | True              |
| feature_active_days         |          -0.00138 |          0.0008  | False             |

## 5. Limitations

This work uses one month, one grouped holdout, and a retrospective
impression-decline proxy. It does not estimate causal refresh impact,
Google's algorithm, guaranteed traffic recovery, conversion value,
revenue, profit, or ROI. Accuracy and F1 are diagnostic; Precision@50 is
the primary operational metric.

## 6. Ranked Recommendations

| action_label        | reason_code                  |   pages |   observed_decline_rate_pct |   median_priority |   estimated_review_hours | claim_status                |
|:--------------------|:-----------------------------|--------:|----------------------------:|------------------:|-------------------------:|:----------------------------|
| MONITOR             | LIMITED_FEATURE_HISTORY      |      26 |                       65.38 |             46.64 |                     4.33 | INSUFFICIENT_N_FOR_HEADLINE |
| CTR_REVIEW          | CTR_GAP_HIGH_VISIBILITY      |     147 |                       53.06 |             70.85 |                    49    | DESCRIPTIVE_WITH_N          |
| REFRESH_REVIEW      | HIGH_RISK_HIGH_VOLATILITY    |     706 |                       44.48 |             58.22 |                  1059    | DESCRIPTIVE_WITH_N          |
| REFRESH_AND_PROTECT | HIGH_RISK_STABLE_PAGE_1      |     546 |                       42.86 |             58.54 |                   682.5  | DESCRIPTIVE_WITH_N          |
| MANUAL_REVIEW       | HIGH_RISK_NO_CLEAR_ARCHETYPE |     934 |                       41.76 |             58.4  |                   467    | DESCRIPTIVE_WITH_N          |
| MONITOR             | BORDERLINE_MEASURED_RISK     |    8412 |                       32.14 |             58.72 |                  1402    | DESCRIPTIVE_WITH_N          |
| NO_IMMEDIATE_ACTION | LOWER_MEASURED_PRIORITY      |    4809 |                       21.52 |             46.86 |                     0    | DESCRIPTIVE_WITH_N          |
| PROTECT             | LOW_RISK_HIGH_VISIBILITY     |     382 |                        7.59 |             50.47 |                    95.5  | DESCRIPTIVE_WITH_N          |
| EXPAND_AND_OPTIMISE | HIGH_VALUE_PAGE_2            |       1 |                        0    |             71.46 |                     2    | INSUFFICIENT_N_FOR_HEADLINE |

Every exported recommendation requires human review. The workflow does
not automatically edit, publish, delete, merge, redirect, canonicalise,
prune, or no-index a page.

## 7. Reproducibility

Repository: https://github.com/Zafar488/flyrank-ml-internship

The repository contains the capstone notebook, public-safe aggregate
receipts, figures, fitted pipeline, publication metadata, and live page.

## Acknowledgments and Data Credit

Built on the [FlyRank ML Internship dataset](https://flyrank.ai).

## Author Contributions

Z.U. conceived the study, implemented the analysis, conducted validation and interpretation, prepared the visualizations, and drafted the manuscript. A.A.K. contributed to the literature review, methodological discussion, and manuscript review. Both authors reviewed and approved the final manuscript.

## Generative AI Assistance Disclosure

Generative AI tools were used during early code drafting and for limited suggestions on manuscript organization and language. The authors subsequently rewrote the narrative, checked numerical claims against executed notebooks and aggregate receipts, reviewed the cited sources, and accept responsibility for the submitted text and analysis.
