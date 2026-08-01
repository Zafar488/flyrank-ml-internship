import sys
from pathlib import Path
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from agent import OpportunityAgent
from config import AgentSettings
from sample_data import generate_synthetic_data


def test_summary_metrics_distinguish_eligible_pages_from_displayed():
    df = generate_synthetic_data(100)
    agent = OpportunityAgent(settings=AgentSettings(max_recommendations=10))
    run = agent.run(df)
    assert run.success
    m = run.metrics
    assert m.rows_loaded == 100
    assert m.eligible_pages_scored >= m.recommendations_displayed
    assert m.recommendations_displayed <= 10
