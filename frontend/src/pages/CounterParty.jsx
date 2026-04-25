import React, { useState, useMemo } from "react";
import { HorizontalBar, VerticalBar } from "../components/charts/BarCharts";
import DataTable from "../components/ui/DataTable";
import { TopNSelector } from "../components/ui/helpers";
import { fmt } from "../utils/formatters";
import { TOP_N_OPTIONS } from "../utils/constants";
import KpiCard from "../components/ui/KpiCard";
import DonutChart from "../components/charts/DonutChart";
import DonutLegend from "../components/charts/DonutLegend";

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

export default function CounterParty({ data }) {
  const [page, setPage] = useState(1);
  const PER_PAGE = 25;
  const [topN, setTopN] = useState({ outstanding: 15, sanction: 15 });

  const borrowersTable = data?.borrowers?.table || [];

  // 🔹 Derived metrics
  const uniqueCustomers = borrowersTable.length;

  const uniqueGroups = new Set(borrowersTable.map((b) => b.group)).size;

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

  const exposureTable = data?.exposure?.table || [];

  const kpis = data?.exposure?.kpi || {};
  const kpi = data?.overview?.kpi || {};

  const totalTxnSub =
    kpis?.Total_Transactions?.subtitle?.join?.(" ") ||
    kpis?.Total_Transactions?.subtitle ||
    "";

  const txn = data?.transactions || {};
  const customer = data?.overview?.kpi || {};
  const txnTable = txn.table || [];
  const charts = txn.charts || {};

  const avgSanctionSub = kpis?.Average_Sanction?.subtitle || "";

  const principalSub = kpis?.Principal_Recieved?.subtitle || "";

  const currentFYSub = kpis?.Current_FY_Disb?.subtitle || "";

  const formatDisplay = (v) => {
    if (v === null || v === undefined || v === "") return "-";

    const str = String(v);

    // Extract numeric part
    const num = parseFloat(str.replace(/₹|,|Cr|%|Bn|Mn/gi, ""));

    if (isNaN(num)) return v;

    // % case
    if (str.includes("%")) {
      return `${num.toFixed(2)} %`;
    }

    // Already in Cr
    if (str.toLowerCase().includes("cr")) {
      return `₹${num.toLocaleString("en-IN")} Cr`;
    }

    // Already in Bn
    if (str.toLowerCase().includes("bn")) {
      return `₹${(num * 100).toLocaleString("en-IN")} Cr`;
    }

    // RAW INR → convert to Cr
    return `₹${(num / 1e7).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })} Cr`;
  };

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

  const productDonut = useMemo(() => {
    const productChart = data?.overview?.charts?.["Product Type"];

    if (!productChart) return [];

    return Object.entries(productChart.values).map(([key, value]) => ({
      name: key.replace(" - Disbursements", ""),
      value: parseFloat(value || 0),
    }));
  }, [data]);

  return (
    <div>
      <div className="section-label">Borrower / Customer View</div>

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

      {/* CHARTS */}
      <div className="two-col">
        <div className="chart-card">
          <HorizontalBar
            data={hBarData}
            dataKey="value"
            nameKey="name"
            height={320}
            barSize={18}
            formatter={(v) => `₹${(v / 1e7).toLocaleString("en-IN")} Cr`}
          />
        </div>

        <div className="chart-card">
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

      {/* TABLE */}
      <div className="card">
        <div className="card-title">
          Customer Exposure Register
          <span className="card-badge">{uniqueCustomers} CUSTOMERS</span>
        </div>

        <div className="cio-note">
          <strong>{uniqueCustomers} customers</strong> across{" "}
          <strong>{uniqueGroups} groups</strong>. Top customer outstanding:{" "}
          <strong>₹{(topCustomer / 1e9).toFixed(2)} Bn</strong>. Avg interest
          rate: <strong>{avgRate.toFixed(1)}%</strong>.
        </div>

        <DataTable
          columns={COLUMNS}
          rows={paginatedRows}
          total={borrowersTable.length}
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
