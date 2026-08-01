import sys
from pathlib import Path
import numpy as np
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import AgentSettings, ACTION_DESCRIPTIONS
from preprocessing import preprocess
from scoring import (
    compute_scores, score_striking_distance, score_decline,
    compute_confidence, route_actions_and_reasons
)
from validation import validate_dataframe
from sample_data import generate_synthetic_data


def _run_pipeline(df, settings=None):
    settings = settings or AgentSettings()
    vr = validate_dataframe(df)
    assert vr.passed, f"Validation failed: {vr.missing_required}"
    clean = preprocess(df, vr.column_map, vr.available_optional, settings.min_impressions)
    return compute_scores(clean, settings)


def test_smooth_striking_distance_score_across_positions():
    df = pd.DataFrame({'avg_position': [1.0, 3.0, 5.0, 7.0, 9.0, 11.0, 15.0, 25.0]})
    scores = score_striking_distance(df)

    pos7_idx = 3
    assert scores.iloc[pos7_idx] > scores.iloc[0]
    assert scores.iloc[pos7_idx] > scores.iloc[6]

    unique_scores = len(set(scores.round(2)))
    assert unique_scores >= 5


def test_decline_magnitude_affects_score_continuously():
    df = pd.DataFrame({
        'impressions': [10000] * 4,
        'trend_pct': [-5.0, -20.0, -40.0, -80.0]
    })
    scores = score_decline(df)
    assert scores.iloc[0] < scores.iloc[1] < scores.iloc[2] <= scores.iloc[3]


def test_low_volume_extreme_decline_does_not_outrank_high_volume():
    df = pd.DataFrame({
        'page_id': ['low_vol', 'high_vol'],
        'impressions': [2, 10000],
        'clicks': [0, 500],
        'avg_position': [7.0, 7.0],
        'trend_pct': [-100.0, -40.0],
    })
    scored = _run_pipeline(df, AgentSettings(min_impressions=1))
    low_vol_score = scored[scored['masked_page_id'].str.contains('low_vol|PAGE-')]['opportunity_score'].iloc[0]
    high_vol_score = scored[scored['masked_page_id'].str.contains('high_vol|PAGE-')]['opportunity_score'].iloc[1]
    assert high_vol_score > low_vol_score


def test_top_scores_not_all_identical():
    df = generate_synthetic_data(250)
    scored = _run_pipeline(df)
    top50 = scored.head(50)
    unique_top_scores = top50['opportunity_score'].nunique()
    assert unique_top_scores >= 10, f"Only {unique_top_scores} unique scores in top 50"


def test_confidence_score_range_and_tiers():
    df = generate_synthetic_data(250)
    scored = _run_pipeline(df)
    conf_scores = scored['confidence_score']
    assert (conf_scores >= 0).all() and (conf_scores <= 100).all()
    assert set(scored['confidence_level'].unique()).issubset({'HIGH', 'MEDIUM', 'LOW'})


def test_synthetic_row_achieves_high_confidence():
    df = generate_synthetic_data(250)
    scored = _run_pipeline(df)
    high_conf_rows = (scored['confidence_level'] == 'HIGH').sum()
    assert high_conf_rows > 0, "At least one row should achieve HIGH confidence"


def test_missing_optional_fields_reduces_confidence_gracefully():
    df_full = pd.DataFrame({
        'page_id': ['p1'], 'impressions': [10000], 'clicks': [500], 'avg_position': [7.0],
        'trend_pct': [-20.0], 'engagement_rate': [0.08], 'conversions': [10]
    })
    df_minimal = pd.DataFrame({
        'page_id': ['p1'], 'impressions': [10000], 'clicks': [500], 'avg_position': [7.0]
    })
    s_full = _run_pipeline(df_full)
    s_min = _run_pipeline(df_minimal)

    assert s_full['confidence_score'].iloc[0] > s_min['confidence_score'].iloc[0]


def test_at_least_four_different_primary_actions_in_synthetic():
    df = generate_synthetic_data(250)
    scored = _run_pipeline(df)
    unique_actions = scored['primary_action'].nunique()
    assert unique_actions >= 4, f"Expected >= 4 primary actions, got {unique_actions}"


def test_low_ctr_routes_to_title_meta_review():
    df = pd.DataFrame({
        'page_id': ['p1'], 'impressions': [20000], 'clicks': [10], 'avg_position': [5.0]
    })
    scored = _run_pipeline(df)
    action = scored['primary_action'].iloc[0]
    assert action == ACTION_DESCRIPTIONS['HIGH_IMPRESSIONS_LOW_CTR']


def test_decline_plus_stale_content_routes_to_content_refresh():
    df = pd.DataFrame({
        'page_id': ['p1'], 'impressions': [10000], 'clicks': [200], 'avg_position': [8.0],
        'trend_pct': [-35.0], 'content_age_days': [300]
    })
    scored = _run_pipeline(df)
    action = scored['primary_action'].iloc[0]
    assert 'refresh' in action.lower() or 'decline' in action.lower()


def test_low_engagement_routes_to_intent_alignment():
    df = pd.DataFrame({
        'page_id': ['p1'], 'impressions': [15000], 'clicks': [600], 'avg_position': [4.0],
        'engagement_rate': [0.001]
    })
    scored = _run_pipeline(df)
    action = scored['primary_action'].iloc[0]
    assert 'intent' in action.lower() or 'alignment' in action.lower() or 'engagement' in action.lower()


def test_insufficient_evidence_routes_to_monitoring():
    df = pd.DataFrame({
        'page_id': ['p1'], 'impressions': [10], 'clicks': [0], 'avg_position': [20.0]
    })
    scored = _run_pipeline(df, AgentSettings(min_impressions=1))
    action = scored['primary_action'].iloc[0]
    assert 'monitor' in action.lower() or 'evidence' in action.lower()


def test_all_component_scores_and_final_scores_between_0_and_100():
    df = generate_synthetic_data(250)
    scored = _run_pipeline(df)

    for col in ['ctr_component', 'striking_distance_component', 'decline_component',
                'engagement_component', 'business_value_component', 'opportunity_score']:
        scores = scored[col]
        assert (scores >= 0.0).all() and (scores <= 100.0).all(), f"Column {col} out of 0-100 range"


def test_ranking_is_deterministic():
    df = generate_synthetic_data(100)
    s1 = _run_pipeline(df)
    s2 = _run_pipeline(df)
    pd.testing.assert_frame_equal(s1[['opportunity_score', 'masked_page_id']], s2[['opportunity_score', 'masked_page_id']])


def test_no_action_contains_irreversible_execution_language():
    for code, desc in ACTION_DESCRIPTIONS.items():
        desc_lower = desc.lower()
        assert 'automatically publish' not in desc_lower
        assert 'automatically delete' not in desc_lower
        assert 'automatically merge' not in desc_lower
