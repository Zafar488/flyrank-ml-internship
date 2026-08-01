from __future__ import annotations
import hashlib
import logging
import re
import pandas as pd
from config import PRIVACY_MASK_PREFIX

logger = logging.getLogger(__name__)

RAW_IDENTIFIER_COLS = [
    'page_id', 'client_id', 'content_id', 'landing_page', 'landing_page_url',
    'url', 'domain', 'query', 'visible_queries', 'content_hash_id',
]


def _hash_id(value: str) -> str:
    digest = hashlib.sha256(str(value).encode('utf-8')).hexdigest()
    return digest[:8].upper()


def mask_page_ids(series: pd.Series) -> pd.Series:
    return series.apply(lambda v: f"{PRIVACY_MASK_PREFIX}{_hash_id(str(v))}")


def apply_privacy(df: pd.DataFrame, privacy_mode: bool) -> pd.DataFrame:
    out = df.copy()

    # Find any page identifier column present
    id_col = None
    for col in ['page_id', 'content_id', 'landing_page', 'url', 'landing_page_url']:
        if col in out.columns:
            id_col = col
            break

    if id_col is not None:
        out['masked_page_id'] = mask_page_ids(out[id_col])
    elif 'masked_page_id' not in out.columns:
        out['masked_page_id'] = 'PAGE-UNKNOWN'

    if privacy_mode:
        # Drop all raw identifier columns
        drop_cols = [c for c in RAW_IDENTIFIER_COLS if c in out.columns]
        out.drop(columns=drop_cols, inplace=True, errors='ignore')

    return out
