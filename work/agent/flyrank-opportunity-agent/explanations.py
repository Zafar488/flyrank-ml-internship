from __future__ import annotations
import logging
from typing import Any, Dict, List
import pandas as pd
from config import GUARDRAIL_NOTE

logger = logging.getLogger(__name__)


def generate_structured_explanation(row: pd.Series) -> str:
    rank = row.get('rank', 'N/A')
    score = row.get('opportunity_score', 0.0)
    dom_comp = str(row.get('dominant_component', 'ctr_opportunity')).replace('_', ' ').title()
    primary_action = row.get('primary_action', row.get('recommended_action', 'Monitor performance'))
    action_basis = row.get('action_basis', 'Primary signal observation.')
    conf_level = row.get('confidence_level', 'MEDIUM')
    conf_reason = row.get('confidence_reasons', 'Based on traffic volume and signal completeness.')

    imp = row.get('impressions', 0)
    ctr = row.get('ctr', 0.0)
    pos = row.get('avg_position', 0.0)
    exp_ctr = row.get('expected_ctr', 0.0)
    ctr_gap = row.get('ctr_gap', 0.0)

    # 1. Rank & score context
    part1 = f"Page ranks #{rank} with an opportunity score of {score:.1f}/100."

    # 2. Strongest signal
    part2 = f"The primary opportunity driver is {dom_comp}."

    # 3. Supporting secondary signals
    sec_signals = []
    if pd.notna(ctr_gap) and ctr_gap > 0.005:
        sec_signals.append(f"CTR gap of {ctr_gap:.2%} below benchmark ({exp_ctr:.2%}) at position {pos:.1f}")
    if 'trend_pct' in row and pd.notna(row['trend_pct']) and row['trend_pct'] < 0:
        sec_signals.append(f"directional impression decline of {row['trend_pct']:.1f}%")
    if 'content_age_days' in row and pd.notna(row['content_age_days']) and row['content_age_days'] > 180:
        sec_signals.append(f"content age of {int(row['content_age_days'])} days")

    if sec_signals:
        part3 = "Supporting signals include: " + "; ".join(sec_signals) + "."
    else:
        part3 = "No secondary signals observed."

    # 4. Confidence explanation
    part4 = f"Confidence is classified as {conf_level}. {conf_reason}"

    # 5 & 6. Recommended action & basis
    part5_6 = f"Recommended primary action: '{primary_action}'. Basis: {action_basis}"

    # 7. Missing evidence
    missing_n = row.get('missing_signal_count', 0)
    if missing_n > 0:
        part7 = f"Note: {missing_n} optional signal(s) were unavailable in this dataset."
    else:
        part7 = "All optional signal fields were present."

    # 8. Guardrail
    part8 = f"Guardrail: {GUARDRAIL_NOTE}"

    return f"{part1} {part2} {part3} {part4} {part5_6} {part7} {part8}"


def add_explanations(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    explanations = [generate_structured_explanation(out.iloc[i]) for i in range(len(out))]
    out['explanation'] = explanations
    return out
