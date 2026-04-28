import React, { useState, useMemo } from "react";

import {
  GroupedBar,
  RateTrendMixedChart,
  EirMonthlyMovementChart,
} from "../components/charts/BarCharts";

import KpiCard from "../components/ui/KpiCard";
import DataTable from "../components/ui/DataTable";
import { fmt } from "../utils/formatters";
import { mapRateTrends } from "../mappers/rateTrendMapper";
import {formatMonth} from "../utils/formatters";


export default function Rates({ data }) {
  /*
   ========================================
   MAPPED DATA
   ========================================
  */

  const mappedData = mapRateTrends(data);

  const kpis = mappedData?.kpis || {};
  const rateTrendData = mappedData?.rateTrendData || [];
  const eirMovementData = mappedData?.eirMovementData || [];
  const comparisonData = mappedData?.comparisonData || [];
  const tableData = mappedData?.tableData || [];

  /*
   ========================================
   LOCAL STATE
   ========================================
  */

  const [page, setPage] = useState(1);
  const PER_PAGE = 25;

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

  // percentage values
  if (str.includes("%")) {
    return `${num.toFixed(2)} %`;
  }

  // CR values
  if (str.toLowerCase().includes("cr")) {
    return `₹${Math.round(num).toLocaleString("en-IN")} Cr`;
  }

  // BN values → convert to CR
  if (str.toLowerCase().includes("bn")) {
    return `₹${Math.round(num * 100).toLocaleString("en-IN")} Cr`;
  }

  // already in Cr from API
  return `₹${Math.round(num).toLocaleString("en-IN")} Cr`;
};

  /*
   ========================================
   TABLE COLUMNS
   ========================================
  */

  const COLUMNS = [
    {
      key: "period",
      label: "Period",
      render: (v) => <strong>{v}</strong>,
    },
    {
      key: "avgEir",
      label: "Avg EIR %",
    },
    {
      key: "avgExit",
      label: "Avg Exit %",
    },
    {
      key: "avgYield",
      label: "Avg Yield %",
    },
    {
      key: "fixedCr",
      label: "Fixed ₹ Cr",
      render: (v) => fmt.cr(v),
    },
    {
      key: "floatingCr",
      label: "Floating ₹ Cr",
      render: (v) => fmt.cr(v),
    },
    {
      key: "closingCr",
      label: "Closing ₹ Cr",
      render: (v) => fmt.cr(v),
    },
  ];

  /*
   ========================================
   PAGINATION
   ========================================
  */

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return tableData.slice(start, start + PER_PAGE);
  }, [tableData, page]);

  const totalPages = Math.ceil(tableData.length / PER_PAGE);

  console.log("rateTrendData", rateTrendData);
  console.log("data", data);

  return (
    <div>
      <div className="section-label">Rate Analysis — 12 Months Trend</div>

      {/* KPI CARDS */}

      <div className="four-col">
        <KpiCard
          label="Avg EIR Rate"
          value={`${kpis.avgEirRate?.title || 0}%`}
          sub={kpis.avgEirRate?.subtitle}
          footer={kpis.avgEirRate?.footer}
          sparkPct={100}
          accent="c1"
          iconName="trending"
          badge={{
            label: "EIR",
            bgColor: "#E8F1FF",
            textColor: "#1D4ED8",
            dotColor: "#1D4ED8",
          }}
        />

        <KpiCard
          label="Avg Exit Rate"
          value={`${kpis.avgCouponYield?.title || 0}%`}
          sub={kpis.avgCouponYield?.subtitle}
          footer={kpis.avgCouponYield?.footer}
          sparkPct={80}
          accent="c2"
          iconName="trending"
          badge={{
            label: "Exit Rate",
            bgColor: "#E8F5E9",
            textColor: "#43A047",
            dotColor: "#43A047",
          }}
        />

        <KpiCard
          label="Avg Coupon/Yield"
          value={`${kpis.avgEirRate?.title || 0}%`}
          sub={kpis.avgEirRate?.subtitle}
          footer={kpis.avgEirRate?.footer}
          sparkPct={60}
          accent="c3"
          iconName="trending"
          badge={{
            label: "Yield",
            bgColor: "#FFF3E0",
            textColor: "#FB8C00",
            dotColor: "#FB8C00",
          }}
        />

        <KpiCard
          label="Fixed Balance"
          value={formatDisplay(kpis.fixedBalance?.title)}
          sub={kpis.fixedBalance?.subtitle}
          footer={kpis.fixedBalance?.footer}
          sparkPct={90}
          accent="c4"
          iconName="lock"
          badge={{
            label: "Fixed/Float",
            bgColor: "#F3E5F5",
            textColor: "#7B1FA2",
            dotColor: "#7B1FA2",
          }}
        />
      </div>

      {/* MIXED CHART */}

      <div className="chart-card" style={{ marginTop: "20px" }}>
        <div className="chart-title">
          Rate Trend — EIR vs Exit Rate vs Coupon/Yield
        </div>

        <div className="chart-subtitle">
          BARS = FIXED VS FLOATING BALANCE (₹ CR) &nbsp; | &nbsp; LINE = EIR
          RATE (%) & EXIT RATE (%)
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "3px",
                background: "#4F8EF7",
                display: "inline-block",
              }}
            />
            Fixed Balance (₹ Cr)
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "3px",
                background: "#C9E3FF",
                display: "inline-block",
              }}
            />
            Floating Balance (₹ Cr)
          </div>

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
            Avg EIR Rate (%)
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "20px",
                height: "2px",
                borderTop: "2px dashed #1565C0",
                display: "inline-block",
              }}
            />
            Exit Rate (%)
          </div>
        </div>

        <RateTrendMixedChart data={rateTrendData} height={380} />
      </div>

      {/* LINE CHART */}

      <div className="two-col">
        <div className="chart-card" style={{ marginTop: "20px" }}>
          <div className="chart-title">EIR Rate Monthly Movement</div>

          <div className="chart-subtitle">BASIS POINTS MOVEMENT</div>

          <EirMonthlyMovementChart data={eirMovementData} height={320} />
        </div>

        <div className="chart-card" style={{ marginTop: "20px" }}>
          <div className="chart-title">Coupon/Yield vs EIR Comparison</div>

          <div className="chart-subtitle">MONTHLY % COMPARISON</div>

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
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  background: "#4F8EF7",
                  display: "inline-block",
                }}
              />
              Avg EIR %
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  background: "#C9E3FF",
                  display: "inline-block",
                }}
              />
              Avg CoupYield %
            </div>
          </div>

          <GroupedBar
            data={comparisonData}
            nameKey="name"
            series={[
              {
                key: "Coupon",
                label: "Coupon/Yield",
                gradient: "rateFixedGrad", // SAME as Fixed Balance bar gradient
              },
              {
                key: "EIR",
                label: "EIR",
                gradient: "rateFloatingGrad", // SAME as Floating Balance bar gradient
              },
            ]}
            height={320}
            formatter={(v) => `${Number(v).toFixed(2)}%`}
          />
        </div>
      </div>

      {/* TABLE */}

      <div className="card" style={{ marginTop: "20px" }}>
        <div className="card-title">
          Monthly Rate Summary
          <span className="card-badge">{tableData.length} RECORDS</span>
        </div>

        <DataTable
          columns={COLUMNS}
          rows={paginatedRows}
          total={tableData.length}
          page={page}
          totalPages={totalPages}
          onPage={(p) => setPage(Number(p))}
          sortBy={null}
          sortDir={null}
          onSort={() => {}}
          loading={false}
        />
      </div>
    </div>
  );
}
