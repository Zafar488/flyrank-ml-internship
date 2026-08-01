from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List

AGENT_DIR = Path(__file__).parent
DATA_DIR = AGENT_DIR / 'data'
OUTPUTS_DIR = AGENT_DIR / 'outputs'
LOGS_DIR = AGENT_DIR / 'logs'
SYNTHETIC_CSV = DATA_DIR / 'synthetic_search_data.csv'

DEFAULT_MIN_IMPRESSIONS: int = 100
DEFAULT_MAX_RECOMMENDATIONS: int = 50

DEFAULT_WEIGHTS: Dict[str, float] = {
    'ctr_opportunity': 0.35,
    'striking_distance': 0.25,
    'decline': 0.20,
    'engagement_opportunity': 0.15,
    'business_value': 0.05,
}

POSITION_BUCKETS = [
    (0.0, 3.0, '1-3'), (3.0, 5.0, '3-5'), (5.0, 10.0, '5-10'),
    (10.0, 15.0, '10-15'), (15.0, 30.0, '15-30'), (30.0, float('inf'), '30+'),
]

STRIKING_DISTANCE_MIN: float = 3.0
STRIKING_DISTANCE_MAX: float = 15.0
STRIKING_DISTANCE_PEAK: float = 7.0

CONFIDENCE_TIERS = {
    'HIGH': (70, 100),
    'MEDIUM': (40, 69),
    'LOW': (0, 39),
}

REASON_CODES = [
    'HIGH_IMPRESSIONS_LOW_CTR', 'STRIKING_DISTANCE', 'DECLINING_IMPRESSIONS',
    'DECLINING_CLICKS', 'LOW_ENGAGEMENT', 'HIGH_VALUE_PAGE',
    'POSSIBLE_INTENT_MISMATCH', 'POSSIBLE_REFRESH_OPPORTUNITY',
    'INSUFFICIENT_DATA', 'MONITOR_ONLY', 'DATA_QUALITY_REVIEW',
]

ACTION_DESCRIPTIONS: Dict[str, str] = {
    'HIGH_IMPRESSIONS_LOW_CTR': 'Review title and meta description',
    'STRIKING_DISTANCE': 'Optimise snippet and strengthen on-page relevance',
    'DECLINING_IMPRESSIONS': 'Review and refresh declining content',
    'DECLINING_CLICKS': 'Investigate CTR loss and SERP changes',
    'LOW_ENGAGEMENT': 'Review search-intent and content alignment',
    'HIGH_VALUE_PAGE': 'Prioritise for manual commercial review',
    'POSSIBLE_INTENT_MISMATCH': 'Review query-to-page intent alignment',
    'POSSIBLE_REFRESH_OPPORTUNITY': 'Refresh and expand content',
    'INSUFFICIENT_DATA': 'Monitor and collect more evidence',
    'MONITOR_ONLY': 'Monitor and collect more evidence',
    'DATA_QUALITY_REVIEW': 'Investigate tracking or data quality',
}

GUARDRAIL_NOTE = (
    'This is a directional, decision-support signal only. '
    'Scores reflect observed patterns, not causal effects. '
    'Human review is required before any content decision. '
    'No automatic or irreversible action (such as automatic publishing, deletion, or merging) should be taken based on this output.'
)

COLUMN_ALIASES: Dict[str, List[str]] = {
    'page_id': ['page_id','content_id','content_hash_id','landing_page','landing_page_url','url'],
    'impressions': ['impressions','impressions_90d','gsc_impressions','previous_impressions','imp_prev30','imp_prev60','impressions_last_30d'],
    'clicks': ['clicks','clicks_90d','gsc_clicks','previous_clicks','clk_prev30','clicks_prev60','clicks_last_30d'],
    'avg_position': ['avg_position','gsc_avg_position','position','avg_position_prev60','pos_last30'],
    'ctr': ['ctr','gsc_ctr'],
    'trend_pct': ['trend_pct','impression_change_pct','click_change_pct'],
    'trend_direction': ['trend_direction'],
    'prev_impressions': ['previous_impressions','impressions_prev_30d','imp_prev30','imp_prev60','impressions_prev30'],
    'prev_clicks': ['previous_clicks','clicks_prev_30d','clk_prev30','clicks_prev60','clicks_prev30'],
    'engagement_rate': ['engagement_rate','engaged_sessions','sessions','engaged_sessions_90d'],
    'content_age_days': ['content_age_days','days_since_last_update','days_since_update'],
    'visible_queries': ['visible_queries','query_count'],
    'conversions': ['conversions'],
    'revenue': ['revenue'],
    'active_days': ['active_days','days_with_impressions','days_with_sessions'],
    'position_volatility': ['position_volatility'],
}

REQUIRED_FIELDS: List[str] = ['page_id','impressions','clicks','avg_position']
OPTIONAL_FIELDS: List[str] = [
    'ctr','trend_pct','trend_direction','prev_impressions','prev_clicks',
    'engagement_rate','content_age_days','visible_queries','conversions',
    'revenue','active_days','position_volatility',
]
PRIVACY_MASK_PREFIX: str = 'PAGE-'


@dataclass
class AgentSettings:
    min_impressions: int = DEFAULT_MIN_IMPRESSIONS
    max_recommendations: int = DEFAULT_MAX_RECOMMENDATIONS
    weights: Dict[str, float] = field(default_factory=lambda: dict(DEFAULT_WEIGHTS))
    privacy_mode: bool = True
    include_low_confidence: bool = True

    def validate_weights(self) -> None:
        total = sum(self.weights.values())
        if total == 0:
            self.weights = dict(DEFAULT_WEIGHTS)
        else:
            self.weights = {k: v / total for k, v in self.weights.items()}

SAFE_EXPORT_COLUMNS: List[str] = [
    'rank', 'masked_page_id', 'opportunity_score', 'confidence_score',
    'confidence_level', 'impressions', 'clicks', 'ctr', 'avg_position',
    'expected_ctr', 'ctr_gap', 'trend_pct', 'engagement_rate',
    'dominant_component', 'reason_codes', 'reason_code_evidence',
    'primary_action', 'secondary_actions', 'action_basis',
    'explanation', 'guardrail_note',
]
