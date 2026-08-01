# FlyRank Search Opportunity Scout (FL-07)

> **FL-07 ? Build & Optimize the Agent**  
> Track: General AI Fluency | Phase: Build & Refine  
> A privacy-safe, high-performance decision-support agent for ranking content-review opportunities.

---

## Overview

The FlyRank Search Opportunity Scout reads page-level search-performance data (CSV) and produces a transparently scored, ranked review queue of content opportunities. It identifies pages with high impressions & low CTR, striking-distance positions, traffic declines, weak engagement, and high commercial value.

---

## Features

- **Continuous Smooth Scoring**: Eliminates score saturation with smooth Gaussian striking-distance curves and traffic-weighted decline scaling.
- **Transparent 4-Pillar Confidence**: Calibrates confidence (Volume 35%, Historical 25%, Completeness 25%, Quality 15%) into HIGH (70-100), MEDIUM (40-69), LOW (0-39).
- **Diversified Action Routing (A-J)**: Deterministic action engine assigning primary actions, secondary review suggestions, and action basis.
- **High-Performance Vectorization**: NumPy/Pandas array operations process 30,000 rows in ~11 seconds.
- **Default Privacy Mode**: SHA-256 identifier masking (PAGE-XXXXXXXX) enabled by default across UI, CSV, and text exports.
- **Visual Analytics**: Plotly charts for component distributions, primary action breakdown, score vs impressions, and CTR gap vs position.
- **Strict Guardrails**: Every row includes decision-support disclaimers; no automated publishing, deleting, or merging.

---

## Installation & Running

`ash
cd work/agent/flyrank-opportunity-agent
.\.venv\Scripts\python.exe -m pytest tests/ -v
.\.venv\Scripts\python.exe -m streamlit run app.py
`

---

## Output Schema

- 
ank: Rank by opportunity score (1 = highest)
- masked_page_id: SHA-256 hashed page identifier
- opportunity_score: 0?100 composite opportunity score
- confidence_score: 0?100 confidence score
- confidence_level: HIGH / MEDIUM / LOW
- primary_action: Primary recommended review action
- secondary_actions: List of secondary review suggestions
- ction_basis: Concise explanation of why the action was chosen
- dominant_component: Primary component driving the opportunity score
- explanation: 8-part structured explanation
- guardrail_note: Verbatim decision-support disclaimer
