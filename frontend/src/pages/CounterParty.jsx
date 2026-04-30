import React, { useState, useMemo } from "react";
import { HorizontalBar } from "../components/charts/BarCharts";
import DataTable from "../components/ui/DataTable";
import { fmt } from "../utils/formatters";
import KpiCard from "../components/ui/KpiCard";
import DonutChart from "../components/charts/DonutChart";
import { formatMonth } from "../utils/formatters";
import DonutLegend from "../components/charts/DonutLegend";

const COLUMNS = [
  {
    key: "counterparty",
    label: "Counterparty",
    render: (v) => (
      <span
        style={{
          color: "#2E6090",
          fontWeight: 600,
        }}
      >
        {v}
      </span>
    ),
  },

  {
    key: "closingAmt",
    label: "Closing Amount (₹ Cr)",
    render: (v) => fmt.n_cr(v).replace("₹", ""),
  },

  {
    key: "share",
    label: "Share",
  },

  {
    key: "accrualAmt",
    label: "Accrual Amount (₹ Cr)",
    render: (v) => fmt.n_cr(v).replace("₹", ""),
  },

  {
    key: "rateType",
    label: "Rate Type",
    render: (v) => {
      const isFixed = String(v).toLowerCase() === "fixed";

      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            background: isFixed ? "#E8F1FF" : "#FFF4E5",
            color: isFixed ? "#1565C0" : "#F57C00",
            width: "fit-content",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: isFixed ? "#1565C0" : "#F57C00",
              display: "inline-block",
            }}
          />
          {v}
        </span>
      );
    },
  },

  {
    key: "txns",
    label: "Transactions",
    render: (v) => fmt.int(v),
  },
];
export default function CounterParty({ data }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [rateType, setRateType] = useState("");

  const PER_PAGE = 25;

  const cpData = data?.["Counter Parties"] || {};

  const kpi = cpData?.kpi || {};
  const charts = cpData?.Charts || {};
  const tableData = cpData?.table || [];

  const uniqueCustomers = kpi?.Unique_CPs?.Title || 0;
  const uniqueCustomersSub = kpi?.Unique_CPs?.Subtitle || "";
  const uniqueCustomersFooter = kpi?.Unique_CPs?.Footer || "";

  const topCustomer = kpi?.Top_Counterparty?.Subtitle || "-";
  const topCustomerValue = kpi?.Top_Counterparty?.Title || 0;
  const topCustomerShare = kpi?.Top_Counterparty?.Footer || "";

  const totalPortfolio = kpi?.Total_portfolio?.Title || 0;
  const totalPortfolioSub = kpi?.Total_portfolio?.Subtitle || "";
  const totalPortfolioFooter = kpi?.Total_portfolio?.Footer || "";

  const topConcentration = kpi?.Top_concentration?.Title || "-";

  const topConcentrationSub = kpi?.Top_concentration?.Subtitle || "";

  const topConcentrationFooter = kpi?.Top_concentration?.Footer || "";

  const formatDisplay = (v) => {
    if (v === null || v === undefined || v === "") return "-";

    const str = String(v);

    // extract first numeric value from:
    // 121491.57
    // 187662500000
    // "Top 5: ₹210086154133.32 Cr"
    const match = str.match(/[\d,]+(\.\d+)?/);

    if (!match) return v;

    const num = Number(match[0].replace(/,/g, ""));

    if (isNaN(num)) return v;

    // large values = raw rupees → convert to Cr
    const valueInCr = num > 1000000 ? num / 10000000 : num;

    const formattedValue = `₹${Math.round(valueInCr).toLocaleString("en-IN")} Cr`;

    // if full string is just number → return formatted directly
    if (str === match[0]) {
      return formattedValue;
    }

    // if text exists → replace only numeric part
    return str.replace(/₹?[\d,]+(\.\d+)?\s*Cr?/, formattedValue);
  };

  const hBarData = useMemo(() => {
    const rawChart = charts?.["Counterparties by Closing Balance"] || {};

    return Object.entries(rawChart)
      .map(([name, value]) => ({
        name,
        value: Number(value || 0),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 13);
  }, [charts]);

  const concentrationDonut = useMemo(() => {
    const concentrationChart = charts?.Concentration || {};

    return Object.entries(concentrationChart)
      .map(([name, percent]) => ({
        name,
        value: parseFloat(String(percent).replace("%", "")) || 0,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [charts]);

  const mappedTableRows = useMemo(() => {
    return tableData.map((item, index) => ({
      id: index + 1,
      counterparty: item.Counterparty || "-",
      closingAmt: item.Closing_amt || 0,
      share: item.Share || "0%",
      accrualAmt: item.Accrual_amt || 0,
      rateType: item.Rate_type || "-",
      txns: item.Txns || 0,
    }));
  }, [tableData]);

  const filteredRows = useMemo(() => {
    return mappedTableRows.filter((row) => {
      const matchSearch =
        !search ||
        row.counterparty?.toLowerCase().includes(search.toLowerCase());

      const matchRateType = !rateType || row.rateType === rateType;

      return matchSearch && matchRateType;
    });
  }, [mappedTableRows, search, rateType]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredRows.slice(start, start + PER_PAGE);
  }, [filteredRows, page]);

  const totalPages = Math.ceil(filteredRows.length / PER_PAGE);

  return (
    <div>
      <div className="section-label">
        Counterparty Analysis — {formatMonth(data.curr_month)} · ₹ Crores
      </div>

      <div className="four-col">
        <KpiCard
          label="Unique Counterparties"
          value={uniqueCustomers}
          sub={uniqueCustomersSub}
          footer={uniqueCustomersFooter}
          sparkPct={100}
          accent="c1"
          iconName="dollar"
          badge={{
            label: "Counterparties",
            bgColor: "#E8F1FF",
            textColor: "#1D4ED8",
          }}
        />

        <KpiCard
          label="Top Counterparty"
          value={formatDisplay(topCustomerValue)}
          sub={topCustomer}
          footer={topCustomerShare}
          sparkPct={80}
          accent="c2"
          iconName="graph"
          badge={{
            label: "Largest Exposure",
            bgColor: "#E8F5E9",
            textColor: "#43A047",
          }}
        />

        <KpiCard
          label="Top Concentration"
          value={topConcentration || "-"}
          sub={topConcentrationSub}
          footer={
            topConcentrationFooter
              ? (() => {
                  const match =
                    topConcentrationFooter.match(/₹([\d,]+(\.\d+)?)/);
                  if (!match) return topConcentrationFooter;

                  const num = Number(match[1].replace(/,/g, ""));
                  const cr = num / 1e7;

                  return `Top 5: ₹${Math.round(cr).toLocaleString("en-IN")} Cr`;
                })()
              : "-"
          }
          sparkPct={60}
          accent="c3"
          iconName="trending"
          badge={{
            label: "Concentration",
            bgColor: "#FFF3E0",
            textColor: "#FB8C00",
          }}
        />

        <KpiCard
          label="Total Portfolio"
          value={formatDisplay(totalPortfolio)}
          sub={totalPortfolioSub}
          footer={formatDisplay(totalPortfolioFooter)}
          sparkPct={90}
          accent="c4"
          iconName="personFolder"
          badge={{
            label: "Portfolio",
            bgColor: "#F3E5F5",
            textColor: "#7B1FA2",
          }}
        />
      </div>

      <div className="two-col">
        <div
          className="chart-card"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="chart-title">Counterparty by Closing Balance</div>

          <div className="chart-subtitle">
            Top counterparties by portfolio exposure
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <HorizontalBar
              data={hBarData}
              dataKey="value"
              nameKey="name"
              barSize={36}
              height={540}
              formatter={(v) =>
                `₹${(Number(v || 0) / 1e7).toLocaleString("en-IN")} Cr`
              }
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Counterparty Concentration</div>

          <div className="chart-subtitle">
            Top counterparties by portfolio share (%)
          </div>

          <DonutChart
            data={concentrationDonut}
            colors={[
              "#1565c0",
              "#00acc1",
              "#42a5f5",
              "#26c6da",
              "#5c6bc0",
              "#29b6f6",
            ]}
            height={320}
            formatter={(v) => `${Number(v || 0).toFixed(2)}%`}
          />

          <DonutLegend
            data={concentrationDonut}
            colors={[
              "#1565c0",
              "#00acc1",
              "#42a5f5",
              "#26c6da",
              "#5c6bc0",
              "#29b6f6",
            ]}
            showPercent={false}
            showValue={true}
            valueFormatter={(v) => `${Number(v || 0).toFixed(2)}%`}
          />
        </div>
      </div>

      <div className="card" style={{ marginTop: "20px" }}>
        <div className="card-title">
          Counterparty Register
          <span className="card-badge">{filteredRows.length} RECORDS</span>
        </div>

        <div className="txn-toolbar">
          <input
            className="txn-search"
            placeholder="Search counterparty..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <select
            className="txn-select"
            value={rateType}
            onChange={(e) => {
              setRateType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Rate Types</option>
            <option value="Fixed">Fixed</option>
            <option value="Floating">Floating</option>
          </select>

          <button
            className="txn-clear"
            onClick={() => {
              setSearch("");
              setRateType("");
              setPage(1);
            }}
          >
            Clear
          </button>
        </div>

        <DataTable
          columns={COLUMNS}
          rows={paginatedRows}
          total={filteredRows.length}
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
