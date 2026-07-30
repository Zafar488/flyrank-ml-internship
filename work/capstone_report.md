# Refresh and Content Opportunity Scoring Using Historical Search Signals: A Leakage-Safe Grouped-Client Machine Learning Study

**Author:** Zafar Ullah  
**Affiliation:** Department of Computer Science, University of Technology Mardan, Pakistan  
**Corresponding email:** zafarullah1385@gmail.com  
**ORCID:** Not available  
**Paper type:** Technical Report  
**Version:** 1.1 (Pre-DOI)  
**License:** CC BY 4.0  
**DOI:** To be assigned  
**Lane:** Refresh / Content Opportunity Scoring  
**Repository:** https://github.com/Zafar488/flyrank-ml-internship  
**Deployed paper:** https://zafar488.github.io/flyrank-ml-internship/  
**Searchable PDF:** https://zafar488.github.io/flyrank-ml-internship/paper.pdf  
**Publication date:** 2026-07-30  

## Abstract

This study asks whether historical search-performance signals can prioritise eligible content pages for human review. Using 9,841,378 daily warehouse rows from March 2026, it creates 34,038 eligible anonymised client-page records from separated feature and outcome windows. A transparent ML-07 baseline, Logistic Regression, and Random Forest are evaluated on the same grouped-client holdout, while a deliberate future-field experiment audits leakage. Logistic Regression measured a Precision@50 of 0.640 compared with 0.520 for the frozen baseline, while the validation base rate was 0.301. The observed result supports directional human decision-support and does not establish causal refresh impact, guaranteed recovery, or automatic editing.

## 1. Problem Framing

Can historical prediction-time search-performance signals rank eligible pages so that the first 50 human-reviewed pages contain a higher observed later-decline rate than a transparent fixed-rule baseline?

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

Seed: 42. Dataset access requires an authorised read token stored
securely outside the notebook.

Software environment:

| component                   | version_or_setting   |
|:----------------------------|:---------------------|
| python                      | 3.12.13              |
| execution_environment       | Google Colab         |
| pandas                      | 2.2.2                |
| numpy                       | 2.0.2                |
| scikit-learn                | 1.6.1                |
| matplotlib                  | 3.10.0               |
| duckdb                      | 1.3.2                |
| huggingface_hub             | 1.23.0               |
| joblib                      | 1.5.3                |
| pypdf                       | 6.14.2               |
| random_seed                 | 42                   |
| grouped_validation_fraction | 0.25                 |

## 9. Limitations

On one grouped-client holdout, Logistic Regression measured a Precision@50 of 0.640, compared with 0.520 for the frozen ML-07 baseline, an absolute measured difference of 0.120. This observed result supports directional human decision-support for content-review prioritisation within the March 2026 evaluation design. It does not establish causal refresh impact, guarantee future performance, or support automatic content changes.

## 10. AI Assistance Disclosure

Generative AI tools were used to support code drafting, document
structuring, language refinement, and quality checks. The author
reviewed the analysis, verified the reported results against executed
notebooks, and accepts responsibility for the final manuscript.

## 11. Publication Integrity

PDF pages: 16  
PDF SHA-256: `f505dd6ac1e1db32404884e9533e10ed7d567ece51f4fa46e228845b633f4957`  
License: [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)  

## 12. Acknowledgments and Data Credit

Built on the [FlyRank ML Internship dataset](https://flyrank.ai).
