import { useState, useCallback, useMemo } from "react";
import {
  HorizontalBar,
  GroupedBar,
  VerticalBar,
  VerticalBarWithLineOverview,
} from "../components/charts/BarCharts";
import DataTable from "../components/ui/DataTable";
import { TopNSelector } from "../components/ui/helpers";
import KpiCard from "../components/ui/KpiCard";
import { usePaginatedData } from "../hooks/useDashboardData";
import { dashboardApi } from "../api/client";
import { fmt } from "../utils/formatters";
import { TOP_N_OPTIONS } from "../utils/constants";
import React from "react";
import DonutChart from "../components/charts/DonutChart";
import DonutLegend from "../components/charts/DonutLegend";

const COLUMNS = [
  {
    key: "bp_group",
    label: "Group",
    render: (v) => <span style={{ fontWeight: 700, color: "#111" }}>{v}</span>,
  },

  { key: "loan_count", label: "Loans" },

  {
    key: "sanction_amt",
    label: "Sanction (₹ Cr)",
    render: (v) => fmt.cr(v),
  },

  {
    key: "loan_amt",
    label: "Loan Amt (₹ Cr)",
    render: (v) => fmt.cr(v),
  },

  {
    key: "outstanding_amt",
    label: "Outstanding (₹ Cr)",
    render: (v) => (
      <span style={{ fontWeight: 700, color: "#2E6090" }}>{fmt.cr(v)}</span>
    ),
  },

  {
    key: "exposure_amt",
    label: "Exposure (₹ Cr)",
    render: (v) => fmt.cr(v),
  },

  {
    key: "principle_recv", // correct key
    label: "Princ Recv (₹ Cr)",
    render: (v) => fmt.cr(v),
  },

  {
    key: "int_recv",
    label: "Int Recv (₹ Cr)",
    render: (v) => fmt.cr(v),
  },

  {
    key: "upcoming_int",
    label: "Upcoming Int (₹ Cr)",
    render: (v) => fmt.cr(v),
  },
  {
    key: "avg_rate",
    label: "Avg Rate",
    render: (_, row) => {
      const outstanding = Number(row.outstanding_amt || 0);
      const interest = Number(row.int_recv || 0);

      const rate =
        outstanding > 0 ? ((interest / outstanding) * 100).toFixed(1) : 0;

      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(21,101,192,0.08)",
            color: "#1565c0",
            padding: "3px 8px",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "11px",
          }}
        >
          {/* blue dot */}
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#1565c0",
            }}
          />
          {rate}%
        </span>
      );
    },
  },
];

export default function Portfolio({ data }) {
  console.log("Exposure data:", data);
  const disbursementTitle =
    "Accrual Cost & EIR Interest vs Closing Balance Trend";
  const disbursementSubtitle =
    "BARS = ACCRUAL + EIR INT (₹ CR)  |  LINE = CLOSING BALANCE (₹ CR, RIGHT AXIS)";
  const kpis = data?.exposure?.kpi || {};
  const exposureTable = data?.exposure?.table || [];
  const [topN, setTopN] = useState({
    hbar: 15,
    triple: 8,
    intBar: 15,
    rateBar: 15,
  });
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [viewMode, setViewMode] = useState("monthly");

  const PAGE_SIZE = 25;
  const fetcher = useCallback((p) => dashboardApi.getGroups(p), []);
  const { rows, total, totalPages, loading, params, updateParams } =
    usePaginatedData(fetcher, {
      sort_by: "outstanding_amt",
      sort_dir: "desc",
      per_page: 20,
    });

  const allFetcher = useCallback(
    (p) => dashboardApi.getGroups({ ...p, per_page: 100 }),
    [],
  );
  const { rows: allGroups } = usePaginatedData(allFetcher, {
    sort_by: "outstanding_amt",
    sort_dir: "desc",
  });

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

  const tripleData = useMemo(() => {
    if (!exposureTable.length) return [];

    return exposureTable
      .map((g) => ({
        name: g.bp_group,

        // CORRECT KEYS
        Sanction: Number(g.sanction_amt || 0),
        "Loan Amt": Number(g.loan_amt || 0),
        Outstanding: Number(g.outstanding_amt || 0),
      }))
      .sort((a, b) => b.Outstanding - a.Outstanding) // 🔥 important
      .slice(0, topN.triple);
  }, [exposureTable, topN.triple]);

  const intBarData = useMemo(() => {
    if (!exposureTable.length) return [];

    return exposureTable
      .map((g) => ({
        name: g.bp_group,
        value: Number(g.int_recv || 0), // ₹ Mn
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, topN.intBar);
  }, [exposureTable, topN.intBar]);

  const rateBarData = useMemo(() => {
    if (!exposureTable.length) return [];

    return exposureTable
      .map((g) => ({
        name: g.bp_group,

        // 🎯 MOCK RANDOM RATE (6% - 14%)
        value: Number((6 + Math.random() * 8).toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, topN.rateBar);
  }, [exposureTable, topN.rateBar]);

  const productDonut = useMemo(() => {
    const productChart = data?.overview?.charts?.["Product Type"];

    if (!productChart) return [];

    return Object.entries(productChart.values).map(([key, value]) => ({
      name: key.replace(" - Disbursements", ""),
      value: parseFloat(value || 0),
    }));
  }, [data]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    updateParams({ page: 1 });
  };
  const handleSort = (key) => {
    const dir =
      params.sort_by === key && params.sort_dir === "desc" ? "asc" : "desc";
    updateParams({ sort_by: key, sort_dir: dir });
  };

  const kpi = data?.overview?.kpi || {};

  const KPI_ORDER = [
    "Total_Records",
    "Borrower_Groups",
    "TL_Disbursements",
    "DEB_Disbursements",
  ];
  const filteredRows = useMemo(() => {
    const source = allGroups?.length ? allGroups : exposureTable;

    if (!search) return source;

    return source.filter((row) =>
      row.bp_group?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, allGroups, exposureTable]);
  const paginatedRows = useMemo(() => {
    const start = (params.page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, params.page]);
  const totalPagesLocal = Math.ceil(filteredRows.length / PAGE_SIZE);

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
  return (
    <div>
      <div className="section-label">Exposure Analytics — Group Breakdown</div>

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

      <div className="section-label">Cost Trends — 13 Months</div>
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
            Accrual Amt (₹ Cr)
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
            EIR Int Amt (₹ Cr)
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
            Closing Balance (₹ Cr)
          </div>
        </div>

        <VerticalBarWithLineOverview
          data={disbursementData}
          height={320}
          viewMode={viewMode}
        />
      </div>

      <div className="two-col" style={{marginTop : "20px"}}>
        <div className="chart-card">
          <div className="chart-title">Accrual by Product Type — Apr 2026</div>
          <div className="chart-subtitle">₹ CRORES</div>
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
          <div className="chart-title">Cost Distribution %</div>
          <div className="chart-subtitle">ACCRUAL SHARE — APR 2026</div>
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

      <div className="section-label">Amount Metrics by Product — ₹ (Crores)</div>

      <div className="two-col">
        <div className="chart-card">
          <div className="chart-title">Accrual Amount</div>
          <div className="chart-subtitle">₹ CRORES · BY PRODUCT</div>
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
          <div className="chart-title">Wt Avg Amount</div>
          <div className="chart-subtitle">₹ CRORES · BY PRODUCT</div>
          <HorizontalBar
            data={hBarData}
            dataKey="value"
            nameKey="name"
            height={320}
            barSize={18}
            formatter={(v) => `₹${(v / 1e7).toLocaleString("en-IN")} Cr`}
          />
        </div>
      </div>

      <div className="two-col">
        <div className="chart-card">
          <div className="chart-title">Avg Funds Wt</div>
          <div className="chart-subtitle">₹ CRORES · BY PRODUCT</div>
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
          <div className="chart-title">Int Amt‑EIR</div>
          <div className="chart-subtitle">₹ CRORES · BY PRODUCT</div>
          <HorizontalBar
            data={hBarData}
            dataKey="value"
            nameKey="name"
            height={320}
            barSize={18}
            formatter={(v) => `₹${(v / 1e7).toLocaleString("en-IN")} Cr`}
          />
        </div>
      </div>
    </div>
  );
}
