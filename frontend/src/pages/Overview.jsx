import { useMemo, useState } from "react";
import KpiCard from "../components/ui/KpiCard";
import ActivityChart from "../components/charts/ActivityChart";
import DonutChart from "../components/charts/DonutChart";
import {
  VerticalBar,
  GroupedBar,
  VerticalBarWithLineOverview,
} from "../components/charts/BarCharts";
import { useInsights } from "../hooks/useDashboardData";
import DonutLegend from "../components/charts/DonutLegend";
import React from "react";
import MonthlySummaryTable from "../components/ui/MonthlySummaryTable";

export default function Overview({ data }) {
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
  const kpi = data?.overview?.kpi || {};
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
    const productChart = data?.overview?.charts?.["Product Type"];

    if (!productChart) return [];

    return Object.entries(productChart.values).map(([key, value]) => ({
      name: key.replace(" - Disbursements", ""),
      value: parseFloat(value || 0),
    }));
  }, [data]);

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

  const portfolioRateTypeData = useMemo(() => {
    const productChart = data?.overview?.charts?.["Product Type"];
    const values = productChart?.values || {};

    const entries = Object.entries(values);
    if (entries.length > 0) {
      return entries.map(([label, value]) => ({
        label: label.replace(" - Disbursements", ""),
        count: Number(value) || 0,
      }));
    }

    return [
      { label: "TL", count: 0 },
      { label: "DEB", count: 0 },
    ];
  }, [data]);

  const fixedFloatingData = useMemo(
    () => [
      { label: "Fixed", count: 19502 },
      { label: "Floating", count: 2453 },
    ],
    [],
  );

  const topGroupsOutstanding = useMemo(() => {
    const groupChart =
      data?.overview?.charts?.["Group by Outstanding & Sanction"];

    if (!groupChart) return [];

    return groupChart.values
      .map((item) => ({
        label: item.bp_group,
        count: +(item.outstanding / 1e7).toFixed(2), // convert to Cr
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, topN);
  }, [data, topN]);

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

  const disbursementData = useMemo(() => {
    const chart = data?.overview?.charts?.["Disbursements Activity"];

    if (!chart) return [];

    const raw = Object.entries(chart.values).map(([date, val]) => ({
      date,
      label: date,
      loan: +val.loan_count,
      sanction: +val.sanction_amount,
      outstanding: +val.outstanding,
      quarter: val.Quater || val.Quarter,
      year: String(val.Year || ""),
    }));

    const mode = viewMode === "auto" ? "quarterly" : viewMode;

    const filtered =
      mode === "yearly" || selectedYear === "All"
        ? raw
        : raw.filter((r) => r.year === selectedYear);

    if (mode === "monthly") {
      // Aggregate by YYYY-MM key so all entries within a month are summed
      const monthMap = {};
      filtered.forEach((r) => {
        const monthKey = r.date.slice(0, 7); // "YYYY-MM"
        if (!monthMap[monthKey]) {
          monthMap[monthKey] = {
            name: monthKey,
            loan: 0,
            sanction: 0,
            outstanding: 0,
          };
        }
        monthMap[monthKey].loan += r.loan;
        monthMap[monthKey].sanction += r.sanction;
        monthMap[monthKey].outstanding += r.outstanding;
      });

      return Object.values(monthMap)
        .sort((a, b) => new Date(b.name) - new Date(a.name))
        .slice(0, 12)
        .reverse();
    }

    const groupBy = (key) => {
      const map = {};
      filtered.forEach((r) => {
        const k = r[key];

        if (!k) return;

        if (!map[k]) {
          map[k] = {
            name: `${k} - ${String(r.year).slice(-2)}`,
            loan: 0,
            sanction: 0,
            outstanding: 0,
          };
        }

        map[k].loan += r.loan;
        map[k].sanction += r.sanction;
        map[k].outstanding += r.outstanding;
      });

      return Object.values(map);
    };

    if (mode === "quarterly") {
      // quarter key is like "2026 Q1", sort by year then quarter number
      const parseQuarter = (name) => {
        const [yr, q] = name.split(" ");
        return parseInt(yr) * 10 + parseInt(q?.replace("Q", "") || 0);
      };

      return groupBy("quarter")
        .sort((a, b) => parseQuarter(b.name) - parseQuarter(a.name))
        .slice(0, 12)
        .reverse();
    }

    if (mode === "yearly") {
      return groupBy("year").sort((a, b) => Number(a.name) - Number(b.name));
    }

    return [];
  }, [data, selectedYear, viewMode]);

  const formatDisplay = (v) => {
    if (!v) return "-";

    const str = String(v);

    // Extract number
    const num = parseFloat(str.replace(/₹|,|Cr|%/gi, ""));

    if (isNaN(num)) return v; // return original if not numeric

    // Handle %
    if (str.includes("%")) {
      return `${num.toFixed(2)} %`;
    }

    // Handle Cr
    if (str.toLowerCase().includes("cr")) {
      return `₹${num.toLocaleString("en-IN")} Cr`;
    }

    return v;
  };

  const formatViewMode = (mode) => mode.charAt(0).toUpperCase() + mode.slice(1);

  const disbursementTitle = `${formatViewMode(viewMode)} Closing Balance & Accrual Trend`;

  const disbursementSubtitle = `BARS = OPENING & CLOSING BALANCE (₹ CR) | LINE = AVG EIR RATE (%)`;

  const monthlySummaryRows = useMemo(
    () => [
      {
        period: "Apr 2025",
        openingCr: 30586.78,
        closingCr: 29126.9,
        additionCr: 955.88,
        redemptionCr: 2415.75,
        accrualCr: 734.38,
        eirIntCr: 200.31,
        avgEir: 8.0674,
        avgExit: 7.8973,
        count: 90,
      },
      {
        period: "May 2025",
        openingCr: 24530.76,
        closingCr: 24293.55,
        additionCr: 1703.89,
        redemptionCr: 1941.09,
        accrualCr: 592.24,
        eirIntCr: 157.24,
        avgEir: 7.9642,
        avgExit: 7.7905,
        count: 73,
      },
      {
        period: "Jun 2025",
        openingCr: 37825.99,
        closingCr: 37932.39,
        additionCr: 2582.1,
        redemptionCr: 2475.7,
        accrualCr: 1116.42,
        eirIntCr: 243.7,
        avgEir: 7.799,
        avgExit: 7.6739,
        count: 99,
      },
      {
        period: "Jul 2025",
        openingCr: 25166.6,
        closingCr: 25956.19,
        additionCr: 2380.4,
        redemptionCr: 1590.8,
        accrualCr: 641.54,
        eirIntCr: 165.9,
        avgEir: 7.8817,
        avgExit: 7.6995,
        count: 77,
      },
      {
        period: "Aug 2025",
        openingCr: 35816.79,
        closingCr: 36267.66,
        additionCr: 2522.79,
        redemptionCr: 2071.92,
        accrualCr: 1068.87,
        eirIntCr: 234.28,
        avgEir: 7.8611,
        avgExit: 7.7221,
        count: 84,
      },
      {
        period: "Sep 2025",
        openingCr: 29411.1,
        closingCr: 29521.07,
        additionCr: 2361.83,
        redemptionCr: 2251.85,
        accrualCr: 621.22,
        eirIntCr: 192.35,
        avgEir: 7.8798,
        avgExit: 7.6803,
        count: 95,
      },
      {
        period: "Oct 2025",
        openingCr: 28959.05,
        closingCr: 29209,
        additionCr: 2337.53,
        redemptionCr: 2087.58,
        accrualCr: 932.88,
        eirIntCr: 185.34,
        avgEir: 7.8518,
        avgExit: 7.7757,
        count: 71,
      },
      {
        period: "Nov 2025",
        openingCr: 21111.82,
        closingCr: 22024.44,
        additionCr: 2555.71,
        redemptionCr: 1643.08,
        accrualCr: 537.31,
        eirIntCr: 137.3,
        avgEir: 7.8134,
        avgExit: 7.6247,
        count: 70,
      },
      {
        period: "Dec 2025",
        openingCr: 23667.38,
        closingCr: 24467.6,
        additionCr: 2412.35,
        redemptionCr: 1612.13,
        accrualCr: 723.58,
        eirIntCr: 156.33,
        avgEir: 7.9795,
        avgExit: 7.8538,
        count: 77,
      },
      {
        period: "Jan 2026",
        openingCr: 14926.41,
        closingCr: 15027.5,
        additionCr: 1305.18,
        redemptionCr: 1204.09,
        accrualCr: 345.13,
        eirIntCr: 97.04,
        avgEir: 8.0411,
        avgExit: 7.8805,
        count: 58,
      },
      {
        period: "Feb 2026",
        openingCr: 20913.85,
        closingCr: 21884.31,
        additionCr: 2188.98,
        redemptionCr: 1218.52,
        accrualCr: 655.75,
        eirIntCr: 135.64,
        avgEir: 7.8326,
        avgExit: 7.7618,
        count: 74,
      },
      {
        period: "Mar 2026",
        openingCr: 16680.3,
        closingCr: 16343.47,
        additionCr: 1094.25,
        redemptionCr: 1431.09,
        accrualCr: 348.42,
        eirIntCr: 108.54,
        avgEir: 8.0293,
        avgExit: 7.8718,
        count: 56,
      },
      {
        period: "Apr 2026",
        openingCr: 21713.27,
        closingCr: 21955.73,
        additionCr: 1448.12,
        redemptionCr: 1205.66,
        accrualCr: 661.63,
        eirIntCr: 141.72,
        avgEir: 7.8818,
        avgExit: 7.7828,
        count: 60,
      },
    ],
    [],
  );

  return (
    <div>
      <div className="section-label">Portfolio KPIs — All Figures in INR</div>
      <div className="four-col">
        <KpiCard
          label="Closing Balance"
          value={formatDisplay(kpi.Total_Sanction?.Title)}
          sub={kpi.Total_Sanction?.Subtitle}
          footer={kpi.Total_Sanction?.Footer}
          sparkPct={100}
          accent="c1"
          iconName="dollar"
          badge={{
            label: "CLosing Amt",
            bgColor: "#E8F1FF",
            textColor: "#1D4ED8",
            dotColor: "#1D4ED8", //  key line for badge dot
          }}
        />

        <KpiCard
          label="Monthly Accrual"
          value={formatDisplay(kpi.Outstanding_Amount?.Title)}
          sub={kpi.Outstanding_Amount?.Subtitle}
          footer={kpi.Outstanding_Amount?.Footer}
          sparkPct={60}
          accent="c2"
          iconName="graph"
          badge={{
            label: "Accrual",
            bgColor: "#E8F5E9",
            textColor: "#43A047",
            dotColor: "#43A047", //  key line for badge dot
          }}
        />

        <KpiCard
          label="Avg EIR Rate"
          value={formatDisplay(kpi.Total_Exposure?.Title)}
          sub={kpi.Total_Exposure?.Subtitle}
          footer={kpi.Total_Exposure?.Footer}
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
          value={formatDisplay(kpi.Avg_IntRate?.Title)}
          sub={kpi.Avg_IntRate?.Subtitle}
          footer={kpi.Avg_IntRate?.Footer}
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
                      <div
                        className={`ai-insight-tag ${
                          idx === 0
                            ? "concentration-risk"
                            : idx === 1
                              ? "asset-quality"
                              : idx === 2
                                ? "maturity-profile"
                                : idx === 3
                                  ? "utilization"
                                  : idx === 4
                                    ? "currency-risk"
                                    : "currency-risk"
                        }`}
                      >
                        {hardcodedInsightTags[idx] || "CURRENCY RISK"}
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
              13 Months
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
        <div className="chart-card">
          <div className="chart-title" style={{ marginBottom: "6px" }}>
            Borrowing Book by Product Type
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
                {/* Example Options */}
                <option>Jan 2025</option>
                <option>Feb 2025</option>
                <option>Mar 2025</option>
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
            dataKey="count"
            nameKey="label"
            height={360}
            barSize={20}
            slantLabels={true}
            formatter={(v) => `₹${v.toLocaleString("en-IN")} Cr`}
          />
        </div>
        <div className="chart-card">
          <div className="chart-title">Product Type Mix — Apr 2026</div>
          <div className="chart-subtitle">CLOSING BALANCE ₹ CR</div>
          <DonutChart
            data={productDonut}
            colors={["#1565c0", "#00acc1"]}
            height={320}
            formatter={(v) => `₹${(v || 0).toFixed(2)} Cr`}
          />
          <DonutLegend
            data={productDonut}
            colors={["#1565c0", "#00acc1"]}
            showPercent={true}
            showValue={true}
            valueFormatter={(v) => `₹${Math.round(v || 0)} Cr`}
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

          <VerticalBar
            data={portfolioRateTypeData}
            dataKey="count"
            nameKey="label"
            height={300}
            barSize={44}
            slantLabels={false}
            formatter={(v) => `${Number(v || 0).toLocaleString("en-IN")}`}
          />
        </div>

        <div className="chart-card">
          <div className="chart-title">Fixed vs Floating Balance</div>
          <div className="chart-subtitle" style={{ marginBottom: "10px" }}>
            APR 2026 — ₹ CR
          </div>

          <VerticalBar
            data={fixedFloatingData}
            dataKey="count"
            nameKey="label"
            height={300}
            barSize={44}
            slantLabels={false}
            formatter={(v) => `₹${Number(v || 0).toLocaleString("en-IN")} Cr`}
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
          onChange={() => {}}
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
          <option>Apr 2026</option>
          <option>Mar 2026</option>
          <option>Feb 2026</option>
        </select>

        <span
          id="sumMetricsPeriodInfo"
          style={{
            fontSize: "0.7rem",
            color: "var(--text-muted)",
            marginLeft: "auto",
          }}
        >
          Showing data for Apr 2026
        </span>
      </div>

      {/* TWO CARDS SIDE BY SIDE */}
      <div className="two-col summary-metrics-grid">
        {/* CARD 1 */}
        <div className="chart-card summary-metrics-card">
          <div className="chart-title summary-metrics-title">
            Summary Metrics
            <span className="card-badge">Apr 2026</span>
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
                <td>₹ 21,956 (Cr)</td>
              </tr>
              <tr>
                <td>Wtd Avg EIR</td>
                <td>7.88% p.a.</td>
              </tr>
              <tr>
                <td>Total Accrual</td>
                <td>661.63</td>
              </tr>
              <tr>
                <td>Active Lines</td>
                <td>60</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CARD 2 */}
        <div className="chart-card summary-metrics-card">
          <div className="chart-title summary-metrics-title">
            Rate & Mix Snapshot
            <span className="card-badge">Apr 2026</span>
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
                <td>₹ 19,502 (88.8%)</td>
              </tr>
              <tr>
                <td>Floating Rate</td>
                <td>₹ 2,453 (11.2%)</td>
              </tr>
              <tr>
                <td>Avg Exit Rate</td>
                <td>7.78% p.a.</td>
              </tr>
              <tr>
                <td>Avg Coupon/Yield</td>
                <td>7.78% p.a.</td>
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
