# Architecture -- FlyRank Search Opportunity Scout

## System Flow & Data Pipeline

`
Raw CSV Upload / Sample Data
        ?
        ?
[1] Inspect DataFrame (Shape, Columns, Memory)
        ?
        ?
[2] Validate Dataframe (Aliases, Required Fields, Sentinel Checks)
        ?
        ?
[3] Map Columns (Canonical Mapping)
        ?
        ?
[4] Preprocess (CTR % conversion, avg_pos=0 exclusion, min_imp filter)
        ?
        ?
[5] Calculate Signals (CTR gap, decline %, volume weights)
        ?
        ?
[6] Vectorized Scoring (CTR Opp, Striking Dist, Decline, Eng, Biz Value)
        ?
        ?
[7] Transparent Confidence Engine (Volume 35, Hist 25, Comp 25, Qual 15)
        ?
        ?
[8] Action Routing A-J (Dominant Driver, Primary Action, Secondary Actions)
        ?
        ?
[11] Privacy Engine (SHA-256 Masking PAGE-XXXXXXXX)
        ?
        ?
[9] Deterministic Ranking (6-level tie-breaker sort, Top N slice)
        ?
        ?
[10] Structured Explanations (8-part context string)
        ?
        ?
Streamlit UI Display / Export (CSV & Text Summary Report)
`
