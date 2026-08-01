
from __future__ import annotations
import logging
from typing import Dict, List
import numpy as np
import pandas as pd
from config import DEFAULT_MIN_IMPRESSIONS

logger = logging.getLogger(__name__)


def _safe_divide(numerator, denominator):
    denom = denominator.replace(0, np.nan)
    return numerator / denom


def preprocess(df, column_map, available_optional, min_impressions=DEFAULT_MIN_IMPRESSIONS):
    out = df.copy()
    rename_map = {v: k for k, v in column_map.items() if v in out.columns}
    out = out.rename(columns=rename_map)

    numeric_cols = [
        'impressions','clicks','avg_position','ctr','trend_pct','prev_impressions',
        'prev_clicks','engagement_rate','content_age_days','conversions',
        'revenue','active_days','position_volatility','visible_queries',
    ]
    for col in numeric_cols:
        if col in out.columns:
            out[col] = pd.to_numeric(out[col], errors='coerce')

    # CTR percentage correction (FlyRank stores CTR as pct e.g. 0.76 = 0.76%)
    if 'ctr' in out.columns:
        max_ctr = out['ctr'].max(skipna=True)
        if pd.notna(max_ctr) and max_ctr > 1.0:
            out['ctr'] = out['ctr'] / 100.0

    # avg_position == 0 is a no-data sentinel
    if 'avg_position' in out.columns:
        out = out[out['avg_position'] != 0].copy()

    # Derive CTR if absent
    if 'ctr' not in out.columns and 'impressions' in out.columns and 'clicks' in out.columns:
        out['ctr'] = _safe_divide(out['clicks'], out['impressions'])

    # Filter min impressions
    out = out[out['impressions'] >= min_impressions].copy()

    # Derive trend_pct when absent
    if 'trend_pct' not in out.columns:
        if 'prev_impressions' in out.columns:
            change = out['impressions'] - out['prev_impressions']
            out['trend_pct'] = _safe_divide(change, out['prev_impressions'].abs()) * 100.0
        elif 'prev_clicks' in out.columns:
            change = out['clicks'] - out['prev_clicks']
            out['trend_pct'] = _safe_divide(change, out['prev_clicks'].abs()) * 100.0

    # has_* flags
    all_optional = [
        'ctr','trend_pct','trend_direction','prev_impressions','prev_clicks',
        'engagement_rate','content_age_days','visible_queries','conversions',
        'revenue','active_days','position_volatility',
    ]
    for col in all_optional:
        flag_col = 'has_' + col
        if col in out.columns:
            out[flag_col] = out[col].notna().astype(int)
        else:
            out[flag_col] = 0

    return out.reset_index(drop=True)
