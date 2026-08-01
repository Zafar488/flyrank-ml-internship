import sys
from pathlib import Path
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from privacy import mask_page_ids, apply_privacy
from agent import OpportunityAgent, SAFE_EXPORT_COLUMNS
from config import AgentSettings, LOGS_DIR, OUTPUTS_DIR


def test_privacy_mode_masks_ui_data():
    df = pd.DataFrame({
        'page_id': ['https://secret-client.com/private-page'],
        'client_id': ['client-12345'],
        'content_id': ['content-999'],
        'landing_page': ['/private-landing'],
        'impressions': [5000],
        'clicks': [250],
        'avg_position': [6.0]
    })
    agent = OpportunityAgent(settings=AgentSettings(privacy_mode=True))
    run = agent.run(df)
    assert run.success
    results = run.results_df

    masked_id = results['masked_page_id'].iloc[0]
    assert 'secret-client' not in masked_id
    assert 'private-page' not in masked_id
    assert masked_id.startswith('PAGE-')

    # Raw identifier columns must be absent from results DataFrame
    for raw_col in ['page_id', 'client_id', 'content_id', 'landing_page', 'url', 'domain']:
        assert raw_col not in results.columns


def test_privacy_mode_masks_csv_export():
    df = pd.DataFrame({
        'page_id': ['https://secret-client.com/private-page'],
        'client_id': ['secret-client-id-007'],
        'content_id': ['secret-content-777'],
        'impressions': [5000],
        'clicks': [250],
        'avg_position': [6.0]
    })
    agent = OpportunityAgent(settings=AgentSettings(privacy_mode=True))
    run = agent.run(df)
    csv_str = run.results_df.to_csv(index=False)

    assert 'secret-client' not in csv_str
    assert 'private-page' not in csv_str
    assert 'secret-content-777' not in csv_str


def test_privacy_mode_masks_text_report():
    df = pd.DataFrame({
        'page_id': ['https://secret-client.com/private-page'],
        'client_id': ['secret-client-id-007'],
        'impressions': [5000],
        'clicks': [250],
        'avg_position': [6.0]
    })
    agent = OpportunityAgent(settings=AgentSettings(privacy_mode=True))
    run = agent.run(df)
    explanation = run.results_df['explanation'].iloc[0]
    assert 'secret-client' not in explanation
    assert 'private-page' not in explanation


def test_export_contains_only_approved_columns():
    df = pd.DataFrame({
        'page_id': ['https://example.com/p1'],
        'client_id': ['c123'],
        'impressions': [5000],
        'clicks': [250],
        'avg_position': [6.0]
    })
    agent = OpportunityAgent(settings=AgentSettings(privacy_mode=True))
    run = agent.run(df)
    cols = list(run.results_df.columns)

    # Every column in output must be in SAFE_EXPORT_COLUMNS
    for c in cols:
        assert c in SAFE_EXPORT_COLUMNS, f"Unapproved column {c} found in export!"

    # Raw identifier columns must be completely absent
    for raw in ['page_id', 'client_id', 'content_id', 'url', 'landing_page']:
        assert raw not in cols


def test_logs_contain_no_raw_identifiers():
    df = pd.DataFrame({
        'page_id': ['https://secret-client.com/super-secret-slug'],
        'impressions': [5000],
        'clicks': [250],
        'avg_position': [6.0]
    })
    agent = OpportunityAgent(settings=AgentSettings(privacy_mode=True))
    run = agent.run(df)

    log_files = list(LOGS_DIR.glob(f"run_{run.run_timestamp}.log"))
    assert len(log_files) > 0
    log_content = log_files[0].read_text(encoding='utf-8')

    assert 'super-secret-slug' not in log_content
    assert 'secret-client.com' not in log_content
