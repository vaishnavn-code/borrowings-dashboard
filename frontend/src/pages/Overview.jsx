import { useMemo, useState } from "react";
import KpiCard from "../components/ui/KpiCard";
import ActivityChart from "../components/charts/ActivityChart";
import DonutChart from "../components/charts/DonutChart";
import { mapOverviewData } from "../mappers/overviewMapper";
import {
  VerticalBar,
  GroupedBar,
  VerticalBarWithLineOverview,
} from "../components/charts/BarCharts";
import { useInsights } from "../hooks/useDashboardData";
import DonutLegend from "../components/charts/DonutLegend";
import React from "react";
import MonthlySummaryTable from "../components/ui/MonthlySummaryTable";
import { formatMonth } from "../utils/formatters";

export default function Overview({ data }) {
  const mappedData = useMemo(() => mapOverviewData(data), [data]);

  console.log("monthlyTrend", mappedData.monthlyTrend);
  const {
    insights,
    loading: aiLoading,
    error: aiError,
    generate,
  } = useInsights();
  const [topN, setTopN] = useState(15);
  const [viewMode, setViewMode] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState("All");
  const [bbToggle, setBBToggle] = useState("book");

  const hardcodedInsightTags = [
    "CONCENTRATION RISK",
    "ASSET QUALITY",
    "MATURITY PROFILE",
    "UTILIZATION",
    "CURRENCY RISK",
  ];
  const kpi = mappedData.kpis;
  const insightItems = useMemo(() => {
    if (Array.isArray(insights?.insights)) return insights.insights;
    if (Array.isArray(insights)) return insights;
    if (!insights || typeof insights !== "object") return [];

    return [
      insights.headline
        ? {
            insight: insights.headline,
            reasoning: [],
            evidence: [],
            tag: "Headline",
          }
        : null,
      insights.risk_flag
        ? {
            insight: insights.risk_flag,
            reasoning: [],
            evidence: [],
            tag: "Risk",
          }
        : null,
      insights.opportunity
        ? {
            insight: insights.opportunity,
            reasoning: [],
            evidence: [],
            tag: "Opportunity",
          }
        : null,
      insights.watchlist
        ? {
            insight: insights.watchlist,
            reasoning: [],
            evidence: [],
            tag: "Watchlist",
          }
        : null,
    ].filter(Boolean);
  }, [insights]);

  const insightSummary = insightItems[0]?.insight || "";
  const insightCount = insightItems.length;
  const insightModel =
    insights?.llm?.model || insights?.model || "AI-generated";
  const ragEnabled = Boolean(insights?.meta?.rag?.enabled);

  const productDonut = useMemo(() => {
    const total = mappedData.productMix.reduce(
      (sum, item) => sum + Number(item.value || 0),
      0,
    );

    return mappedData.productMix.map((item) => ({
      ...item,
      percent: total ? ((Number(item.value || 0) / total) * 100).toFixed(1) : 0,
    }));
  }, [mappedData]);

  const tenorChartData = useMemo(() => {
    const tenorChart = data?.overview?.charts?.["Tenor Distribution"];

    if (!tenorChart) return [];

    return Object.entries(tenorChart.values).map(([label, count]) => ({
      label,
      count: parseInt(count || 0),
    }));
  }, [data]);

  const rateChartData = useMemo(() => {
    const rateChart = data?.overview?.charts?.["Rate Distribution"];

    if (!rateChart) return [];

    return Object.entries(rateChart.values).map(([label, count]) => ({
      label,
      count: parseInt(count || 0),
    }));
  }, [data]);

  const collectionDonut = useMemo(() => {
    const collectionChart = data?.overview?.charts?.["Collections Overview"];

    if (!collectionChart) return [];

    return [
      {
        name: "Principal Received",
        value: parseFloat(collectionChart.values["Principal Recieved"] || 0),
      },
      {
        name: "Interest Received",
        value: parseFloat(collectionChart.values["Interest Recieved"] || 0),
      },
      {
        name: "Outstanding Remaining",
        value: parseFloat(collectionChart.values["Outstanding Remaining"] || 0),
      },
    ];
  }, [data]);

  const portfolioSplitData = mappedData.portfolioSplitData;
  const rateTypeData = mappedData.rateTypeData;

  const fixedFloatingData = mappedData.rateTypeData;

  const [selectedBBMonth, setSelectedBBMonth] = useState(
    mappedData.latestBorrowingBookMonth,
  );

  const summaryMetricsData = data?.overview?.Charts?.["Summary Metrics"] || {};

  const summaryMetricMonths = Object.keys(summaryMetricsData);

  const [selectedSummaryMonth, setSelectedSummaryMonth] = useState(
    summaryMetricMonths[summaryMetricMonths.length - 1] || "",
  );

  const selectedSummaryData = summaryMetricsData[selectedSummaryMonth] || {};

  const topGroupsOutstanding =
    mappedData.borrowingBookByMonth?.[selectedBBMonth] || [];

  const topGroupsDual = useMemo(() => {
    const groupChart =
      data?.overview?.charts?.["Group by Outstanding & Sanction"];

    if (!groupChart) return [];

    return groupChart.values
      .map((item) => ({
        name: item.bp_group,
        sanction: parseFloat(item.sanction || 0),
        outstanding: parseFloat(item.outstanding || 0),
      }))
      .sort((a, b) => b.outstanding - a.outstanding) // ✅ sort by outstanding
      .slice(0, 10); // ✅ top 10
  }, [data]);

  const disbursementData = mappedData.monthlyTrend;

  const formatDisplay = (v) => {
    if (!v && v !== 0) return "-";

    const str = String(v);

    // Extract numeric value
    const num = parseFloat(str.replace(/₹|,|Cr|%/gi, ""));

    if (isNaN(num)) return v;

    // If percentage → keep decimals
    if (str.includes("%")) {
      return `${num.toFixed(2)} %`;
    }

    // For amount values → no decimals
    return `₹${Math.round(num).toLocaleString("en-IN")} Cr`;
  };

  const formatSubtitle = (v) => {
    if (!v && v !== 0) return "-";

    let str = String(v);

    return str.replace(/₹?([\d,]+(?:\.\d+)?)/g, (_, numStr) => {
      const num = Number(numStr.replace(/,/g, ""));

      if (isNaN(num)) return numStr;

      const valueInCr = Math.round(num / 10000000);

      return `₹${valueInCr.toLocaleString("en-IN")}`;
    });
  };

  const formatViewMode = (mode) => mode.charAt(0).toUpperCase() + mode.slice(1);

  const disbursementTitle = `${formatViewMode(viewMode)} Closing Balance & Accrual Trend`;

  const disbursementSubtitle = `BARS = OPENING & CLOSING BALANCE (₹ CR) | LINE = AVG EIR RATE (%)`;

  const monthlySummaryRows = mappedData.monthlySummaryTable;

  return (
    <div>
      <div className="section-label">
        Portfolio KPIs — {formatMonth(data.curr_month)} All Figures in INR
      </div>
      <div className="four-col">
        <KpiCard
          label="Closing Balance"
          value={formatDisplay(kpi.closingBalance?.Title)}
          sub={formatSubtitle(kpi.closingBalance?.Subtitle)}
          footer={kpi.closingBalance?.Footer}
          sparkPct={100}
          accent="c1"
          iconName="dollar"
          badge={{
            label: "CLosing Amt",
            bgColor: "#E8F1FF",
            textColor: "#1D4ED8",
            dotColor: "#1D4ED8",
          }}
        />

        <KpiCard
          label="Monthly Accrual"
          value={formatDisplay(kpi.monthlyAccrual?.Title)}
          sub={formatSubtitle(kpi.monthlyAccrual?.Subtitle)}
          footer={kpi.monthlyAccrual?.Footer}
          sparkPct={60}
          accent="c2"
          iconName="graph"
          badge={{
            label: "Accrual",
            bgColor: "#E8F5E9",
            textColor: "#43A047",
            dotColor: "#43A047",
          }}
        />

        <KpiCard
          label="Avg EIR Rate"
          value={Number(kpi.avgEirRate?.Title || 0).toFixed(2)}
          sub={kpi.avgEirRate?.Subtitle}
          footer={kpi.avgEirRate?.Footer}
          sparkPct={80}
          accent="c3"
          iconName="trending"
          badge={{
            label: "EIR Rate",
            bgColor: "#FFF3E0",
            textColor: "#FB8C00",
          }}
        />

        <KpiCard
          label="Total Closing"
          value={formatDisplay(kpi.totalClosing?.Title)}
          sub={formatSubtitle(kpi.totalClosing?.Subtitle)}
          footer={kpi.totalClosing?.Footer}
          sparkPct={40}
          accent="c4"
          iconName="personFolder"
          badge={{
            label: "Balnce",
            bgColor: "#FFF3E0",
            textColor: "#7B1FA2",
          }}
        />
      </div>
      <div className="section-label">Gen AI Insights</div>
      <div className="card ai-panel">
        <div className="ai-panel-header">
          <div className="ai-panel-brand">
            <div className="ai-panel-icon">✦</div>
            <div className="ai-panel-title-block">
              <div className="ai-panel-title">Exposure Insights</div>
              <div className="ai-panel-subtitle">
                Powered by Treasury Intelligence
              </div>
            </div>
          </div>
          <button
            className="insights-btn"
            onClick={generate}
            disabled={aiLoading}
          >
            {aiLoading ? "Analysing..." : "✦ Generate Insights"}
          </button>
        </div>
        <div className="ai-panel-body">
          {aiLoading && (
            <div className="ai-loading show">
              <div className="ai-loading-dots">
                <span className="ai-loading-dot"></span>
                <span className="ai-loading-dot"></span>
                <span className="ai-loading-dot"></span>
              </div>
              <div className="ai-loading-text">
                Generating portfolio insights...
              </div>
            </div>
          )}

          {!aiLoading && aiError && (
            <div className="ai-error show">{aiError}</div>
          )}

          {!aiLoading && !aiError && insightItems.length > 0 && (
            <div className="ai-result show">
              <div className="ai-summary-hero">
                <div className="ai-summary-label">Executive Summary</div>
                <div className="ai-summary-text">{insightSummary}</div>
              </div>

              <div className="ai-meta-strip">
                <div className="ai-meta-pill">Insights: {insightCount}</div>
                <div className="ai-meta-pill">Model: {insightModel}</div>
                <div className="ai-meta-pill">
                  RAG: {ragEnabled ? "Enabled" : "Disabled"}
                </div>
              </div>

              <div className="ai-insights-list">
                {insightItems.map((item, idx) => (
                  <div key={idx} className="ai-insight-card">
                    <div className="ai-insight-card-header">
                      <div className="ai-insight-card-title">
                        <div className="ai-insight-index">{idx + 1}</div>
                        <div className="ai-insight-heading">
                          Insight {idx + 1}
                        </div>
                      </div>
                      {/* <div className="ai-insight-tag general">
                        {item.tag || "Insight"}
                      </div> */}
                      <div className="ai-insight-tags-wrap">
                        <div className="ai-insight-tag category-tag">
                          {item.category || "General"}
                        </div>

                        <div
                          className={`ai-insight-tag severity-tag ${
                            String(item.severity || "").toLowerCase() === "high"
                              ? "severity-high"
                              : String(item.severity || "").toLowerCase() ===
                                  "medium"
                                ? "severity-medium"
                                : "severity-info"
                          }`}
                        >
                          {item.severity || "Info"}
                        </div>
                      </div>
                    </div>

                    <div className="ai-insight-card-body">
                      <div className="ai-insight-main">{item.insight}</div>

                      {item.reasoning?.length > 0 && (
                        <div className="ai-detail-section">
                          <div className="ai-detail-heading">Reasoning</div>
                          <ul className="ai-detail-list">
                            {item.reasoning.map((reason, reasonIndex) => (
                              <li key={reasonIndex}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.evidence?.length > 0 && (
                        <div className="ai-detail-section">
                          <div className="ai-detail-heading">Evidence</div>
                          <ul className="ai-detail-list evidence">
                            {item.evidence.map((evidence, evidenceIndex) => (
                              <li key={evidenceIndex}>{evidence}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.recommended_action && (
                        <div className="ai-detail-section">
                          <div className="ai-detail-heading">
                            Recommended Action
                          </div>
                          <div className="ai-recommendation-text">
                            {item.recommended_action}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!insights && !aiLoading && !aiError && (
            <div className="ai-empty-state">
              Click the button above to generate AI-powered portfolio insights.
            </div>
          )}
        </div>
      </div>
      <div className="section-label">Disbursement Activity Trend</div>
      <div className="chart-card">
        {/* TITLE ROW */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          {/* LEFT → TITLE */}
          <div className="chart-title">{disbursementTitle}</div>

          {/* RIGHT → TEXT + BADGE */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              Bars = Opening & Closing Balance | Line = EIR Rate
            </span>

            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                background: "rgba(0,172,193,0.1)",
                color: "#00acc1",
                border: "1px solid rgba(0,172,193,0.3)",
                padding: "3px 9px",
                borderRadius: "12px",
                letterSpacing: "0.06em",
              }}
            >
              12 Months
            </span>
          </div>
        </div>

        <div className="chart-subtitle">{disbursementSubtitle}</div>

        {/* LEGEND ROW */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginTop: "15px",
            marginBottom: "12px",
          }}
        >
          {/* Opening Balance */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "11px",
              color: "var(--text-muted)",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "3px",
                background: "rgba(21,101,192,0.7)",
              }}
            />
            Opening Balance (₹ Cr)
          </div>

          {/* Closing Balance */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "11px",
              color: "var(--text-muted)",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "3px",
                background: "rgba(144,202,249,0.75)",
              }}
            />
            Closing Balance (₹ Cr)
          </div>

          {/* Avg EIR Rate */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "11px",
              color: "var(--text-muted)",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "3px",
                borderRadius: "2px",
                background: "#00acc1",
              }}
            />
            Avg EIR Rate (%)
          </div>
        </div>

        <VerticalBarWithLineOverview
          data={disbursementData}
          height={320}
          viewMode={viewMode}
        />
      </div>
      {/* <ActivityChart timeseries={timeseries} /> */}
      <div className="section-label">Portfolio Distribution</div>
      <div className="two-col">
        <div className="chart-card equal-height-card">
          <div className="chart-title" style={{ marginBottom: "6px" }}>
            Borrowing Book by Product Group
          </div>
          <div className="chart-subtitle" style={{ marginBottom: "6px" }}>
            TOGGLE: CLOSING BALANCE · ACCRUAL · EIR RATE — Apr 2026
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
              marginLeft: "auto",
              marginTop: "8px",
              marginBottom: "30px",
            }}
          >
            {/* Period Dropdown */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <label
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                📅 Period:
              </label>

              <select
                id="bbMonthSel"
                value={selectedBBMonth}
                onChange={(e) => setSelectedBBMonth(e.target.value)}
                style={{
                  fontFamily: "var(--font)",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 9px",
                  border: "1.5px solid var(--blue-light)",
                  borderRadius: "7px",
                  background: "var(--white)",
                  color: "var(--blue-dark)",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {mappedData.borrowingBookMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle Buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <button
                className={`bbook-toggle ${bbToggle === "book" ? "active" : ""}`}
                id="bbToggleBook"
                onClick={() => setBBToggle("book")}
              >
                BOOK
              </button>

              <button
                className={`bbook-toggle ${bbToggle === "accrual" ? "active" : ""}`}
                id="bbToggleAccrual"
                onClick={() => setBBToggle("accrual")}
              >
                ACCRUAL
              </button>

              <button
                className={`bbook-toggle ${bbToggle === "eir" ? "active" : ""}`}
                id="bbToggleEir"
                onClick={() => setBBToggle("eir")}
              >
                EIR %
              </button>
            </div>
          </div>

          <VerticalBar
            data={topGroupsOutstanding}
            dataKey={
              bbToggle === "book"
                ? "count"
                : bbToggle === "accrual"
                  ? "accrual"
                  : "eir"
            }
            nameKey="label"
            height={360}
            barSize={36}
            slantLabels={false}
            formatter={(v) =>
              bbToggle === "eir"
                ? `${Number(v || 0).toFixed(2)}%`
                : `₹${Math.round(Number(v || 0)).toLocaleString("en-IN")} Cr`
            }
          />
        </div>
        <div className="chart-card equal-height-card">
          <div className="chart-title">Product Group Mix — Apr 2026</div>
          <div className="chart-subtitle">CLOSING BALANCE ₹ CR</div>
          <DonutChart
            data={productDonut}
            colors={["#1565c0", "#00acc1", "#42a5f5", "#5c6bc0"]}
            height={320}
          />
          <DonutLegend
            data={productDonut}
            colors={["#1565c0", "#00acc1"]}
            showPercent={true}
            showValue={true}
          />
        </div>
      </div>

      <div className="section-label">Portfolio &amp; Rate Type Split</div>
      <div className="two-col">
        <div className="chart-card">
          <div className="chart-title">Portfolio &amp; Rate Type Split</div>
          <div className="chart-subtitle" style={{ marginBottom: "10px" }}>
            APR 2026 — ₹ CR
          </div>

          <DonutChart
            data={portfolioSplitData.map((item) => ({
              name: item.label,
              value: Number(item.count || 0),
              percent: item.percent,
            }))}
            colors={["#1565c0", "#00acc1", "#90caf9", "#42a5f5"]}
            height={320}
          />

          <DonutLegend
            data={portfolioSplitData.map((item) => ({
              name: item.label,
              value: Number(item.count || 0),
              percent: item.percent,
            }))}
            colors={["#1565c0", "#00acc1", "#90caf9", "#42a5f5"]}
            showPercent={true}
            showValue={true}
          />
        </div>

        <div className="chart-card">
          <div className="chart-title">Fixed vs Floating Balance</div>
          <div className="chart-subtitle" style={{ marginBottom: "10px" }}>
            APR 2026 — ₹ CR
          </div>

          <DonutChart
            data={rateTypeData.map((item) => ({
              name: item.label,
              value: Number(item.count || 0),
              percent: item.percent,
            }))}
            colors={["#1565c0", "#00acc1"]}
            height={320}
            formatter={(v) => `₹${Number(v || 0).toLocaleString("en-IN")} Cr`}
          />

          <DonutLegend
            data={rateTypeData.map((item) => ({
              name: item.label,
              value: Number(item.count || 0),
              percent: item.percent,
            }))}
            colors={["#1565c0", "#00acc1"]}
            showPercent={true}
            showValue={true}
          />
        </div>
      </div>

      {/* SECTION LABEL */}
      <div className="section-label">Summary Metrics — Select Period</div>

      {/* PERIOD SELECT BOX */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
          padding: "11px 18px",
          background: "var(--blue-pale)",
          border: "1px solid var(--blue-pale2)",
          borderRadius: "12px",
          flexWrap: "wrap",
        }}
      >
        <label
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "var(--blue-dark)",
            whiteSpace: "nowrap",
          }}
        >
          📅 Period:
        </label>

        <select
          id="sumMetricsSel"
          value={selectedSummaryMonth}
          onChange={(e) => setSelectedSummaryMonth(e.target.value)}
          style={{
            fontFamily: "var(--font)",
            fontSize: "0.8rem",
            fontWeight: 600,
            padding: "6px 12px",
            border: "1.5px solid var(--blue-light)",
            borderRadius: "8px",
            background: "var(--white)",
            color: "var(--blue-dark)",
            outline: "none",
            cursor: "pointer",
            minWidth: "160px",
          }}
        >
          {summaryMetricMonths.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

        <span
          id="sumMetricsPeriodInfo"
          style={{
            fontSize: "0.7rem",
            color: "var(--text-muted)",
            marginLeft: "auto",
          }}
        >
          Showing data for {selectedSummaryMonth}
        </span>
      </div>

      {/* TWO CARDS SIDE BY SIDE */}
      <div className="two-col summary-metrics-grid">
        {/* CARD 1 */}
        <div className="chart-card summary-metrics-card">
          <div className="chart-title summary-metrics-title">
            Summary Metrics
            <span className="card-badge">{selectedSummaryMonth}</span>
          </div>

          <table
            className="summary-table"
            id="sumMetricsTable"
            style={{ width: "100%" }}
          >
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Book</td>
                <td>{formatDisplay(selectedSummaryData["Total Book"])}</td>
              </tr>
              <tr>
                <td>Wtd Avg EIR</td>
                <td>
                  {Number(selectedSummaryData["Wtd Avg EIR"] || 0).toFixed(4)} %
                </td>
              </tr>
              <tr>
                <td>Total Accrual</td>
                <td>{formatDisplay(selectedSummaryData["Total Accrual"])}</td>
              </tr>
              <tr>
                <td>Active Lines</td>
                <td>{selectedSummaryData["Active Lines"] || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CARD 2 */}
        <div className="chart-card summary-metrics-card">
          <div className="chart-title summary-metrics-title">
            Rate & Mix Snapshot
            <span className="card-badge">{selectedSummaryMonth}</span>
          </div>

          <table
            className="summary-table"
            id="sumMetricsTable2"
            style={{ width: "100%" }}
          >
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Fixed Rate</td>
                <td>{mappedData.rateMixSnapshot.fixedRate} (88.8%)</td>
              </tr>
              <tr>
                <td>Floating Rate</td>
                <td>{mappedData.rateMixSnapshot.floatingRate} (11.2%)</td>
              </tr>
              <tr>
                <td>Avg Exit Rate</td>
                <td>{mappedData.rateMixSnapshot.avgExitRate} %</td>
              </tr>
              <tr>
                <td>Avg Coupon/Yield</td>
                <td>{mappedData.rateMixSnapshot.avgCouponYield} %</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="section-label">
        Monthly Summary Table — All Amounts ₹ Crores
      </div>
      <MonthlySummaryTable
        rows={monthlySummaryRows}
        periodLabel="Apr 2025 → Apr 2026"
      />
    </div>
  );
}
