from __future__ import annotations
import random
from pathlib import Path
import numpy as np
import pandas as pd
from config import SYNTHETIC_CSV


def generate_synthetic_data(n_rows: int = 250, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    random.seed(seed)
    n = n_rows
    page_ids = [f'https://example.com/page-{i:04d}' for i in range(n)]

    scenario_weights = [
        ('high_imp_low_ctr', 0.25),
        ('striking_distance', 0.25),
        ('declining', 0.20),
        ('weak_engagement', 0.10),
        ('high_value', 0.10),
        ('insufficient_data', 0.10),
    ]

    scenario_names = [s for s, _ in scenario_weights]
    scenario_probs = [p for _, p in scenario_weights]
    scenarios = rng.choice(scenario_names, size=n, p=scenario_probs, replace=True)

    rows = [_build_row(i, sc, rng) for i, sc in enumerate(scenarios)]
    df = pd.DataFrame(rows)
    df.insert(0, 'page_id', page_ids)
    return df


def _build_row(idx: int, scenario: str, rng: np.random.Generator) -> dict:
    if scenario == 'high_imp_low_ctr':
        imp = int(rng.uniform(8000, 60000))
        pos = float(rng.uniform(4.5, 9.5))
        ctr = float(rng.uniform(0.002, 0.012))
        clicks = int(imp * ctr)
        prev_imp = int(imp * rng.uniform(0.95, 1.05))
        return dict(impressions=imp, clicks=clicks, avg_position=pos, ctr=ctr,
                    prev_impressions=prev_imp, prev_clicks=int(prev_imp * ctr),
                    trend_pct=float((imp - prev_imp) / max(prev_imp, 1) * 100),
                    engagement_rate=float(rng.uniform(0.03, 0.12)),
                    content_age_days=int(rng.uniform(40, 300)),
                    conversions=None, revenue=None,
                    active_days=int(rng.uniform(70, 90)))

    elif scenario == 'striking_distance':
        imp = int(rng.uniform(3000, 25000))
        pos = float(rng.uniform(5.0, 11.0))
        ctr = float(rng.uniform(0.02, 0.05))
        clicks = int(imp * ctr)
        prev_imp = int(imp * rng.uniform(0.9, 1.1))
        return dict(impressions=imp, clicks=clicks, avg_position=pos, ctr=ctr,
                    prev_impressions=prev_imp, prev_clicks=int(prev_imp * ctr),
                    trend_pct=float((imp - prev_imp) / max(prev_imp, 1) * 100),
                    engagement_rate=float(rng.uniform(0.04, 0.15)),
                    content_age_days=int(rng.uniform(30, 180)),
                    conversions=None, revenue=None,
                    active_days=int(rng.uniform(60, 90)))

    elif scenario == 'declining':
        imp = int(rng.uniform(1500, 20000))
        pos = float(rng.uniform(6.0, 18.0))
        ctr = float(rng.uniform(0.01, 0.04))
        clicks = int(imp * ctr)
        prev_imp = int(imp * rng.uniform(1.4, 2.8))
        trend = float((imp - prev_imp) / max(prev_imp, 1) * 100)
        return dict(impressions=imp, clicks=clicks, avg_position=pos, ctr=ctr,
                    prev_impressions=prev_imp, prev_clicks=int(prev_imp * ctr * 1.5),
                    trend_pct=trend,
                    engagement_rate=float(rng.uniform(0.01, 0.05)),
                    content_age_days=int(rng.uniform(200, 600)),
                    conversions=None, revenue=None,
                    active_days=int(rng.uniform(40, 80)))

    elif scenario == 'weak_engagement':
        imp = int(rng.uniform(4000, 30000))
        pos = float(rng.uniform(3.0, 10.0))
        ctr = float(rng.uniform(0.03, 0.08))
        clicks = int(imp * ctr)
        prev_imp = int(imp * rng.uniform(0.95, 1.05))
        return dict(impressions=imp, clicks=clicks, avg_position=pos, ctr=ctr,
                    prev_impressions=prev_imp, prev_clicks=int(prev_imp * ctr),
                    trend_pct=float((imp - prev_imp) / max(prev_imp, 1) * 100),
                    engagement_rate=float(rng.uniform(0.001, 0.015)),
                    content_age_days=int(rng.uniform(60, 300)),
                    conversions=None, revenue=None,
                    active_days=int(rng.uniform(60, 90)))

    elif scenario == 'high_value':
        imp = int(rng.uniform(2000, 15000))
        pos = float(rng.uniform(2.5, 8.0))
        ctr = float(rng.uniform(0.04, 0.12))
        clicks = int(imp * ctr)
        prev_imp = int(imp * rng.uniform(0.9, 1.1))
        return dict(impressions=imp, clicks=clicks, avg_position=pos, ctr=ctr,
                    prev_impressions=prev_imp, prev_clicks=int(prev_imp * ctr),
                    trend_pct=float((imp - prev_imp) / max(prev_imp, 1) * 100),
                    engagement_rate=float(rng.uniform(0.10, 0.30)),
                    content_age_days=int(rng.uniform(30, 200)),
                    conversions=int(rng.uniform(25, 250)),
                    revenue=float(rng.uniform(1000, 15000)),
                    active_days=int(rng.uniform(80, 90)))

    else:  # insufficient_data
        imp = int(rng.uniform(10, 90))
        pos = float(rng.uniform(8.0, 35.0))
        ctr = float(rng.uniform(0.001, 0.05))
        clicks = int(imp * ctr)
        return dict(impressions=imp, clicks=clicks, avg_position=pos, ctr=ctr,
                    prev_impressions=None, prev_clicks=None, trend_pct=None,
                    engagement_rate=None, content_age_days=int(rng.uniform(5, 40)),
                    conversions=None, revenue=None, active_days=int(rng.uniform(1, 15)))


def save_synthetic_data(n_rows: int = 250) -> Path:
    df = generate_synthetic_data(n_rows)
    SYNTHETIC_CSV.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(SYNTHETIC_CSV, index=False)
    return SYNTHETIC_CSV


if __name__ == '__main__':
    path = save_synthetic_data()
    print(f"Synthetic data saved to: {path}")
