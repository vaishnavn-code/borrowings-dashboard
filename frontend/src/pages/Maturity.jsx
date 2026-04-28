import React, { useState, useMemo } from "react";
import MaturityProductTypeStackedBar, {
  AnnualMaturityLineChart,
  HorizontalBar,
  MaturityClosingTrendChart,
  RateTypeMaturityStackedBar,
  VerticalBar,
} from "../components/charts/BarCharts";
import DataTable from "../components/ui/DataTable";
import { TopNSelector } from "../components/ui/helpers";
import { fmt } from "../utils/formatters";
import { TOP_N_OPTIONS } from "../utils/constants";
// inside Maturity.jsx

import KpiCard from "../components/ui/KpiCard";
import { mapMaturityAnalysis } from "../mappers/maturityMapper";
import DonutChart from "../components/charts/DonutChart";
import DonutLegend from "../components/charts/DonutLegend";
import { formatMonth } from "../utils/formatters";

const COLUMNS = [
  { key: "customer", label: "Customer" },

  {
    key: "group",
    label: "Group",
    render: (v) => <span className="spill grey">{v}</span>,
  },

  {
    key: "sanction_amt",
    label: "Sanction (₹ Cr)",
    render: (v) => fmt.cr(v),
  },

  {
    key: "outstanding",
    label: "Outstanding (₹ Cr)",
    render: (v) => (
      <span style={{ fontWeight: 700, color: "#2E6090" }}>{fmt.cr(v)}</span>
    ),
  },

  {
    key: "exposure",
    label: "Exposure (₹ Cr)",
    render: (v) => fmt.cr(v),
  },

  {
    key: "princ_recv",
    label: "Princ Recv (₹ Cr)",
    render: (v) => fmt.cr(v),
  },

  {
    key: "int_recv",
    label: "Int Recv (₹ Cr)",
    render: (v) => fmt.cr(v),
  },

  {
    key: "avg_rate",
    label: "Avg Rate",
    render: (v) => (
      <span
        style={{
          background: "rgba(123,31,162,0.08)",
          color: "#7b1fa2",
          padding: "3px 8px",
          borderRadius: "10px",
          fontWeight: 600,
          fontSize: "11px",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#7b1fa2",
          }}
        />
        {v}%
      </span>
    ),
  },
];

export default function Maturity({ data }) {
  console.log("MATURITY PAGE DATA", data);
  const [page, setPage] = useState(1);
  const PER_PAGE = 25;
  const [topN, setTopN] = useState({ outstanding: 15, sanction: 15 });

  const borrowersTable = data?.borrowers?.table || [];

  // 🔹 Derived metrics
  const uniqueCustomers = borrowersTable.length;

  const uniqueGroups = new Set(borrowersTable.map((b) => b.group)).size;

  const [maturityChartType, setMaturityChartType] = useState("bar"); // add this

  const topCustomer = borrowersTable.reduce(
    (max, b) => (b.outstanding > max ? b.outstanding : max),
    0,
  );

  const avgRate =
    borrowersTable.reduce((sum, b) => sum + (b.avg_rate || 0), 0) /
    (borrowersTable.length || 1);

  // 🔹 Charts
  const osData = borrowersTable
    .slice()
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, topN.outstanding)
    .map((c) => ({
      name: c.customer,
      value: c.outstanding,
    }));

  const sancData = borrowersTable
    .slice()
    .sort((a, b) => b.sanction_amt - a.sanction_amt)
    .slice(0, topN.sanction)
    .map((c) => ({
      name: c.customer,
      value: c.sanction_amt,
    }));

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return borrowersTable.slice(start, start + PER_PAGE);
  }, [borrowersTable, page]);

  const totalPages = Math.ceil(borrowersTable.length / PER_PAGE);

  /*
========================================
MAPPER DATA
========================================
*/

  const mappedData = mapMaturityAnalysis(data);

  const annualMaturityProfileData = mappedData?.annualMaturityProfileData || [];

  const kpis = mappedData?.kpis || {};

  const maturityClosingTrendData = mappedData?.maturityClosingTrendData || [];
  // add this mapped data

  const maturityBucketDistributionData =
    mappedData?.maturityBucketDistributionData || [];

  const productTypeMaturityBucketData =
    mappedData?.productTypeMaturityBucketData || [];

  const rateTypeByMaturityBucketData =
    mappedData?.rateTypeByMaturityBucketData || [];

  /*
========================================
FORMATTER
========================================
*/

  const formatDisplay = (v) => {
    if (v === null || v === undefined || v === "") return "-";

    const num = Number(v);

    if (isNaN(num)) return "-";

    return `₹${Math.round(num).toLocaleString("en-IN")} Cr`;
  };
  return (
    <div>
      <div className="section-label">
        Maturity Analysis — {formatMonth(data.curr_month)} · ₹ Crores
      </div>

      {/* KPI CARDS */}

      <div className="four-col">
        <KpiCard
          label="Weighted Avg Residual"
          value={Number(kpis.wtdAvgResidual?.title || 0).toFixed(2)}
          sub={kpis.wtdAvgResidual?.subtitle}
          footer={kpis.wtdAvgResidual?.footer}
          sparkPct={100}
          accent="c1"
          iconName="dollar"
          badge={{
            label: "Residual",
            bgColor: "#E8F1FF",
            textColor: "#1D4ED8",
            dotColor: "#1D4ED8",
          }}
        />

        <KpiCard
          label="Maturing"
          value={formatDisplay(kpis.maturing?.title)}
          sub={kpis.maturing?.subtitle}
          footer={kpis.maturing?.footer}
          sparkPct={80}
          accent="c2"
          iconName="graph"
          badge={{
            label: "<1Y",
            bgColor: "#E8F5E9",
            textColor: "#43A047",
            dotColor: "#43A047",
          }}
        />

        <KpiCard
          label="Already Matured"
          value={formatDisplay(kpis.alreadyMatured?.title)}
          sub={kpis.alreadyMatured?.subtitle}
          footer={kpis.alreadyMatured?.footer}
          sparkPct={60}
          accent="c3"
          iconName="settings"
          badge={{
            label: "Overdue",
            bgColor: "#FFF3E0",
            textColor: "#FB8C00",
            dotColor: "#FB8C00",
          }}
        />

        <KpiCard
          label="Long Term"
          value={formatDisplay(kpis.longTerm?.title)}
          sub={kpis.longTerm?.subtitle}
          footer={kpis.longTerm?.footer}
          sparkPct={90}
          accent="c4"
          iconName="personFolder"
          badge={{
            label: ">3Y",
            bgColor: "#F3E5F5",
            textColor: "#7B1FA2",
            dotColor: "#7B1FA2",
          }}
        />
      </div>

      <div className="chart-card" style={{ marginBottom: "20px" }}>
        <div className="chart-title">
          Closing Balance by Maturity Bucket — Monthly Trend
        </div>
        <div className="chart-subtitle">
          STACKED BARS: &lt;1Y | 1–3Y | 3–5Y | &gt;5Y | MATURED · 13 MONTHS
        </div>

        {/* CUSTOM LEGEND */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "22px",
            flexWrap: "wrap",
            marginTop: "14px",
            marginBottom: "10px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#3b5f86",
          }}
        >
          {/* Matured */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "3px",
                background: "#90caf9",
                display: "inline-block",
              }}
            />
            Matured
          </div>

          {/* < 1 Year */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "3px",
                background: "#1565C0",
                display: "inline-block",
              }}
            />
            &lt; 1 Year
          </div>

          {/* 1 - 3 Years */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "3px",
                background: "#1E88E5",
                display: "inline-block",
              }}
            />
            1 - 3 Years
          </div>

          {/* 3 - 5 Years */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "3px",
                background: "#42A5F5",
                display: "inline-block",
              }}
            />
            3 - 5 Years
          </div>

          {/* > 5 Years */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "3px",
                background: "#0288D1",
                display: "inline-block",
              }}
            />
            &gt; 5 Years
          </div>

          {/* Avg EIR */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "20px",
                height: "2px",
                background: "#F57C00",
                display: "inline-block",
                position: "relative",
              }}
            />
            Avg EIR %
          </div>
        </div>
        <MaturityClosingTrendChart
          data={maturityClosingTrendData}
          height={380}
        />
      </div>

      <div className="two-col">
        <div className="chart-card" style={{ marginBottom: "20px" }}>
          <div className="chart-title">Maturity Bucket Distribution</div>

          <div className="chart-subtitle">
            CONTRIBUTION TO TOTAL CLOSING BALANCE
          </div>

          <DonutChart
            data={maturityBucketDistributionData}
            colors={[
              "#90CAF9", // Matured
              "#1565C0", // <1Y
              "#1E88E5", // 1-3Y
              "#42A5F5", // 3-5Y
              "#0288D1", // >5Y
            ]}
            height={320}
            formatter={(v) =>
              `₹${(Number(v || 0) / 10000000).toLocaleString("en-IN")} Cr`
            }
          />

          <DonutLegend
            data={maturityBucketDistributionData}
            colors={["#90CAF9", "#1565C0", "#1E88E5", "#42A5F5", "#0288D1"]}
            showPercent={true}
            showValue={true}
            valueFormatter={(v) =>
              `₹${Math.round(Number(v || 0) / 10000000).toLocaleString("en-IN")} Cr`
            }
          />
        </div>

        <div className="chart-card" style={{ marginBottom: "20px" }}>
          <div className="chart-title">Maturity Bucket — Closing Balance</div>

          <div className="chart-subtitle">₹ CRORES — HORIZONTAL BAR </div>

          <HorizontalBar
            data={maturityBucketDistributionData}
            dataKey="value"
            nameKey="name"
            height={420}
            barSize={36}
            formatter={(v) => fmt.cr(v)}
          />
        </div>
      </div>

      <div className="two-col">
        <div className="chart-card" style={{ marginBottom: "20px" }}>
          {" "}
          <div className="chart-title">
            {" "}
            Product Group vs Maturity Bucket{" "}
          </div>{" "}
          <div className="chart-subtitle">
            {" "}
            STACKED BAR BY PRODUCT Group · NO LINE{" "}
          </div>{" "}
          {/* CUSTOM LEGEND */}{" "}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "22px",
              flexWrap: "wrap",
              marginTop: "14px",
              marginBottom: "10px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#3b5f86",
            }}
          >
            {" "}
            {[
              ["Matured", "#90CAF9"],
              ["< 1 Year", "#1565C0"],
              ["1 - 3 Years", "#1E88E5"],
              ["3 - 5 Years", "#42A5F5"],
              ["> 5 Years", "#0288D1"],
            ].map(([label, color]) => (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {" "}
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "3px",
                    background: color,
                    display: "inline-block",
                  }}
                />{" "}
                {label}{" "}
              </div>
            ))}{" "}
          </div>{" "}
          <MaturityProductTypeStackedBar
            data={productTypeMaturityBucketData}
            nameKey="name"
            height={420}
            stacked={true}
            series={[
              { key: "matured", label: "Matured", color: "#90CAF9" },
              { key: "lt1", label: "<1Y", color: "#1565C0" },
              { key: "y1to3", label: "1-3Y", color: "#1E88E5" },
              { key: "y3to5", label: "3-5Y", color: "#42A5F5" },
              { key: "gt5", label: ">5Y", color: "#0288D1" },
            ]}
          />
        </div>
        <div className="chart-card" style={{ marginBottom: "20px" }}>
          <div className="chart-title">Rate Type by Maturity Bucket</div>

          <div className="chart-subtitle">FIXED vs FLOATING — ₹ CR</div>

          {/* CUSTOM LEGEND */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "22px",
              flexWrap: "wrap",
              marginTop: "14px",
              marginBottom: "10px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#3b5f86",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  background: "#1565C0",
                  display: "inline-block",
                }}
              />
              Fixed
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  background: "#90CAF9",
                  display: "inline-block",
                }}
              />
              Floating
            </div>
          </div>

          <RateTypeMaturityStackedBar
            data={annualMaturityProfileData}
            height={420}
            formatter={(v) =>
              `₹${(Number(v || 0) / 10000000).toLocaleString("en-IN")} Cr`
            }
          />
        </div>
      </div>

      {/* Annual Maturity Profile */}
      <div className="chart-card" style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div className="chart-title">Annual Maturity Profile</div>
            <div className="chart-subtitle">
              MATURING AMOUNT BY CALENDAR YEAR | ₹ CRORES | 2026–2036
            </div>
          </div>

          {/* BAR / LINE TOGGLE */}
          <div
            style={{
              display: "flex",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #cde0f5",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <button
              onClick={() => setMaturityChartType("bar")}
              style={{
                padding: "6px 18px",
                background: maturityChartType === "bar" ? "#1565C0" : "#fff",
                color: maturityChartType === "bar" ? "#fff" : "#1565C0",
                border: "none",
                cursor: "pointer",
              }}
            >
              BAR
            </button>

            <button
              onClick={() => setMaturityChartType("line")}
              style={{
                padding: "6px 18px",
                background: maturityChartType === "line" ? "#1565C0" : "#fff",
                color: maturityChartType === "line" ? "#fff" : "#1565C0",
                border: "none",
                cursor: "pointer",
              }}
            >
              LINE
            </button>
          </div>
        </div>

        {/* BAR LEGEND */}
        {maturityChartType === "bar" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "22px",
              flexWrap: "wrap",
              marginTop: "14px",
              marginBottom: "10px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#3b5f86",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  background: "#1565C0",
                  display: "inline-block",
                }}
              />
              Fixed
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  background: "#90CAF9",
                  display: "inline-block",
                }}
              />
              Floating
            </div>
          </div>
        )}

        {maturityChartType === "bar" ? (
          <RateTypeMaturityStackedBar
            data={annualMaturityProfileData}
            height={420}
            formatter={(v) =>
              `₹${Math.round(Number(v || 0) / 10000000).toLocaleString(
                "en-IN",
              )} Cr`
            }
          />
        ) : (
          <AnnualMaturityLineChart
            data={annualMaturityProfileData}
            height={420}
          />
        )}
      </div>
    </div>
  );
}
