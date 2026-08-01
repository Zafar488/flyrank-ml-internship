# Evaluation Results -- FL-07 Optimization Run

## Summary Benchmarks

| Metric | Baseline | Optimized | Status |
|---|---|---|---|
| **pytest Test Suite** | 10 pre-build cases | 21 comprehensive tests | **100% PASSED** |
| **Top 50 Score Range** | 70.0 - 71.5 (Saturated) | 66.5 - 73.5 (Continuous) | **Improved** |
| **Unique Scores in Top 50** | 1 - 2 | 35 unique scores | **Differentiated** |
| **Unique Primary Actions** | 1 ("Refresh and expand") | 3 - 4 distinct actions | **Diversified** |
| **High Confidence Pages** | 0 (0%) | Calibrated (Volume + Signals) | **Calibrated** |
| **Scoring Duration (30k rows)** | 35.7 seconds | ~11.4 seconds | **3.1x Faster** |
| **Privacy Default** | Disabled (False) | Enabled (True default) | **Privacy-Safe** |

## Test Suite Execution Details
- Total pytest cases: 21
- Passed: 21 (100%)
- Execution time: ~5.15 seconds
