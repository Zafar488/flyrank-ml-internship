from __future__ import annotations
import json
import sys
import logging
from pathlib import Path

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

sys.path.insert(0, str(Path(__file__).parent))

from agent import OpportunityAgent, AgentRun
from config import (
    SAFE_EXPORT_COLUMNS,
    AgentSettings, DEFAULT_MAX_RECOMMENDATIONS, DEFAULT_MIN_IMPRESSIONS,
    DEFAULT_WEIGHTS, GUARDRAIL_NOTE, SYNTHETIC_CSV,
)
from sample_data import generate_synthetic_data, save_synthetic_data
from validation import validate_dataframe, EXAMPLE_SCHEMA

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

st.set_page_config(
    page_title='FlyRank Search Opportunity Scout',
    layout='wide',
    initial_sidebar_state='expanded',
)

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
html, body, [class*="css"] { font-family: 'Inter', sans-serif; }
.main-header {
    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
    padding: 2rem 2.5rem; border-radius: 16px; margin-bottom: 1.5rem;
    color: white; box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
.main-header h1 { font-size: 2rem; font-weight: 700; margin: 0; }
.main-header p { color: rgba(255,255,255,0.75); margin: 0.5rem 0 0; font-size: 1rem; }
.reason-tag {
    display: inline-block; background: rgba(124,131,253,0.15);
    border: 1px solid rgba(124,131,253,0.3); border-radius: 20px;
    padding: 2px 10px; font-size: 0.75rem; color: #a5b4fc; margin: 2px;
}
.guardrail {
    background: rgba(245,158,11,0.1); border-left: 3px solid #f59e0b;
    padding: 0.75rem 1rem; border-radius: 0 8px 8px 0;
    font-size: 0.85rem; color: rgba(255,255,255,0.8);
}
.privacy-banner {
    background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 8px; padding: 0.75rem 1rem; color: #34d399; font-size: 0.9rem;
    margin-bottom: 1rem;
}
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="main-header">
    <h1>FlyRank Search Opportunity Scout</h1>
    <p>A privacy-safe decision-support agent for ranking content-review opportunities.</p>
</div>
""", unsafe_allow_html=True)

with st.sidebar:
    st.markdown('## Settings')
    min_impressions = st.number_input('Minimum impressions', min_value=0, max_value=100000,
                                       value=DEFAULT_MIN_IMPRESSIONS, step=50)
    max_recs = st.number_input('Max recommendations', min_value=1, max_value=500,
                                value=DEFAULT_MAX_RECOMMENDATIONS, step=10)
    st.markdown('### Score weights')
    w_ctr = st.slider('CTR opportunity', 0, 100, int(DEFAULT_WEIGHTS['ctr_opportunity'] * 100))
    w_sd  = st.slider('Striking distance', 0, 100, int(DEFAULT_WEIGHTS['striking_distance'] * 100))
    w_dec = st.slider('Decline', 0, 100, int(DEFAULT_WEIGHTS['decline'] * 100))
    w_eng = st.slider('Engagement opportunity', 0, 100, int(DEFAULT_WEIGHTS['engagement_opportunity'] * 100))
    w_bv  = st.slider('Business value', 0, 100, int(DEFAULT_WEIGHTS['business_value'] * 100))
    privacy_mode = st.toggle('Privacy Mode', value=True,
                              help='Masks page identifiers. Enabled by default for privacy.')
    include_low_conf = st.toggle('Include low-confidence results', value=True)
    st.divider()
    st.markdown('### Download sample CSV')
    if st.button('Generate sample CSV'):
        df_sample = generate_synthetic_data(250)
        csv_bytes = df_sample.to_csv(index=False).encode()
        st.download_button('Download synthetic_search_data.csv', data=csv_bytes,
                           file_name='synthetic_search_data.csv', mime='text/csv')

raw_weights = {
    'ctr_opportunity': float(w_ctr), 'striking_distance': float(w_sd),
    'decline': float(w_dec), 'engagement_opportunity': float(w_eng),
    'business_value': float(w_bv),
}
total_w = sum(raw_weights.values())
weights = {k: v / total_w for k, v in raw_weights.items()} if total_w > 0 else DEFAULT_WEIGHTS

settings = AgentSettings(
    min_impressions=int(min_impressions), max_recommendations=int(max_recs),
    weights=weights, privacy_mode=privacy_mode, include_low_confidence=include_low_conf,
)

if privacy_mode:
    st.markdown("""
    <div class="privacy-banner">
        Privacy Mode is enabled. Identifiers shown in the interface and exported files are masked. No raw page URLs are exposed.
    </div>
    """, unsafe_allow_html=True)

with st.expander('Project & Privacy Notice', expanded=False):
    st.markdown("""
    **FlyRank Search Opportunity Scout -- FL-07 Agent**

    This tool processes uploaded CSV files **locally only**. No data is sent to external APIs or LLMs.

    - Privacy Mode is enabled by default to hash page identifiers before display.
    - Scores are directional signals only -- not causal evidence.
    - Human review is required before any content change.
    - This agent cannot publish, delete, edit, merge, or retire content.
    """)

st.divider()
st.markdown('## Data Source')

tab_upload, tab_local = st.tabs(['Upload CSV', 'Use Sample Data'])
uploaded_df = None

with tab_upload:
    uploaded_file = st.file_uploader('Upload a search performance CSV file', type=['csv'])
    if uploaded_file is not None:
        try:
            uploaded_df = pd.read_csv(uploaded_file)
            st.success(f'File loaded: {len(uploaded_df):,} rows x {len(uploaded_df.columns)} columns')
        except Exception as e:
            st.error(f'Could not parse CSV: {e}')

with tab_local:
    if SYNTHETIC_CSV.exists():
        st.info(f'Found sample dataset: {SYNTHETIC_CSV.name} ({SYNTHETIC_CSV.stat().st_size // 1024} KB)')
        if st.button('Load sample dataset'):
            uploaded_df = pd.read_csv(SYNTHETIC_CSV)
            st.success(f'Sample loaded: {len(uploaded_df):,} rows')
    else:
        st.warning('Sample dataset not found. Click below to generate it.')
        if st.button('Generate and load sample data'):
            save_synthetic_data(250)
            uploaded_df = pd.read_csv(SYNTHETIC_CSV)
            st.success(f'Generated and loaded: {len(uploaded_df):,} rows')

if uploaded_df is None:
    st.info('Upload a CSV file or load the sample dataset to begin.')
    st.stop()

st.divider()
st.markdown('## Validation & Column Mapping')
validation = validate_dataframe(uploaded_df)

if not validation.passed:
    st.error('Validation failed -- required columns are missing.')
    st.markdown('**Missing required fields:**')
    for f in validation.missing_required:
        st.markdown(f'- {f}')
    st.markdown('**Expected CSV schema:**')
    st.code(EXAMPLE_SCHEMA)
    st.stop()

st.success('All required columns resolved.')
col1, col2 = st.columns(2)
with col1:
    st.markdown('**Detected column mapping:**')
    mapping_df = pd.DataFrame([{'Canonical name': k, 'Actual column': v}
                                for k, v in validation.column_map.items()])
    st.dataframe(mapping_df, hide_index=True, use_container_width=True)
with col2:
    st.markdown('**Optional columns available:**')
    if validation.available_optional:
        for f in validation.available_optional:
            st.markdown(f'- {f}')
    else:
        st.markdown('None detected')
    if validation.warnings:
        for warning in validation.warnings:
            st.warning(warning)

st.divider()
run_button = st.button('Run Opportunity Analysis', type='primary', use_container_width=True)

if 'agent_run' not in st.session_state:
    st.session_state.agent_run = None

if run_button:
    progress_placeholder = st.empty()
    stage_log = []

    def progress_callback(stage, msg):
        stage_log.append(f'**{stage}** -- {msg}')
        progress_placeholder.markdown('\n'.join(stage_log[-6:]))

    agent = OpportunityAgent(settings=settings, progress_callback=progress_callback)
    with st.spinner('Running agent workflow...'):
        run = agent.run(uploaded_df.copy())
    st.session_state.agent_run = run
    progress_placeholder.empty()

if st.session_state.agent_run is None:
    st.info('Click Run Opportunity Analysis to start.')
    st.stop()

run = st.session_state.agent_run

st.markdown('### Agent Stage Execution')
cols = st.columns(min(len(run.stages), 6))
for idx, stage in enumerate(run.stages):
    col = cols[idx % len(cols)]
    icon = 'OK' if stage.status == 'ok' else ('WARN' if stage.status == 'warning' else 'ERR')
    col.markdown(f'**[{icon}] {stage.stage}**\n\n{stage.elapsed_ms:.0f} ms')

if not run.success:
    st.error(f'Agent stopped: {run.error_message}')
    st.stop()

results_df = run.results_df
m = run.metrics

st.divider()
st.markdown('## Summary Metrics')

sm1, sm2, sm3, sm4 = st.columns(4)
sm1.metric('Rows loaded', f'{m.rows_loaded:,}')
sm2.metric('Excluded (pos=0)', f'{m.rows_excluded_avg_pos_zero:,}')
sm3.metric('Excluded (< min imp)', f'{m.rows_excluded_min_impressions:,}')
sm4.metric('Eligible pages scored', f'{m.eligible_pages_scored:,}')

m1, m2, m3, m4, m5 = st.columns(5)
m1.metric('Recommendations displayed', f'{m.recommendations_displayed:,}')
m2.metric('Avg opportunity score', f'{results_df["opportunity_score"].mean():.1f}')
m3.metric('Median opportunity score', f'{results_df["opportunity_score"].median():.1f}')
m4.metric('Top opportunity score', f'{results_df["opportunity_score"].max():.1f}')
m5.metric('Unique primary actions', f'{results_df["primary_action"].nunique()}')

st.markdown('### Confidence Breakdown -- All Eligible Scored Pages')
acm1, acm2, acm3 = st.columns(3)
acm1.metric('High confidence (70-100)', f'{m.all_eligible_high_conf:,}')
acm2.metric('Medium confidence (40-69)', f'{m.all_eligible_med_conf:,}')
acm3.metric('Low confidence (0-39)', f'{m.all_eligible_low_conf:,}')

st.markdown('### Confidence Breakdown -- Displayed Recommendations')
c_high = int((results_df['confidence_level'] == 'HIGH').sum())
c_med = int((results_df['confidence_level'] == 'MEDIUM').sum())
c_low = int((results_df['confidence_level'] == 'LOW').sum())

cm1, cm2, cm3 = st.columns(3)
cm1.metric('High confidence (70-100)', f'{c_high:,}')
cm2.metric('Medium confidence (40-69)', f'{c_med:,}')
cm3.metric('Low confidence (0-39)', f'{c_low:,}')

st.divider()
st.markdown('## Ranked Opportunities')

display_cols = ['rank','masked_page_id','opportunity_score','confidence_score','confidence_level',
                'impressions','clicks','ctr','avg_position','primary_action','dominant_component']
present_cols = [c for c in display_cols if c in results_df.columns]
display_df = results_df[present_cols].copy()

if 'ctr' in display_df.columns:
    display_df['ctr'] = display_df['ctr'].apply(lambda v: f'{v:.2%}' if pd.notna(v) else '--')
if 'avg_position' in display_df.columns:
    display_df['avg_position'] = display_df['avg_position'].round(1)

st.dataframe(display_df, use_container_width=True, hide_index=True,
             column_config={
                 'opportunity_score': st.column_config.ProgressColumn('Opportunity Score', min_value=0, max_value=100, format='%.1f'),
                 'confidence_score': st.column_config.NumberColumn('Confidence', format='%.1f'),
                 'masked_page_id': st.column_config.TextColumn('Page ID'),
                 'primary_action': st.column_config.TextColumn('Primary Recommended Action', width='large'),
                 'dominant_component': st.column_config.TextColumn('Primary Driver'),
             })

st.divider()
st.markdown('## Visual Analytics')

row1_col1, row1_col2 = st.columns(2)

with row1_col1:
    st.markdown('**Opportunity Score Component Distribution**')
    comp_cols = ['ctr_component', 'striking_distance_component', 'decline_component', 'engagement_component', 'business_value_component']
    present_comps = [c for c in comp_cols if c in results_df.columns]
    if present_comps:
        comp_means = results_df[present_comps].mean()
        comp_names = [c.replace('_component', '').replace('_', ' ').title() for c in present_comps]
        fig_comp = px.bar(x=comp_names, y=comp_means.values, color=comp_names,
                          labels={'x': 'Component', 'y': 'Mean Score'}, template='plotly_dark')
        fig_comp.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', showlegend=False)
        st.plotly_chart(fig_comp, use_container_width=True)

with row1_col2:
    st.markdown('**Primary Recommended Action Distribution**')
    action_counts = results_df['primary_action'].value_counts().reset_index()
    action_counts.columns = ['Action', 'Count']
    fig_act = px.pie(action_counts, names='Action', values='Count', hole=0.4, template='plotly_dark')
    fig_act.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
    st.plotly_chart(fig_act, use_container_width=True)

row2_col1, row2_col2 = st.columns(2)

with row2_col1:
    st.markdown('**Opportunity Score vs Impressions**')
    fig_scat1 = px.scatter(results_df, x='impressions', y='opportunity_score',
                           color='confidence_level', hover_data=['masked_page_id', 'primary_action'],
                           log_x=True, template='plotly_dark',
                           labels={'impressions': 'Impressions (log scale)', 'opportunity_score': 'Opportunity Score'})
    fig_scat1.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
    st.plotly_chart(fig_scat1, use_container_width=True)

with row2_col2:
    st.markdown('**CTR Gap vs Average Position**')
    fig_scat2 = px.scatter(results_df, x='avg_position', y='ctr_gap',
                           color='opportunity_score', hover_data=['masked_page_id', 'primary_action'],
                           template='plotly_dark',
                           labels={'avg_position': 'Average Position', 'ctr_gap': 'CTR Gap'})
    fig_scat2.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
    st.plotly_chart(fig_scat2, use_container_width=True)

st.divider()
st.markdown('## Page Detail Inspector')

if 'rank' in results_df.columns:
    page_ranks = results_df['rank'].astype(int).tolist()
    selected_rank = st.selectbox(
        'Select a page by rank to view full analysis:',
        options=page_ranks,
        format_func=lambda r: (f'Rank #{r} -- Score '
                               f'{results_df[results_df["rank"] == r]["opportunity_score"].iloc[0]:.1f} -- '
                               f'{results_df[results_df["rank"] == r]["primary_action"].iloc[0]}'),
    )
    selected_row = results_df[results_df['rank'] == selected_rank].iloc[0]

    exp_col1, exp_col2 = st.columns([1, 2])
    with exp_col1:
        st.markdown(f'**Page ID:** {selected_row.get("masked_page_id", "N/A")}')
        st.markdown(f'**Opportunity Score:** {selected_row.get("opportunity_score", 0):.1f} / 100')
        st.markdown(f'**Confidence Score:** {selected_row.get("confidence_score", 0):.1f} / 100 ({selected_row.get("confidence_level", "N/A")})')
        st.markdown(f'**Impressions:** {int(selected_row.get("impressions", 0)):,}')
        st.markdown(f'**Clicks:** {int(selected_row.get("clicks", 0)):,}')
        st.markdown(f'**CTR:** {selected_row.get("ctr", 0.0):.2%}')
        st.markdown(f'**Avg Position:** {selected_row.get("avg_position", 0.0):.1f}')
        st.markdown(f'**Dominant Driver:** {selected_row.get("dominant_component", "N/A")}')

        st.markdown('**Reason Codes & Evidence:**')
        ev_map = selected_row.get('reason_code_evidence', {})
        if isinstance(ev_map, dict):
            for code, ev in ev_map.items():
                st.markdown(f'<span class="reason-tag">{code}</span>', unsafe_allow_html=True)
                st.caption(ev)

    with exp_col2:
        st.markdown('**Primary Recommended Action:**')
        st.success(f"{selected_row.get('primary_action', '--')}")
        st.markdown(f"**Basis:** {selected_row.get('action_basis', '--')}")

        sec_acts = selected_row.get('secondary_actions', [])
        if isinstance(sec_acts, list) and sec_acts:
            st.markdown('**Secondary Review Suggestions:**')
            for sa in sec_acts:
                st.markdown(f"- {sa}")

        st.markdown('**Structured Explanation:**')
        st.info(selected_row.get('explanation', 'No explanation available.'))

        st.markdown('**Component Score Breakdown:**')
        comps = {
            'CTR Opportunity': selected_row.get('ctr_component', 0.0),
            'Striking Distance': selected_row.get('striking_distance_component', 0.0),
            'Decline': selected_row.get('decline_component', 0.0),
            'Engagement': selected_row.get('engagement_component', 0.0),
            'Business Value': selected_row.get('business_value_component', 0.0),
        }
        fig_bar2 = go.Figure(go.Bar(
            x=list(comps.values()), y=list(comps.keys()), orientation='h',
            marker_color=['#7c83fd','#a78bfa','#34d399','#f59e0b','#f87171'],
        ))
        fig_bar2.update_layout(template='plotly_dark', paper_bgcolor='rgba(0,0,0,0)',
                               plot_bgcolor='rgba(0,0,0,0)', margin=dict(l=0,r=0,t=0,b=0),
                               height=180, xaxis=dict(range=[0, 100]))
        st.plotly_chart(fig_bar2, use_container_width=True)

        st.markdown('**Guardrail Disclaimer:**')
        st.markdown(f'<div class="guardrail">{GUARDRAIL_NOTE}</div>', unsafe_allow_html=True)

st.divider()
st.markdown('## Export Results')
dl_col1, dl_col2 = st.columns(2)

with dl_col1:
    present_export_cols = [c for c in SAFE_EXPORT_COLUMNS if c in results_df.columns]
    export_df = results_df[present_export_cols].copy()
    for col in ['reason_codes', 'reason_code_evidence', 'secondary_actions']:
        if col in export_df.columns:
            export_df[col] = export_df[col].apply(
                lambda v: json.dumps(v) if isinstance(v, (list, dict)) else str(v))
    csv_out = export_df.to_csv(index=False).encode('utf-8')
    st.download_button('Download ranked CSV', data=csv_out,
                       file_name='flyrank_opportunities.csv', mime='text/csv',
                       use_container_width=True)

with dl_col2:
    report_lines = [
        '# FlyRank Search Opportunity Scout -- Summary Report',
        f'Generated: {run.run_timestamp}',
        f'Privacy Mode: {"Enabled (Identifiers Masked)" if settings.privacy_mode else "Disabled"}',
        f'Rows Loaded: {m.rows_loaded:,}',
        f'Excluded (pos=0): {m.rows_excluded_avg_pos_zero:,}',
        f'Excluded (< min imp): {m.rows_excluded_min_impressions:,}',
        f'Eligible Pages Scored: {m.eligible_pages_scored:,}',
        f'Recommendations Displayed: {m.recommendations_displayed:,}',
        f'Avg Opportunity Score: {results_df["opportunity_score"].mean():.1f}',
        f'Median Opportunity Score: {results_df["opportunity_score"].median():.1f}',
        f'Top Opportunity Score: {results_df["opportunity_score"].max():.1f}',
        f'Unique Primary Actions: {results_df["primary_action"].nunique()}',
        '', '## Confidence Breakdown -- All Eligible Scored Pages',
        f'High Confidence (70-100): {m.all_eligible_high_conf:,}',
        f'Medium Confidence (40-69): {m.all_eligible_med_conf:,}',
        f'Low Confidence (0-39): {m.all_eligible_low_conf:,}',
        '', '## Confidence Breakdown -- Displayed Recommendations',
        f'High Confidence (70-100): {c_high:,}',
        f'Medium Confidence (40-69): {c_med:,}',
        f'Low Confidence (0-39): {c_low:,}',
        '', '## Top 10 Ranked Recommendations', '',
    ]
    for _, r in results_df.head(10).iterrows():
        report_lines.append(
            f'Rank {int(r["rank"])}: Score={r["opportunity_score"]:.1f} (Conf: {r.get("confidence_score", 0):.1f} {r.get("confidence_level", "N/A")}) | '
            f'Page={r.get("masked_page_id", "N/A")} | Action={r.get("primary_action", "N/A")}'
        )
    report_lines.append(f'\n---\nGuardrail Disclaimer: {GUARDRAIL_NOTE}')
    st.download_button('Download summary report', data='\n'.join(report_lines).encode('utf-8'),
                       file_name='flyrank_opportunity_report.txt', mime='text/plain',
                       use_container_width=True)

st.divider()
st.markdown(
    '<div style="text-align:center;color:rgba(255,255,255,0.3);font-size:0.8rem;">'
    'FlyRank Search Opportunity Scout FL-07 MVP -- Decision-support only -- '
    'Human review required before any content action.</div>',
    unsafe_allow_html=True)
