import { useState, useMemo } from "react";
import {
  HorizontalBar,
  VerticalBarWithLineOverview,
  VerticalBarWithLineCostAnalysis,
} from "../components/charts/BarCharts";
import KpiCard from "../components/ui/KpiCard";
import { fmt } from "../utils/formatters";
import React from "react";
import { mapCostAnalysis } from "../mappers/costAnalysisMapper";
import DonutChart from "../components/charts/DonutChart";
import DonutLegend from "../components/charts/DonutLegend";
import {formatMonth} from "../utils/formatters";

export default function CostAnalysis({ data }) {
  const disbursementTitle =
    "Accrual Cost & EIR Interest vs Closing Balance Trend";

  const disbursementSubtitle =
    "BARS = ACCRUAL + EIR INT (₹ CR) | LINE = CLOSING BALANCE (₹ CR, RIGHT AXIS)";

  /*
   ========================================
   COST ANALYSIS MAPPED DATA
   ========================================
  */

  const mappedCost = mapCostAnalysis(data);

  const kpis = mappedCost?.kpis || {};
  const disbursementData = mappedCost?.trendChart || [];

  /*
   ========================================
   EXPOSURE TABLE
   (used only for product-level charts)
   ========================================
  */

  const hBarData = mappedCost?.accrualByProduct || [];
  const productDonut = mappedCost?.productDonut || [];

  const accrualAmountChart = mappedCost?.accrualAmountChart || [];

  const wtAvgAmountChart = mappedCost?.wtAvgAmountChart || [];

  const avgFundsChart = mappedCost?.avgFundsChart || [];

  const intAmtEirChart = mappedCost?.intAmtEirChart || [];

  /*
   ========================================
   LOCAL STATE
   ========================================
  */

  const [topN] = useState({
    hbar: 15,
  });

  const [viewMode] = useState("monthly");

  /*
   ========================================
   HORIZONTAL BAR DATA
   ========================================
  */

  /*
   ========================================
   DONUT CHART DATA
   ========================================
  */

  /*
   ========================================
   FORMATTER
   ========================================
  */

  const formatDisplay = (v) => {
    if (v === null || v === undefined || v === "") return "-";

    const str = String(v);
    const num = parseFloat(str.replace(/₹|,|Cr|%|Bn|Mn/gi, ""));

    if (isNaN(num)) return v;

    // keep decimals only for %
    if (str.includes("%")) {
      return `${num.toFixed(2)} %`;
    }

    // CR values → no decimals
    if (str.toLowerCase().includes("cr")) {
      return `₹${Math.round(num).toLocaleString("en-IN")} Cr`;
    }

    // BN values → convert to CR + no decimals
    if (str.toLowerCase().includes("bn")) {
      return `₹${Math.round(num * 100).toLocaleString("en-IN")} Cr`;
    }

    // raw INR → convert to CR + no decimals
    return `₹${Math.round(num / 10000000).toLocaleString("en-IN")} Cr`;
  };

  return (
    <div>
      <div className="section-label">Exposure Analytics — {formatMonth(data.curr_month)} Group Breakdown</div>

      {/* KPI CARDS */}

      <div className="four-col">
        <KpiCard
          label="Monthly Accrual"
          value={formatDisplay(kpis.monthlyAccrual?.title)}
          sub={kpis.monthlyAccrual?.subtitle}
          footer={kpis.monthlyAccrual?.footer}
          sparkPct={100}
          accent="c1"
          iconName="settings"
          badge={{
            label: "Closing Amt",
            bgColor: "#E8F1FF",
            textColor: "#1D4ED8",
            dotColor: "#1D4ED8",
          }}
        />

        <KpiCard
          label="EIR Weighted Int"
          value={formatDisplay(kpis.eirWeightedInt?.title)}
          sub={kpis.eirWeightedInt?.subtitle}
          footer={kpis.eirWeightedInt?.footer}
          sparkPct={60}
          accent="c2"
          iconName="dollar"
          badge={{
            label: "Accrual",
            bgColor: "#E8F5E9",
            textColor: "#43A047",
            dotColor: "#43A047",
          }}
        />

        <KpiCard
          label="Coupon / Yield Int"
          value={formatDisplay(kpis.couponYield?.title)}
          sub={kpis.couponYield?.subtitle}
          footer={kpis.couponYield?.footer}
          sparkPct={80}
          accent="c3"
          iconName="settings"
          badge={{
            label: "EIR Rate",
            bgColor: "#FFF3E0",
            textColor: "#FB8C00",
          }}
        />

        <KpiCard
          label="Average Funds"
          value={formatDisplay(kpis.averageFunds?.title)}
          sub={kpis.averageFunds?.subtitle}
          footer={kpis.averageFunds?.footer}
          sparkPct={40}
          accent="c4"
          iconName="dollar"
          badge={{
            label: "Balance",
            bgColor: "#FFF3E0",
            textColor: "#7B1FA2",
          }}
        />
      </div>

      {/* MAIN TREND CHART */}

      <div className="section-label">Cost Trends — 12 Months</div>

      <div className="chart-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div className="chart-title">{disbursementTitle}</div>

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

        <div className="chart-subtitle">{disbursementSubtitle}</div>

        <VerticalBarWithLineCostAnalysis
          data={disbursementData}
          height={320}
          viewMode={viewMode}
        />
      </div>

      {/* PRODUCT CHARTS */}

      <div className="two-col" style={{ marginTop: "20px" }}>
        <div className="chart-card">
          <div className="chart-title">Accrual by Product Group — Apr 2026</div>

          <div className="chart-subtitle">₹ CRORES</div>

          <HorizontalBar
            data={hBarData}
            dataKey="value"
            nameKey="name"
            height={360}
            barSize={36}
            formatter={(v) =>
              `₹${(Number(v || 0) / 1e7).toLocaleString("en-IN")} Cr`
            }
          />
        </div>

        <div className="chart-card">
          <div className="chart-title">Cost Distribution %</div>

          <div className="chart-subtitle">ACCRUAL SHARE — APR 2026</div>

          <DonutChart
            data={productDonut}
            colors={["#1565c0", "#00acc1", "#42a5f5",  "#5c6bc0",]}
            height={320}
            formatter={(v) =>
              `₹${Math.round(Number(v || 0)).toLocaleString("en-IN")} Cr`
            }
          />

          <DonutLegend
            data={productDonut}
            colors={["#1565c0", "#00acc1"]}
            showPercent={true}
            showValue={true}
            valueFormatter={(v) =>
              `₹${Math.round(Number(v || 0)).toLocaleString("en-IN")} Cr`
            }
          />
        </div>
      </div>

      <div className="two-col" style={{ marginTop: "20px" }}>
        <div className="chart-card">
          <div className="chart-title">Accrual Amount</div>
          <div className="chart-subtitle">₹ CRORES · BY PRODUCT</div>

          <HorizontalBar
            data={accrualAmountChart}
            dataKey="value"
            nameKey="name"
            height={420}
            formatter={(v) => fmt.cr(v)}
          />
        </div>

        <div className="chart-card">
          <div className="chart-title">Wt Avg Amount</div>
          <div className="chart-subtitle">₹ CRORES · BY PRODUCT</div>

          <HorizontalBar
            data={wtAvgAmountChart}
            dataKey="value"
            nameKey="name"
            height={420}
            formatter={(v) => fmt.cr(v)}
          />
        </div>
      </div>

      <div className="two-col" style={{ marginTop: "20px" }}>
        <div className="chart-card">
          <div className="chart-title">Avg Funds Wt</div>
          <div className="chart-subtitle">₹ CRORES · BY PRODUCT</div>

          <HorizontalBar
            data={avgFundsChart}
            dataKey="value"
            nameKey="name"
            height={420}
            formatter={(v) => fmt.cr(v)}
          />
        </div>

        <div className="chart-card">
          <div className="chart-title">Int Amt-EIR</div>
          <div className="chart-subtitle">₹ CRORES · BY PRODUCT</div>

          <HorizontalBar
            data={intAmtEirChart}
            dataKey="value"
            nameKey="name"
            height={420}
            formatter={(v) => fmt.cr(v)}
          />
        </div>
      </div>
    </div>
  );
}
