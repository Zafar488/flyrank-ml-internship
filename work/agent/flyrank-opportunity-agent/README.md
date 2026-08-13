# FlyRank Search Opportunity Scout

> **General AI Fluency — Agent Project**
> A privacy-safe, transparent decision-support agent for prioritizing content-review opportunities from search-performance data.

---

## Overview

**FlyRank Search Opportunity Scout** analyzes page-level search-performance data and produces a ranked queue of pages that may deserve human review.

The system looks for signals such as:

* High impressions with weak CTR
* Striking-distance search positions
* Declining traffic signals
* Weak engagement
* Commercial-value signals
* Content-refresh opportunities

Instead of automatically changing website content, the agent explains why a page has been prioritized and recommends a review action for a human to consider.

### Who is it for?

The agent is designed for:

* SEO teams
* Content teams
* Search-performance analysts
* Digital marketing teams
* Anyone reviewing a large number of pages and deciding what should be inspected first

The goal is to reduce the time required to manually inspect thousands of pages by creating a transparent and prioritized review queue.

---

## What the Agent Does

The agent follows this basic workflow:

1. Reads page-level search-performance data.
2. Validates the required fields.
3. Maps columns into a consistent schema.
4. Cleans and preprocesses the data.
5. Calculates search-opportunity signals.
6. Produces an opportunity score.
7. Calculates a confidence score.
8. Assigns reason codes and recommended review actions.
9. Masks page identifiers when Privacy Mode is enabled.
10. Ranks the strongest opportunities.
11. Generates plain-language explanations.
12. Displays and exports the results.

---

## Key Features

### Continuous Opportunity Scoring

The optimized scoring system avoids excessive score saturation and produces a more differentiated ranking of content opportunities.

The scoring engine considers:

* CTR opportunity
* Striking-distance position
* Traffic decline
* Engagement opportunity
* Business-value signals

---

### Transparent Confidence Scoring

Confidence is calculated using four components:

| Component         | Weight |
| ----------------- | -----: |
| Volume            |    35% |
| Historical Signal |    25% |
| Data Completeness |    25% |
| Data Quality      |    15% |

Confidence levels are presented as:

* **HIGH:** 70–100
* **MEDIUM:** 40–69
* **LOW:** 0–39

---

### Diversified Action Routing

The system does not give every page the same recommendation.

It uses deterministic reason codes and action-routing rules to assign:

* Primary action
* Secondary review suggestions
* Action basis
* Dominant scoring component

The recommendations remain decision-support suggestions rather than automatic actions.

---

### Privacy-Safe by Default

Privacy Mode is enabled by default.

Page identifiers are masked using SHA-256 and displayed in a format such as:

```text
PAGE-XXXXXXXX
```

Masked identifiers are used across:

* User interface
* CSV exports
* Text reports

Raw private queries are not logged by the agent.

---

### Visual Analytics

The Streamlit application includes interactive Plotly visualizations such as:

* Component-score distributions
* Primary-action distribution
* Opportunity score vs. impressions
* CTR gap vs. average position

These charts help users understand why different pages receive different rankings.

---

### Human-in-the-Loop Guardrails

The system is intentionally designed as a decision-support tool.

It does **not** automatically:

* Publish content
* Delete content
* Edit pages
* Merge pages
* Redirect pages
* Retire pages

Every recommendation must be reviewed by a human before action is taken.

---

# Installation

## Requirements

You need:

* Git
* Python
* pip

No private FlyRank credentials are required to run the included sample workflow.

---

## 1. Clone the Repository

```bash
git clone https://github.com/Zafar488/flyrank-ml-internship.git
```

Move into the agent folder:

```bash
cd flyrank-ml-internship/work/agent/flyrank-opportunity-agent
```

---

## 2. Create a Virtual Environment

```bash
python -m venv .venv
```

### Windows

```bash
.venv\Scripts\activate
```

### macOS / Linux

```bash
source .venv/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Run the Test Suite

Before launching the application:

```bash
python -m pytest tests/ -v
```

The optimized version includes a comprehensive automated test suite covering the agent, scoring, privacy, and validation behavior.

---

## 5. Launch the Application

```bash
python -m streamlit run app.py
```

Then open:

```text
http://localhost:8501
```

in your browser if Streamlit does not open automatically.

---

# Usage Example

The repository includes sample data so the agent can be demonstrated without private client information.

A simple end-to-end test is:

1. Launch the Streamlit application.
2. Confirm that **Privacy Mode** is enabled.
3. Select **Use Sample Data**.
4. Click **Load sample dataset**.
5. Check the validation result.
6. Click **Run Opportunity Analysis**.
7. Wait for the analysis stages to finish.
8. Review the ranked opportunities.
9. Select the highest-ranked page in the Page Inspector.
10. Review its score, confidence, explanation and recommended action.
11. Inspect the visual analytics.
12. Export the ranked opportunities if required.

The application can produce:

```text
flyrank_opportunities.csv
```

and a text summary report.

---

# Example Output

Each ranked recommendation can contain fields such as:

| Field                | Description                                    |
| -------------------- | ---------------------------------------------- |
| `rank`               | Position in the ranked opportunity queue       |
| `masked_page_id`     | Privacy-safe SHA-256 page identifier           |
| `opportunity_score`  | Composite opportunity score from 0–100         |
| `confidence_score`   | Confidence score from 0–100                    |
| `confidence_level`   | HIGH, MEDIUM or LOW                            |
| `primary_action`     | Main recommended human-review action           |
| `secondary_actions`  | Additional review suggestions                  |
| `action_basis`       | Explanation of why the action was selected     |
| `dominant_component` | Signal contributing most strongly to the score |
| `explanation`        | Structured plain-language explanation          |
| `guardrail_note`     | Human-review / decision-support disclaimer     |

---

# Architecture

```text
CSV Upload / Sample Data
        ↓
[1] Inspect Data
        ↓
[2] Validate Required Fields
        ↓
[3] Map Columns
        ↓
[4] Preprocess Data
        ↓
[5] Calculate Search Signals
        ↓
[6] Opportunity Scoring
        ↓
[7] Confidence Calculation
        ↓
[8] Reason Codes & Action Routing
        ↓
[9] Rank Opportunities
        ↓
[10] Generate Explanations
        ↓
[11] Privacy Masking
        ↓
[12] Streamlit Display & Export
```

Supporting implementation files include:

```text
app.py
agent.py
config.py
preprocessing.py
scoring.py
explanations.py
privacy.py
sample_data.py
tests/
docs/
```

---

# Important Design Decision

## Transparent Rules Instead of an ML-Fitted Model

One important design decision was to keep the agent's opportunity-scoring engine deterministic and readable rather than fitting another machine-learning model inside the agent.

The purpose of this decision is auditability.

A reviewer should be able to understand:

* Why a page received a high score
* Which signal contributed to the score
* Why a particular action was recommended
* How the confidence value was produced

This makes the system easier to inspect and keeps the recommendations transparent.

The scoring weights can also be adjusted without retraining a model.

---

# Privacy Design

The agent includes privacy protection as part of the workflow rather than treating it as an optional final step.

When Privacy Mode is enabled:

```text
Original page identifier
        ↓
SHA-256 hashing
        ↓
PAGE-XXXXXXXX
```

The masked identifier is then used in the interface and exported outputs.

The repository uses synthetic or approved anonymized data for public artifacts.

---

# Guardrail

The agent is a **decision-support system**, not an autonomous website-management system.

Its recommendations use cautious language such as:

* potential opportunity
* recommended for review
* directional signal

The agent cannot automatically modify website content.

A human remains responsible for deciding whether a recommended action should actually be taken.

---

# V2 Evaluation Results

The agent was evaluated before and after optimization.

| Metric                   |  Baseline |       Optimized V2 |
| ------------------------ | --------: | -----------------: |
| Automated test cases     |        10 |                 21 |
| Tests passed             |         — | **21 / 21 (100%)** |
| Top-50 score range       | 70.0–71.5 |      **66.5–73.5** |
| Unique scores in Top 50  |       1–2 |             **35** |
| Unique primary actions   |         1 |            **3–4** |
| 30k-row scoring duration |  35.7 sec |      **~11.4 sec** |
| Privacy Mode default     |  Disabled |        **Enabled** |

### Performance Improvement

The optimized vectorized implementation reduced the measured scoring time for approximately 30,000 rows from:

```text
35.7 seconds
```

to approximately:

```text
11.4 seconds
```

This represents roughly a:

```text
3.1× speed improvement
```

The optimization also improved ranking differentiation.

Instead of many top-ranked pages receiving almost identical scores, V2 produced **35 unique scores among the Top 50**.

The action-routing system also became more diversified, moving from one dominant action to approximately **3–4 distinct primary actions** in the evaluated run.

---

# Testing

The project contains tests for:

```text
tests/
├── test_agent.py
├── test_privacy.py
├── test_scoring.py
└── test_validation.py
```

The V2 evaluation recorded:

```text
Total tests: 21
Passed: 21
Pass rate: 100%
```

---

# Limitations

The current version has several intentional limitations.

### 1. CSV-Based Input

CSV upload is the primary live data connection in the current MVP.

Direct integrations with systems such as:

* Google Search Console
* Google Analytics 4
* BigQuery

are deferred to a future version.

---

### 2. No Hugging Face Connector in the MVP

The current agent does not include a Hugging Face data connector.

The project focuses first on a reproducible CSV-based workflow.

---

### 3. Deterministic Scoring

The opportunity-ranking engine uses transparent rule-based scoring rather than an ML-fitted ranking model.

This improves auditability but means the agent does not learn personalized scoring behavior from user feedback automatically.

---

### 4. Human Review Is Still Required

A high opportunity score does not mean that a page should automatically be changed.

The system only prioritizes pages for investigation.

A human should review:

* Page context
* Search intent
* Content quality
* Business importance
* Potential risk

before applying an action.

---

# Future Improvements

Possible future versions could include:

* Google Search Console integration
* GA4 integration
* BigQuery integration
* Additional approved data connectors
* More advanced evaluation across different datasets
* Feedback-based calibration
* Additional analytics
* Improved action explanations

Any future automation should preserve the current human-review and privacy guardrails.

---

# Project Structure

```text
flyrank-opportunity-agent/
│
├── app.py
├── agent.py
├── config.py
├── preprocessing.py
├── scoring.py
├── explanations.py
├── privacy.py
├── sample_data.py
├── requirements.txt
│
├── tests/
│   ├── test_agent.py
│   ├── test_privacy.py
│   ├── test_scoring.py
│   └── test_validation.py
│
└── docs/
    ├── agent_design_summary.md
    ├── architecture.md
    ├── build_log.md
    ├── demo_script.md
    └── evaluation_results.md
```

---

# Demo Video

A live end-to-end demonstration of the agent is available here:

https://youtu.be/Wqc96lgY4vM

The demonstration covers the real application workflow rather than a slide presentation.

---

# Repository

Main repository:

https://github.com/Zafar488/flyrank-ml-internship

Agent folder:

```text
work/agent/flyrank-opportunity-agent/
```

---

# Responsible Use

This system should be treated as analytical decision support.

Its outputs should be described as:

* observed
* measured
* directional
* recommended for human review

The agent does not claim to predict Google's algorithm and should not be used to make unsupervised production content changes.

---

## Author

**Zafar Ullah**

AI/ML Engineer
Agentic AI • Machine Learning • RAG • Production AI Systems

GitHub: https://github.com/Zafar488

---

## Acknowledgment

Built as part of the **FlyRank AI Internship / General AI Fluency track**, using privacy-safe and anonymized search-performance data.
