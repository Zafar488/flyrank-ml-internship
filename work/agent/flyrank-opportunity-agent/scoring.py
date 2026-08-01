from __future__ import annotations
import logging
from typing import Dict, List, Tuple
import numpy as np
import pandas as pd
from config import (
    ACTION_DESCRIPTIONS, CONFIDENCE_TIERS, GUARDRAIL_NOTE,
    POSITION_BUCKETS, AgentSettings,
)
from privacy import apply_privacy

logger = logging.getLogger(__name__)


def compute_position_bucket_ctrs(df: pd.DataFrame) -> Dict[str, float]:
    bucket_ctrs = {}
    pos = df['avg_position'].values
    ctr = df['ctr'].values if 'ctr' in df.columns else (df['clicks'] / df['impressions'].replace(0, np.nan)).values

    for lo, hi, label in POSITION_BUCKETS:
        mask = (pos >= lo) & (pos < hi) & ~np.isnan(ctr)
        subset = ctr[mask]
        bucket_ctrs[label] = float(np.nanmedian(subset)) if len(subset) >= 3 else np.nan
    return bucket_ctrs


def get_expected_ctr_vectorized(positions: np.ndarray, bucket_ctrs: Dict[str, float]) -> np.ndarray:
    expected = np.full(positions.shape, np.nan, dtype=float)
    for lo, hi, label in POSITION_BUCKETS:
        val = bucket_ctrs.get(label, np.nan)
        if pd.notna(val):
            mask = (positions >= lo) & (positions < hi)
            expected[mask] = val
    return expected


def score_ctr_opportunity(df: pd.DataFrame, bucket_ctrs: Dict[str, float]) -> Tuple[pd.Series, pd.Series, pd.Series]:
    pos = df['avg_position'].values
    expected_arr = get_expected_ctr_vectorized(pos, bucket_ctrs)
    expected = pd.Series(expected_arr, index=df.index)

    if 'ctr' in df.columns and df['ctr'].notna().any():
        actual = df['ctr'].fillna(0.0)
    else:
        actual = (df['clicks'] / df['impressions'].replace(0, np.nan)).fillna(0.0)

    gap = expected - actual
    positive_gap = gap.clip(lower=0.0)

    max_gap = positive_gap.quantile(0.95)
    if pd.isna(max_gap) or max_gap <= 0:
        max_gap = 0.05

    scaled_gap = (positive_gap / max_gap).clip(upper=1.0)
    imp = df['impressions'].fillna(0.0).values
    vol_weight = np.clip(np.log1p(imp) / np.log1p(10000.0), 0.2, 1.0)

    score = (scaled_gap.values * 0.70 + scaled_gap.values * vol_weight * 0.30) * 100.0
    score = np.nan_to_num(score, nan=0.0).clip(0.0, 100.0)
    return pd.Series(score, index=df.index), expected, gap


def score_striking_distance(df: pd.DataFrame) -> pd.Series:
    pos = df['avg_position'].values
    scores = np.zeros(pos.shape, dtype=float)

    valid_mask = pos > 0
    p = pos[valid_mask]

    gauss = np.exp(-((p - 7.0) ** 2) / 32.0)

    ramp = np.ones_like(p)
    ramp[p < 3.0] = np.clip((p[p < 3.0] - 1.0) / 2.0, 0.0, 1.0) * 0.5 + 0.1
    ramp[p > 15.0] = np.clip(1.0 - (p[p > 15.0] - 15.0) / 15.0, 0.0, 1.0)

    scores[valid_mask] = np.clip(gauss * ramp * 85.0, 0.0, 100.0)
    scores = np.nan_to_num(scores, nan=0.0).clip(0.0, 100.0)
    return pd.Series(scores, index=df.index)


def score_decline(df: pd.DataFrame) -> pd.Series:
    imp = df['impressions'].fillna(0.0).values
    decline_pct = np.zeros(len(df), dtype=float)

    if 'trend_pct' in df.columns and df['trend_pct'].notna().any():
        tp = df['trend_pct'].fillna(0.0).values
        decline_pct = np.clip(-tp, 0.0, None)
    elif 'prev_impressions' in df.columns and df['prev_impressions'].notna().any():
        prev_imp = df['prev_impressions'].fillna(0.0).values
        change = np.where(prev_imp > 0, (prev_imp - imp) / prev_imp * 100.0, 0.0)
        decline_pct = np.clip(change, 0.0, None)
    elif 'trend_direction' in df.columns and df['trend_direction'].notna().any():
        down_mask = df['trend_direction'].astype(str).str.lower() == 'down'
        decline_pct = np.where(down_mask, 30.0, 0.0)

    mag_factor = np.clip(decline_pct / 80.0, 0.0, 1.0)
    vol_weight = np.clip(np.log1p(imp) / np.log1p(5000.0), 0.1, 1.0)

    score = (mag_factor ** 0.8) * vol_weight * 100.0
    score = np.nan_to_num(score, nan=0.0).clip(0.0, 100.0)
    return pd.Series(score, index=df.index)


def score_engagement_opportunity(df: pd.DataFrame) -> pd.Series:
    if 'engagement_rate' not in df.columns or df['engagement_rate'].isna().all():
        return pd.Series(0.0, index=df.index)

    eng = df['engagement_rate'].fillna(0.0).values
    median_eng = np.nanmedian(eng)
    if pd.isna(median_eng) or median_eng <= 0:
        median_eng = 0.05

    gap = np.clip(median_eng - eng, 0.0, None)
    imp = df['impressions'].fillna(0.0).values
    vol_weight = np.clip(np.log1p(imp) / np.log1p(5000.0), 0.1, 1.0)

    score = np.clip((gap / median_eng) * vol_weight * 100.0, 0.0, 100.0)
    score = np.nan_to_num(score, nan=0.0).clip(0.0, 100.0)
    return pd.Series(score, index=df.index)


def score_business_value(df: pd.DataFrame) -> pd.Series:
    has_conv = 'conversions' in df.columns and df['conversions'].notna().any()
    has_rev = 'revenue' in df.columns and df['revenue'].notna().any()

    if not (has_conv or has_rev):
        return pd.Series(0.0, index=df.index)

    conv = df['conversions'].fillna(0.0).values if has_conv else np.zeros(len(df))
    rev = df['revenue'].fillna(0.0).values if has_rev else np.zeros(len(df))

    raw = np.log1p(conv) * 15.0 + np.log1p(rev) * 5.0
    max_raw = np.quantile(raw[raw > 0], 0.95) if np.any(raw > 0) else 50.0
    if max_raw <= 0:
        max_raw = 50.0

    score = np.clip((raw / max_raw) * 100.0, 0.0, 100.0)
    score = np.nan_to_num(score, nan=0.0).clip(0.0, 100.0)
    return pd.Series(score, index=df.index)


def compute_confidence(df: pd.DataFrame) -> Tuple[pd.Series, pd.Series, pd.Series, pd.Series]:
    imp = df['impressions'].fillna(0.0).values
    clk = df['clicks'].fillna(0.0).values
    pos = df['avg_position'].fillna(0.0).values
    n = len(df)

    vol_score = np.clip(np.log1p(imp) / np.log1p(10000.0), 0.0, 1.0) * 25.0 +                 np.clip(np.log1p(clk) / np.log1p(500.0), 0.0, 1.0) * 10.0

    hist_score = np.zeros(n, dtype=float)
    if 'prev_impressions' in df.columns and df['prev_impressions'].notna().any():
        hist_score += 10.0
    if 'trend_pct' in df.columns and df['trend_pct'].notna().any():
        hist_score += 10.0
    if 'content_age_days' in df.columns and df['content_age_days'].notna().any():
        hist_score += 5.0

    opt_cols = ['ctr', 'engagement_rate', 'conversions', 'revenue', 'active_days']
    present_opt = [c for c in opt_cols if c in df.columns and df[c].notna().any()]
    comp_score = np.full(n, min(len(present_opt) * 5.0, 25.0), dtype=float)

    qual_score = np.zeros(n, dtype=float)
    qual_score += np.where(pos > 0, 5.0, 0.0)
    qual_score += np.where(imp > 0, 5.0, 0.0)
    qual_score += np.where((clk >= 0) & (clk <= imp), 5.0, 0.0)

    total_conf = np.clip(vol_score + hist_score + comp_score + qual_score, 0.0, 100.0)
    total_conf = np.nan_to_num(total_conf, nan=0.0)
    total_series = pd.Series(total_conf.round(1), index=df.index)

    all_signals = ['prev_impressions', 'trend_pct', 'engagement_rate', 'conversions', 'revenue', 'content_age_days']
    missing_arr = np.zeros(n, dtype=int)
    for s in all_signals:
        if s in df.columns:
            missing_arr += df[s].isna().astype(int).values
        else:
            missing_arr += 1

    levels = np.where(total_conf >= 70.0, 'HIGH', np.where(total_conf >= 40.0, 'MEDIUM', 'LOW'))

    reasons_list = [
        "High confidence: Substantial traffic volume, complete signal coverage, and verified data quality."
        if sc >= 70.0 else
        f"Medium confidence: Moderate traffic volume ({int(im):,} impressions) with partial historical/optional signals."
        if sc >= 40.0 else
        f"Low confidence: Traffic volume is close to baseline ({int(im):,} impressions) or comparison history is missing."
        for sc, im in zip(total_conf, imp)
    ]

    return (
        total_series,
        pd.Series(levels, index=df.index),
        pd.Series(reasons_list, index=df.index),
        pd.Series(missing_arr, index=df.index),
    )


def route_actions_and_reasons(
    df: pd.DataFrame,
    ctr_scores: pd.Series,
    sd_scores: pd.Series,
    decline_scores: pd.Series,
    eng_scores: pd.Series,
    bv_scores: pd.Series,
    ctr_gap: pd.Series,
    expected_ctr: pd.Series,
    conf_level: pd.Series,
    settings: AgentSettings,
) -> pd.DataFrame:

    n = len(df)
    c_arr = ctr_scores.values
    s_arr = sd_scores.values
    d_arr = decline_scores.values
    e_arr = eng_scores.values
    b_arr = bv_scores.values
    conf_arr = conf_level.values

    pos_arr = df['avg_position'].values
    imp_arr = df['impressions'].fillna(0.0).values
    gap_arr = ctr_gap.fillna(0.0).values
    exp_arr = expected_ctr.fillna(0.0).values
    actual_ctr_arr = (df['ctr'] if 'ctr' in df.columns else (df['clicks'] / df['impressions'].replace(0, np.nan))).fillna(0.0).values

    has_tp = 'trend_pct' in df.columns
    tp_arr = df['trend_pct'].fillna(0.0).values if has_tp else np.zeros(n)

    has_eng = 'engagement_rate' in df.columns
    eng_arr = df['engagement_rate'].fillna(0.0).values if has_eng else np.zeros(n)

    has_conv = 'conversions' in df.columns
    conv_arr = df['conversions'].fillna(0.0).values if has_conv else np.zeros(n)

    has_age = 'content_age_days' in df.columns
    age_arr = df['content_age_days'].fillna(0.0).values if has_age else np.zeros(n)

    comps_matrix = np.column_stack([c_arr, s_arr, d_arr, e_arr, b_arr])
    comp_names = np.array(['ctr_opportunity', 'striking_distance', 'decline', 'engagement_opportunity', 'business_value'])
    max_indices = np.argmax(comps_matrix, axis=1)
    dominant_components = comp_names[max_indices]

    primary_actions = []
    secondary_actions_list = []
    action_bases = []
    dominant_codes = []
    reason_codes_list = []
    reason_evidence_list = []

    min_imp = settings.min_impressions

    for i in range(n):
        c_score = c_arr[i]
        s_score = s_arr[i]
        d_score = d_arr[i]
        e_score = e_arr[i]
        b_score = b_arr[i]
        dom_comp = dominant_components[i]

        codes = []
        ev_dict = {}

        p_val = pos_arr[i]
        i_val = imp_arr[i]
        g_val = gap_arr[i]
        e_val = exp_arr[i]
        a_ctr = actual_ctr_arr[i]
        c_lvl = conf_arr[i]

        if c_lvl == 'LOW' and i_val < min_imp:
            codes.append('INSUFFICIENT_DATA')
            ev_dict['INSUFFICIENT_DATA'] = f'Impressions ({int(i_val):,}) below minimum threshold ({min_imp}).'
        else:
            if g_val > 0.005 and c_score > 15.0:
                codes.append('HIGH_IMPRESSIONS_LOW_CTR')
                ev_dict['HIGH_IMPRESSIONS_LOW_CTR'] = f'Actual CTR ({a_ctr:.2%}) is below expected benchmark ({e_val:.2%}) at position {p_val:.1f}.'

            if 3.0 <= p_val <= 15.0 and s_score > 15.0:
                codes.append('STRIKING_DISTANCE')
                ev_dict['STRIKING_DISTANCE'] = f'Average position {p_val:.1f} is within the striking-distance range (3 to 15).'

            if has_tp and tp_arr[i] < -5.0:
                codes.append('DECLINING_IMPRESSIONS')
                ev_dict['DECLINING_IMPRESSIONS'] = f'Impression trend shows a decline of {tp_arr[i]:.1f}%.'
            elif d_score > 35.0:
                codes.append('DECLINING_IMPRESSIONS')
                ev_dict['DECLINING_IMPRESSIONS'] = f'Decline score ({d_score:.1f}) indicates historical impression drop.'

            if e_score > 25.0:
                codes.append('LOW_ENGAGEMENT')
                ev_dict['LOW_ENGAGEMENT'] = f'Engagement rate ({eng_arr[i]:.3f}) is below benchmark for traffic level.'

            if has_conv and conv_arr[i] > 0 and b_score > 30.0:
                codes.append('HIGH_VALUE_PAGE')
                ev_dict['HIGH_VALUE_PAGE'] = f'Page registered {int(conv_arr[i])} conversions.'

            if g_val > 0.03 and 4.0 <= p_val <= 15.0:
                codes.append('POSSIBLE_INTENT_MISMATCH')
                ev_dict['POSSIBLE_INTENT_MISMATCH'] = f'CTR gap of {g_val:.2%} at position {p_val:.1f} suggests search-intent mismatch.'

            if has_age and age_arr[i] > 180 and ('DECLINING_IMPRESSIONS' in codes or d_score > 25.0):
                codes.append('POSSIBLE_REFRESH_OPPORTUNITY')
                ev_dict['POSSIBLE_REFRESH_OPPORTUNITY'] = f'Content age ({int(age_arr[i])} days) with decline signal indicates refresh opportunity.'

            if not codes:
                codes.append('MONITOR_ONLY')
                ev_dict['MONITOR_ONLY'] = 'No urgent opportunity signals detected; monitor performance.'

        reason_codes_list.append(codes)
        reason_evidence_list.append(ev_dict)

        # Deterministic Action Routing (A - J)
        prim = ACTION_DESCRIPTIONS['MONITOR_ONLY']
        sec = []
        basis = "Baseline monitoring recommendation."
        dom_code = codes[0] if codes else 'MONITOR_ONLY'

        if 'INSUFFICIENT_DATA' in codes:
            prim = ACTION_DESCRIPTIONS['INSUFFICIENT_DATA']
            dom_code = 'INSUFFICIENT_DATA'
            basis = f"Impressions ({int(i_val):,}) are insufficient for high-confidence action."
            sec = ["Collect additional search performance data over the next 30 days."]
        elif 'HIGH_IMPRESSIONS_LOW_CTR' in codes or (i_val >= 5000 and a_ctr < 0.015):
            prim = ACTION_DESCRIPTIONS['HIGH_IMPRESSIONS_LOW_CTR']
            dom_code = 'HIGH_IMPRESSIONS_LOW_CTR'
            basis = f"High impressions ({int(i_val):,}) with low CTR ({a_ctr:.2%}) indicates title/meta review opportunity."
            sec = ["Test title tag variations", "Refine meta description call-to-action"]
        elif 'POSSIBLE_REFRESH_OPPORTUNITY' in codes or (has_age and age_arr[i] > 180 and (tp_arr[i] < -10 or d_score > 20)):
            prim = ACTION_DESCRIPTIONS['POSSIBLE_REFRESH_OPPORTUNITY']
            dom_code = 'POSSIBLE_REFRESH_OPPORTUNITY'
            basis = f"Content is {int(age_arr[i])} days old and exhibits traffic decline."
            sec = ["Update outdated statistics", "Expand content depth"]
        elif 'LOW_ENGAGEMENT' in codes or (has_eng and eng_arr[i] > 0 and eng_arr[i] < 0.02 and i_val >= 1000):
            prim = ACTION_DESCRIPTIONS['LOW_ENGAGEMENT']
            dom_code = 'LOW_ENGAGEMENT'
            basis = f"Engagement rate ({eng_arr[i]:.3f}) is below dataset benchmark."
            sec = ["Improve above-the-fold content clarity", "Add prominent call-to-action elements"]
        elif 'DECLINING_IMPRESSIONS' in codes or (has_tp and tp_arr[i] < -10):
            prim = ACTION_DESCRIPTIONS['DECLINING_IMPRESSIONS']
            dom_code = 'DECLINING_IMPRESSIONS'
            basis = f"Impression volume shows directional decline ({tp_arr[i]:+.1f}%)."
            sec = ["Audit competitor content updates", "Check for SERP feature shifts"]
        elif dom_comp == 'striking_distance' and 'STRIKING_DISTANCE' in codes:
            prim = ACTION_DESCRIPTIONS['STRIKING_DISTANCE']
            dom_code = 'STRIKING_DISTANCE'
            basis = f"Page ranks at position {p_val:.1f}, within striking distance of top positions."
            sec = ["Add missing subtopics", "Strengthen internal linking"]
        elif 'POSSIBLE_INTENT_MISMATCH' in codes:
            prim = ACTION_DESCRIPTIONS['POSSIBLE_INTENT_MISMATCH']
            dom_code = 'POSSIBLE_INTENT_MISMATCH'
            basis = f"Position {p_val:.1f} with CTR gap ({g_val:.2%}) suggests query intent mismatch."
            sec = ["Re-align content structure to search intent"]
        elif 'HIGH_VALUE_PAGE' in codes:
            prim = ACTION_DESCRIPTIONS['HIGH_VALUE_PAGE']
            dom_code = 'HIGH_VALUE_PAGE'
            basis = f"High commercial value page with {int(conv_arr[i])} conversions requires careful human review."
            sec = ["Perform manual conversion path audit"]
        else:
            prim = ACTION_DESCRIPTIONS[codes[0]]
            dom_code = codes[0]
            basis = f"Primary signal based on {codes[0].replace('_', ' ').title()}."

        primary_actions.append(prim)
        secondary_actions_list.append(sec)
        action_bases.append(basis)
        dominant_codes.append(dom_code)

    res = pd.DataFrame({
        'dominant_component': dominant_components,
        'dominant_reason_code': dominant_codes,
        'reason_codes': reason_codes_list,
        'reason_code_evidence': reason_evidence_list,
        'primary_action': primary_actions,
        'secondary_actions': secondary_actions_list,
        'action_basis': action_bases,
    }, index=df.index)

    return res


def compute_scores(df: pd.DataFrame, settings: AgentSettings) -> pd.DataFrame:
    settings.validate_weights()
    weights = settings.weights

    has_engagement = 'engagement_rate' in df.columns and df['engagement_rate'].notna().any()
    has_business = (
        ('conversions' in df.columns and df['conversions'].notna().any()) or
        ('revenue' in df.columns and df['revenue'].notna().any())
    )

    bucket_ctrs = compute_position_bucket_ctrs(df)
    ctr_scores, expected_ctr, ctr_gap = score_ctr_opportunity(df, bucket_ctrs)
    sd_scores = score_striking_distance(df)
    decline_scores = score_decline(df)
    eng_scores = score_engagement_opportunity(df) if has_engagement else pd.Series(0.0, index=df.index)
    bv_scores = score_business_value(df) if has_business else pd.Series(0.0, index=df.index)

    active_weights = dict(weights)
    if not has_engagement:
        eng_w = active_weights.pop('engagement_opportunity', 0.0)
        core = ['ctr_opportunity', 'striking_distance', 'decline']
        total_core = sum(active_weights.get(k, 0.0) for k in core)
        if total_core > 0:
            for k in core:
                active_weights[k] += eng_w * (active_weights[k] / total_core)
        else:
            active_weights['ctr_opportunity'] += eng_w

    if not has_business:
        bv_w = active_weights.pop('business_value', 0.0)
        total_rest = sum(active_weights.values())
        if total_rest > 0:
            for k in list(active_weights.keys()):
                active_weights[k] += bv_w * (active_weights[k] / total_rest)

    total_w = sum(active_weights.values())
    if total_w > 0:
        active_weights = {k: v / total_w for k, v in active_weights.items()}

    final_score = (
        active_weights.get('ctr_opportunity', 0.0) * ctr_scores +
        active_weights.get('striking_distance', 0.0) * sd_scores +
        active_weights.get('decline', 0.0) * decline_scores +
        active_weights.get('engagement_opportunity', 0.0) * eng_scores +
        active_weights.get('business_value', 0.0) * bv_scores
    ).clip(0.0, 100.0)

    final_score = np.nan_to_num(final_score, nan=0.0).clip(0.0, 100.0)

    conf_score, conf_level, conf_reasons, missing_count = compute_confidence(df)

    routing_df = route_actions_and_reasons(
        df, ctr_scores, sd_scores, decline_scores, eng_scores,
        bv_scores, ctr_gap, expected_ctr, conf_level, settings,
    )

    out = df.copy()
    out = apply_privacy(out, settings.privacy_mode)

    out['opportunity_score'] = pd.Series(final_score, index=df.index).round(1)
    out['confidence_score'] = conf_score.round(1)
    out['confidence_level'] = conf_level
    out['confidence_reasons'] = conf_reasons
    out['missing_signal_count'] = missing_count
    out['expected_ctr'] = expected_ctr
    out['ctr_gap'] = ctr_gap

    out['ctr_component'] = ctr_scores.round(1)
    out['striking_distance_component'] = sd_scores.round(1)
    out['decline_component'] = decline_scores.round(1)
    out['engagement_component'] = eng_scores.round(1)
    out['business_value_component'] = bv_scores.round(1)

    out['dominant_component'] = routing_df['dominant_component']
    out['dominant_reason_code'] = routing_df['dominant_reason_code']
    out['reason_codes'] = routing_df['reason_codes']
    out['reason_code_evidence'] = routing_df['reason_code_evidence']
    out['primary_action'] = routing_df['primary_action']
    out['secondary_actions'] = routing_df['secondary_actions']
    out['action_basis'] = routing_df['action_basis']
    out['recommended_action'] = routing_df['primary_action']

    out['score_breakdown_summary'] = [
        f"CTR: {out['ctr_component'].iloc[i]:.1f} | SD: {out['striking_distance_component'].iloc[i]:.1f} | Dec: {out['decline_component'].iloc[i]:.1f} | Eng: {out['engagement_component'].iloc[i]:.1f} | BV: {out['business_value_component'].iloc[i]:.1f}"
        for i in range(len(out))
    ]

    out['guardrail_note'] = GUARDRAIL_NOTE
    return out
