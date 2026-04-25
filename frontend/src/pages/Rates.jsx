import { useState, useCallback, useMemo } from "react";
import { VerticalBar, HorizontalBar } from "../components/charts/BarCharts";
import { GroupedBar } from "../components/charts/BarCharts";
import { TopNSelector, ProgressBar } from "../components/ui/helpers";
import { usePaginatedData } from "../hooks/useDashboardData";
import { dashboardApi } from "../api/client";
import { fmt } from "../utils/formatters";
import { TOP_N_OPTIONS } from "../utils/constants";
// import mockRates from "../data/mockRates.json";
import React from "react";
import KpiCard from "../components/ui/KpiCard";
import MonthlySummaryTable from "../components/ui/MonthlySummaryTable";

export default function Rates({ data }) {
  // const { rate_dist, tenor_dist, kpis: k, computed: c } = {
  //   rate_dist: [], // placeholder
  //   tenor_dist: [], // placeholder
  //   kpis: {
  //     sanction_amt: data.render_state.totals.total_sanction,
  //     outstanding_amt: data.render_state.totals.total_os_amt,
  //     loan_amt: data.render_state.totals.loan_amt,
  //     principal_received: data.render_state.totals.total_prin_rec,
  //     interest_received: 0, // placeholder
  //   },
  //   computed: {
  //     total_records: data.row_count,
  //     unique_proposals: 0, // placeholder
  //     unique_groups: data.render_state.totals.lv_grp_cnt,
  //     unique_customers: data.render_state.totals.lv_cust_cnt,
  //     min_rate: 0, // placeholder
  //     max_rate: 0, // placeholder
  //     avg_rate: 0, // placeholder
  //   },
  // }
  const ratesSource =
    data?.interest_rates?.charts || mockRates.interest_rates.charts;

  // 🔹 Rate Distribution
  const rateChartData = Object.entries(
    ratesSource["Interest Rate Distribution"].values,
  ).map(([label, value]) => ({
    label,
    count: Number(value),
  }));

  // 🔹 Tenor
  const tenorChartData = Object.entries(
    ratesSource["Tenor Profile"].values,
  ).map(([label, value]) => ({
    label,
    count: Number(value),
  }));

  // 🔹 Interest Collection
  const collectionData = Object.entries(
    ratesSource["Interest Recieved vs Due"].values,
  ).map(([name, value]) => ({
    name,
    value: Number(value) / 1000, // ₹ Bn
  }));

  const [topN, setTopN] = useState(15);

  // 🔹 Upcoming Interest
  const upcomingRaw = Object.entries(
    ratesSource["Upcoming Interest"].values,
  ).map(([name, value]) => ({
    name,
    value: Number(value),
  }));

  const upcomingData = upcomingRaw
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);

  const fetcher = useCallback(
    (p) => dashboardApi.getGroups({ ...p, per_page: 100 }),
    [],
  );
  const { rows: groups } = usePaginatedData(fetcher, {
    sort_by: "upcoming_int",
    sort_dir: "desc",
  });

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

  const exposureTable = data?.exposure?.table || [];

  const tripleData = useMemo(() => {
    if (!exposureTable.length) return [];

    return exposureTable
      .map((g) => ({
        name: g.bp_group,

        // CORRECT KEYS
        Sanction: Number(g.sanction_amt || 0),
        "Loan Amt": Number(g.loan_amt || 0),
      }))
      .sort((a, b) => b.Outstanding - a.Outstanding) // 🔥 important
      .slice(0, topN.triple);
  }, [exposureTable, topN.triple]);

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

  const RATE_COLORS = [
    "#2C85DB",
    "#0C92D3",
    "#09B0C4",
    "#218AE6",
    "#1F7CD5",
    "#903CB0",
    "#EB6D1D",
  ];
  const TENOR_COLORS = [
    "#2C85DB",
    "#0C92D3",
    "#09B0C4",
    "#218AE6",
    "#1F7CD5",
    "#903CB0",
    "#EB6D1D",
  ];

  return (
    <div>
      <div className="section-label">Interest Rate &amp; Tenor Analysis</div>

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

      <div className="two-col">
        <div className="chart-card">
          <div className="chart-title">Interest Rate Distribution</div>
          <div className="chart-subtitle">LOAN COUNT PER RATE BUCKET</div>
          <VerticalBar
            data={rateChartData}
            dataKey="count"
            nameKey="label"
            color="url(#ratePurpleGrad)"
            barSize={44}
            height={400}
          />
        </div>
        <div className="chart-card">
          <div className="chart-title">Coupon/Yield vs EIR Comparison</div>
          <div className="chart-subtitle">% MONTHLY</div>
          <GroupedBar
            data={tripleData}
            nameKey="name"
            series={[
              {
                key: "Sanction",
                label: "Sanction",
                gradient: "blueGrad", //  same as other charts
              },
              {
                key: "Loan Amt",
                label: "Loan Amt",
                color: "rgba(123, 214, 226, 1)", // your color
              },
            ]}
            height={300}
            formatter={(v) => `₹${(v / 1e7).toLocaleString("en-IN")} Cr`}
          />
        </div>
      </div>

      <div className="two-col">
        <div className="chart-card">
          <div className="chart-title">Interest Received vs Due</div>
          <div className="chart-subtitle" style={{ marginBottom: "20px" }}>
            COLLECTION EFFICIENCY (₹ Cr)
          </div>
          {/* <GroupedBar
            data={collectionData}
            nameKey="name"
            series={[{ key: "value", label: "₹ Bn", color: "var(--green)" }]}
            height={200}
          /> */}
          <VerticalBar
            data={collectionData}
            dataKey="value"
            nameKey="name"
            color="var(--green)"
            barSize={44}
            height={400}
            noDecimals={true}
            isCurrency={true}
            formatter={(v) => `₹${(v / 1e7).toLocaleString("en-IN")} Cr`}
          />
        </div>
        <div className="chart-card">
          <div className="chart-title">Upcoming Interest — Top Groups</div>
          <div className="chart-subtitle" style={{ marginBottom: "20px" }}>
            NEXT PAYMENT OBLIGATIONS (₹ MN)
          </div>
          <TopNSelector
            options={TOP_N_OPTIONS}
            value={topN}
            onChange={setTopN}
          />
          <VerticalBar
            data={upcomingData}
            dataKey="value"
            nameKey="name"
            color="url(#tenorOrangeGrad)"
            slantLabels={true}
            noDecimals={true}
            isCurrency={true}
            height={400}
            formatter={(v) => `₹${(v / 1e7).toLocaleString("en-IN")} Cr`}
          />
        </div>
      </div>
      <MonthlySummaryTable
        rows={monthlySummaryRows}
        periodLabel="Apr 2025 → Apr 2026"
      />
    </div>
  );
}
