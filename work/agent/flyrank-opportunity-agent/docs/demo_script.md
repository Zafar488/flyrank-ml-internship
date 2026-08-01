# Demo Script -- FlyRank Search Opportunity Scout

## ~2-Minute Walkthrough Protocol

1. **Launch App**: Run streamlit run app.py and open http://localhost:8501.
2. **Privacy Banner**: Point out the green notice: *"Privacy Mode is enabled. Identifiers shown in the interface and exported files are masked."*
3. **Data Source**: Select *"Use Sample Data"* and click *"Load sample dataset"*.
4. **Validation Badge**: Highlight green *"All required columns resolved"* badge and the detected column map.
5. **Run Analysis**: Click *"? Run Opportunity Analysis"*. Show stage progress bars completing in < 1 second for sample data.
6. **Summary Metrics**: Point out distinct metrics: Rows loaded, Excluded (pos=0), Excluded (< min imp), Eligible scored, Displayed recommendations, and Confidence Breakdown.
7. **Ranked Opportunities Table**: Show continuous score distribution, confidence scores, and diversified primary actions.
8. **Visual Analytics**: Show Component Score Distribution, Action Distribution, Score vs Impressions, and CTR Gap vs Position scatter plots.
9. **Page Inspector**: Select Rank #1. Review the 8-part structured explanation, primary action basis, secondary suggestions, and guardrail disclaimer.
10. **Export**: Download lyrank_opportunities.csv and lyrank_opportunity_report.txt and verify masked IDs.
