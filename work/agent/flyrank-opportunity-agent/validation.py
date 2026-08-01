
from __future__ import annotations
import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional
import pandas as pd
from config import COLUMN_ALIASES, OPTIONAL_FIELDS, REQUIRED_FIELDS

logger = logging.getLogger(__name__)

EXAMPLE_SCHEMA = """
Required columns (at least one alias per group must be present):
  page identifier : page_id | content_id | landing_page | url
  impressions     : impressions | impressions_90d | gsc_impressions
  clicks          : clicks | clicks_90d | gsc_clicks
  avg_position    : avg_position | gsc_avg_position | position

Optional columns:
  ctr, trend_pct, trend_direction, engagement_rate, conversions,
  revenue, content_age_days, active_days, position_volatility

Example minimal header row:
  page_id,impressions,clicks,avg_position
"""


@dataclass
class ValidationResult:
    passed: bool
    column_map: Dict[str, str]
    available_optional: List[str]
    missing_required: List[str]
    warnings: List[str] = field(default_factory=list)
    row_count: int = 0
    valid_row_count: int = 0
    example_schema: str = EXAMPLE_SCHEMA


def _resolve_aliases(df_columns: List[str], aliases: Dict[str, List[str]]) -> Dict[str, str]:
    col_lower = {c.lower(): c for c in df_columns}
    resolved: Dict[str, str] = {}
    for canonical, alias_list in aliases.items():
        for alias in alias_list:
            if alias.lower() in col_lower:
                resolved[canonical] = col_lower[alias.lower()]
                break
    return resolved


def validate_dataframe(df: pd.DataFrame) -> ValidationResult:
    if df is None or df.empty:
        return ValidationResult(
            passed=False, column_map={}, available_optional=[],
            missing_required=REQUIRED_FIELDS,
            warnings=["The uploaded file is empty."],
        )
    resolved = _resolve_aliases(list(df.columns), COLUMN_ALIASES)
    missing_required = [f for f in REQUIRED_FIELDS if f not in resolved]
    available_optional = [f for f in OPTIONAL_FIELDS if f in resolved]
    warnings: List[str] = []
    row_count = len(df)
    valid_row_count = row_count
    if not missing_required:
        imp_col = resolved["impressions"]
        pos_col = resolved["avg_position"]
        null_imp = int(df[imp_col].isna().sum())
        if null_imp > 0:
            warnings.append(f"{null_imp} rows have null impressions and will be excluded.")
        zero_pos = int((df[pos_col] == 0).sum())
        if zero_pos > 0:
            warnings.append(f"{zero_pos} rows have avg_position=0 (no-data sentinel) and will be excluded.")
        if "ctr" in resolved:
            ctr_col = resolved["ctr"]
            max_ctr = df[ctr_col].max(skipna=True)
            if pd.notna(max_ctr) and max_ctr > 1.0:
                warnings.append(
                    f"CTR column appears to be stored as a percentage (max={max_ctr:.2f}). "
                    "It will be divided by 100 during preprocessing."
                )
        valid_row_count = int(df[imp_col].notna().sum())
    return ValidationResult(
        passed=len(missing_required) == 0,
        column_map=resolved,
        available_optional=available_optional,
        missing_required=missing_required,
        warnings=warnings,
        row_count=row_count,
        valid_row_count=valid_row_count,
        example_schema=EXAMPLE_SCHEMA,
    )
