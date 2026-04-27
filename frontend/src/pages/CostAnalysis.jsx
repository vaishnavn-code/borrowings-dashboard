import { useState, useMemo } from "react";
import {
  HorizontalBar,
  VerticalBarWithLineOverview,
} from "../components/charts/BarCharts";
import KpiCard from "../components/ui/KpiCard";
import { fmt } from "../utils/formatters";
import React from "react";
import DonutChart from "../components/charts/DonutChart";
import DonutLegend from "../components/charts/DonutLegend";

export default function Portfolio({ data }) {
  const disbursementTitle =
    "Accrual Cost & EIR Interest vs Closing Balance Trend";

  const disbursementSubtitle =
    "BARS = ACCRUAL + EIR INT (₹ CR) | LINE = CLOSING BALANCE (₹ CR, RIGHT AXIS)";

  /*
   ========================================
   COST ANALYSIS MAPPED DATA
   ========================================
  */

  const mappedCost = data?.costAnalysis || {};

  const kpis = mappedCost?.kpis || {};
  const disbursementData = mappedCost?.trendChart || [];

  /*
   ========================================
   EXPOSURE TABLE
   (used only for product-level charts)
   ========================================
  */

  const exposureTable = data?.exposure?.table || [];

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

  const hBarData = useMemo(() => {
    if (!exposureTable.length) return [];

    return exposureTable
      .map((item) => ({
        name: item.bp_group,
        value: Number(item.outstanding_amt || 0),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, topN.hbar);
  }, [exposureTable, topN.hbar]);

  /*
   ========================================
   DONUT CHART DATA
   ========================================
  */

  const productDonut = useMemo(() => {
    const productChart = data?.overview?.charts?.["Product Type"];

    if (!productChart) return [];

    return Object.entries(productChart.values).map(([key, value]) => ({
      name: key.replace(" - Disbursements", ""),
      value: parseFloat(value || 0),
    }));
  }, [data]);

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

    if (str.includes("%")) {
      return `${num.toFixed(2)} %`;
    }

    if (str.toLowerCase().includes("cr")) {
      return `₹${num.toLocaleString("en-IN")} Cr`;
    }

    if (str.toLowerCase().includes("bn")) {
      return `₹${(num * 100).toLocaleString("en-IN")} Cr`;
    }

    return `₹${(num / 1e7).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })} Cr`;
  };

  return (
    <div>
      <div className="section-label">Exposure Analytics — Group Breakdown</div>

      {/* KPI CARDS */}

      <div className="four-col">
        <KpiCard
          label="Closing Balance"
          value={formatDisplay(kpis.monthlyAccrual?.title)}
          sub={kpis.monthlyAccrual?.subtitle}
          footer={kpis.monthlyAccrual?.footer}
          sparkPct={100}
          accent="c1"
          iconName="dollar"
          badge={{
            label: "Closing Amt",
            bgColor: "#E8F1FF",
            textColor: "#1D4ED8",
            dotColor: "#1D4ED8",
          }}
        />

        <KpiCard
          label="Monthly Accrual"
          value={formatDisplay(kpis.eirWeightedInt?.title)}
          sub={kpis.eirWeightedInt?.subtitle}
          footer={kpis.eirWeightedInt?.footer}
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
          value={formatDisplay(kpis.couponYield?.title)}
          sub={kpis.couponYield?.subtitle}
          footer={kpis.couponYield?.footer}
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
          value={formatDisplay(kpis.averageFunds?.title)}
          sub={kpis.averageFunds?.subtitle}
          footer={kpis.averageFunds?.footer}
          sparkPct={40}
          accent="c4"
          iconName="personFolder"
          badge={{
            label: "Balance",
            bgColor: "#FFF3E0",
            textColor: "#7B1FA2",
          }}
        />
      </div>

      {/* MAIN TREND CHART */}

      <div className="section-label">Cost Trends — 13 Months</div>

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
            13 Months
          </span>
        </div>

        <div className="chart-subtitle">{disbursementSubtitle}</div>

        <VerticalBarWithLineOverview
          data={disbursementData}
          height={320}
          viewMode={viewMode}
        />
      </div>

      {/* PRODUCT CHARTS */}

      <div className="two-col" style={{ marginTop: "20px" }}>
        <div className="chart-card">
          <div className="chart-title">
            Accrual by Product Type — Apr 2026
          </div>

          <div className="chart-subtitle">₹ CRORES</div>

          <HorizontalBar
            data={hBarData}
            dataKey="value"
            nameKey="name"
            height={320}
            barSize={18}
            formatter={(v) =>
              `₹${(Number(v || 0) / 1e7).toLocaleString("en-IN")} Cr`
            }
          />
        </div>

        <div className="chart-card">
          <div className="chart-title">Cost Distribution %</div>

          <div className="chart-subtitle">
            ACCRUAL SHARE — APR 2026
          </div>

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
            valueFormatter={(v) =>
              `₹${Math.round(v || 0)} Cr`
            }
          />
        </div>
      </div>
    </div>
  );
}