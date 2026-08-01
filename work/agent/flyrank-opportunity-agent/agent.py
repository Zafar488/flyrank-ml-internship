from __future__ import annotations
import json
import logging
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional
import pandas as pd
from config import AgentSettings, LOGS_DIR, OUTPUTS_DIR, GUARDRAIL_NOTE, SAFE_EXPORT_COLUMNS
from explanations import add_explanations
from preprocessing import preprocess
from privacy import apply_privacy
from scoring import compute_scores
from validation import validate_dataframe, ValidationResult

logger = logging.getLogger(__name__)


@dataclass
class StageResult:
    stage: str
    status: str
    message: str
    data: Any = None
    elapsed_ms: float = 0.0


@dataclass
class AgentRunMetrics:
    rows_loaded: int = 0
    rows_excluded_avg_pos_zero: int = 0
    rows_excluded_min_impressions: int = 0
    eligible_pages_scored: int = 0
    recommendations_displayed: int = 0
    all_eligible_high_conf: int = 0
    all_eligible_med_conf: int = 0
    all_eligible_low_conf: int = 0


@dataclass
class AgentRun:
    stages: List[StageResult] = field(default_factory=list)
    results_df: Optional[pd.DataFrame] = None
    all_scored_df: Optional[pd.DataFrame] = None
    validation: Optional[ValidationResult] = None
    metrics: AgentRunMetrics = field(default_factory=AgentRunMetrics)
    success: bool = False
    error_message: str = ""
    run_timestamp: str = ""





class OpportunityAgent:
    def __init__(self, settings: Optional[AgentSettings] = None, progress_callback: Optional[Callable[[str, str], None]] = None):
        self.settings = settings or AgentSettings()
        self._progress = progress_callback or (lambda stage, msg: None)

    def _stage(self, name: str, fn: Callable[..., Any], *args: Any, **kwargs: Any) -> StageResult:
        start = time.time()
        try:
            self._progress(name, f"Running {name}...")
            result = fn(*args, **kwargs)
            elapsed = (time.time() - start) * 1000.0
            return StageResult(stage=name, status='ok', message=f"{name} completed.", data=result, elapsed_ms=elapsed)
        except Exception as exc:
            elapsed = (time.time() - start) * 1000.0
            logger.exception("Stage %s failed: %s", name, exc)
            return StageResult(stage=name, status='error', message=str(exc), elapsed_ms=elapsed)

    def _stage_inspect(self, df: pd.DataFrame) -> Dict[str, Any]:
        return {'rows': len(df), 'columns': list(df.columns)}

    def _stage_validate(self, df: pd.DataFrame) -> ValidationResult:
        return validate_dataframe(df)

    def _stage_map_columns(self, validation: ValidationResult) -> Dict[str, str]:
        return validation.column_map

    def _stage_preprocess(self, df: pd.DataFrame, validation: ValidationResult) -> Tuple[pd.DataFrame, AgentRunMetrics]:
        metrics = AgentRunMetrics(rows_loaded=len(df))

        pos_col = validation.column_map.get('avg_position', 'avg_position')
        if pos_col in df.columns:
            metrics.rows_excluded_avg_pos_zero = int((df[pos_col] == 0).sum())

        clean_df = preprocess(df, validation.column_map, validation.available_optional, self.settings.min_impressions)

        before_min_imp = len(df) - metrics.rows_excluded_avg_pos_zero
        metrics.rows_excluded_min_impressions = max(before_min_imp - len(clean_df), 0)
        metrics.eligible_pages_scored = len(clean_df)

        return clean_df, metrics

    def _stage_calculate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        required = ['impressions', 'clicks', 'avg_position']
        missing = [c for c in required if c not in df.columns]
        if missing:
            raise ValueError(f"Missing required columns after preprocessing: {missing}")
        return df

    def _stage_score(self, df: pd.DataFrame) -> pd.DataFrame:
        return compute_scores(df, self.settings)

    def _stage_reason_codes(self, df: pd.DataFrame) -> pd.DataFrame:
        if 'reason_codes' not in df.columns:
            raise ValueError("reason_codes column missing from scored DataFrame.")
        return df

    def _stage_recommend(self, df: pd.DataFrame) -> pd.DataFrame:
        return df

    def _stage_rank(self, df: pd.DataFrame) -> pd.DataFrame:
        sort_cols = ['opportunity_score', 'confidence_score', 'impressions']
        ascending = [False, False, False]

        if 'ctr_gap' in df.columns:
            sort_cols.append('ctr_gap')
            ascending.append(False)

        if 'trend_pct' in df.columns:
            sort_cols.append('trend_pct')
            ascending.append(True)

        if 'masked_page_id' in df.columns:
            sort_cols.append('masked_page_id')
            ascending.append(True)

        out = df.sort_values(by=sort_cols, ascending=ascending).reset_index(drop=True)
        out['rank'] = out.index + 1

        if self.settings.max_recommendations < len(out):
            out = out.iloc[:self.settings.max_recommendations].copy()
        return out

    def _stage_explain(self, df: pd.DataFrame) -> pd.DataFrame:
        return add_explanations(df)

    def _stage_privacy(self, df: pd.DataFrame) -> pd.DataFrame:
        return apply_privacy(df, self.settings.privacy_mode)

    def _stage_select_output(self, df: pd.DataFrame) -> pd.DataFrame:
        if self.settings.privacy_mode:
            present_cols = [c for c in SAFE_EXPORT_COLUMNS if c in df.columns]
            return df[present_cols].copy()
        else:
            present_cols = [c for c in SAFE_EXPORT_COLUMNS if c in df.columns]
            extra = [c for c in df.columns if c not in present_cols and c not in ['page_id', 'client_id', 'content_id', 'url', 'landing_page', 'domain', 'query']]
            return df[present_cols + extra].copy()

    def _stage_export(self, df: pd.DataFrame, timestamp: str) -> str:
        OUTPUTS_DIR.mkdir(exist_ok=True)
        path = OUTPUTS_DIR / f"opportunities_{timestamp}.csv"
        export_df = df.copy()
        for col in ['reason_codes', 'reason_code_evidence', 'secondary_actions', 'component_scores']:
            if col in export_df.columns:
                export_df[col] = export_df[col].apply(
                    lambda v: json.dumps(v) if isinstance(v, (list, dict)) else str(v)
                )
        export_df.to_csv(path, index=False)
        return str(path)

    def _stage_log_run(self, run: AgentRun, timestamp: str) -> None:
        LOGS_DIR.mkdir(exist_ok=True)
        log_path = LOGS_DIR / f"run_{timestamp}.log"
        lines = [
            f"FlyRank Opportunity Scout -- Run Log: {timestamp}",
            f"Privacy Mode: {self.settings.privacy_mode}",
            f"Rows Loaded: {run.metrics.rows_loaded}",
            f"Eligible Pages Scored: {run.metrics.eligible_pages_scored}",
            f"Recommendations Displayed: {run.metrics.recommendations_displayed}",
        ]
        for sr in run.stages:
            lines.append(f"[{sr.status.upper()}] {sr.stage}: {sr.message} ({sr.elapsed_ms:.0f} ms)")
        log_path.write_text('\n'.join(lines), encoding='utf-8')

    def run(self, df: pd.DataFrame) -> AgentRun:
        timestamp = time.strftime('%Y%m%d_%H%M%S')
        run = AgentRun(run_timestamp=timestamp)

        s = self._stage('1_inspect', self._stage_inspect, df)
        run.stages.append(s)

        s = self._stage('2_validate', self._stage_validate, df)
        run.stages.append(s)
        if s.status == 'error':
            run.error_message = s.message
            self._stage_log_run(run, timestamp)
            return run
        validation = s.data
        run.validation = validation
        if not validation.passed:
            run.error_message = f"Validation failed. Missing required fields: {', '.join(validation.missing_required)}"
            self._stage_log_run(run, timestamp)
            return run

        s = self._stage('3_map_columns', self._stage_map_columns, validation)
        run.stages.append(s)

        s = self._stage('4_preprocess', self._stage_preprocess, df, validation)
        run.stages.append(s)
        if s.status == 'error':
            run.error_message = s.message
            self._stage_log_run(run, timestamp)
            return run
        clean_df, metrics = s.data
        run.metrics = metrics

        if clean_df.empty:
            run.error_message = "No rows remain after preprocessing. Check the minimum-impression threshold."
            self._stage_log_run(run, timestamp)
            return run

        s = self._stage('5_calculate_signals', self._stage_calculate_signals, clean_df)
        run.stages.append(s)
        if s.status == 'error':
            run.error_message = s.message
            self._stage_log_run(run, timestamp)
            return run

        s = self._stage('6_score', self._stage_score, clean_df)
        run.stages.append(s)
        if s.status == 'error':
            run.error_message = s.message
            self._stage_log_run(run, timestamp)
            return run
        scored_df = s.data

        if 'confidence_level' in scored_df.columns:
            run.metrics.all_eligible_high_conf = int((scored_df['confidence_level'] == 'HIGH').sum())
            run.metrics.all_eligible_med_conf = int((scored_df['confidence_level'] == 'MEDIUM').sum())
            run.metrics.all_eligible_low_conf = int((scored_df['confidence_level'] == 'LOW').sum())

        run.all_scored_df = scored_df

        s = self._stage('7_reason_codes', self._stage_reason_codes, scored_df)
        run.stages.append(s)

        s = self._stage('8_recommend', self._stage_recommend, scored_df)
        run.stages.append(s)

        s = self._stage('11_privacy', self._stage_privacy, scored_df)
        run.stages.append(s)
        if s.status != 'error':
            scored_df = s.data

        s = self._stage('9_rank', self._stage_rank, scored_df)
        run.stages.append(s)
        if s.status == 'error':
            run.error_message = s.message
            self._stage_log_run(run, timestamp)
            return run
        ranked_df = s.data
        run.metrics.recommendations_displayed = len(ranked_df)

        s = self._stage('10_explain', self._stage_explain, ranked_df)
        run.stages.append(s)
        if s.status != 'error':
            ranked_df = s.data

        output_df = self._stage_select_output(ranked_df)
        try:
            self._stage_export(output_df, timestamp)
        except Exception as exc:
            logger.warning("Export failed (non-critical): %s", exc)

        run.results_df = output_df
        run.success = True
        self._stage_log_run(run, timestamp)
        return run
