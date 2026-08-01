import sys
from pathlib import Path
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from validation import validate_dataframe
from preprocessing import preprocess


def test_avg_position_zero_excluded():
    df = pd.DataFrame({
        'page_id': ['p1', 'p2'],
        'impressions': [1000, 2000],
        'clicks': [50, 100],
        'avg_position': [0, 5.5]
    })
    vr = validate_dataframe(df)
    clean = preprocess(df, vr.column_map, vr.available_optional, min_impressions=100)
    assert len(clean) == 1
    assert clean['avg_position'].iloc[0] == 5.5


def test_ctr_percentage_converted_correctly():
    df = pd.DataFrame({
        'page_id': ['p1'],
        'impressions': [1000],
        'clicks': [50],
        'avg_position': [4.0],
        'ctr': [5.0]
    })
    vr = validate_dataframe(df)
    clean = preprocess(df, vr.column_map, vr.available_optional, min_impressions=100)
    assert clean['ctr'].iloc[0] == 0.05
