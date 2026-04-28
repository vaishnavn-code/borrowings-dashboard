import React from "react";
import { useState } from "react";
import KpiCard from "../components/ui/KpiCard";
import DataTable from "../components/ui/DataTable";
import { fmt } from "../utils/formatters";
import { mapPortfolioMix } from "../mappers/portfolioMixMapper";
import {
  AdditionVsRedemptionChart,
  HorizontalBar,
  PortfolioProductTrendChart,
} from "../components/charts/BarCharts";
import DonutChart from "../components/charts/DonutChart";
import DonutLegend from "../components/charts/DonutLegend";
import {formatMonth} from "../utils/formatters";

export default function Portfolio({ data }) {
  const COLUMNS = [
    {
      key: "productType",
      label: "Product Type",
    },
    {
      key: "closingBalance",
      label: "Closing Balance (₹ Cr)",
      render: (v) => fmt.cr(v),
    },
    {
      key: "accrual",
      label: "Accrual (₹ Cr)",
      render: (v) => fmt.cr(v),
    },
    {
      key: "eirInterest",
      label: "EIR Interest (₹ Cr)",
      render: (v) => fmt.cr(v),
    },
    {
      key: "transactions",
      label: "Transactions",
      render: (v) => fmt.int(v),
    },
  ];
  const mappedData = mapPortfolioMix(data);
  const additionData = mappedData?.additionVsRedemption || [];

  const kpis = mappedData?.kpis || {};

  const tableData = mappedData?.tableData || [];
  const [amountField, setAmountField] = useState("opening");

  const [page, setPage] = React.useState(1);
  const PER_PAGE = 25;

  const paginatedRows = React.useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return tableData.slice(start, start + PER_PAGE);
  }, [tableData, page]);

  const totalPages = Math.ceil(tableData.length / PER_PAGE);

  const formatDisplay = (v) => {
    if (v === null || v === undefined || v === "") return "-";
    return fmt.cr(Number(v || 0));
  };

  const hBarData = mappedData?.productBreakdownChart || [];
  const closingBalanceData = mappedData?.closingBalanceChart || [];
  const productDonut = mappedData?.productShareDonut || [];
  const portfolioTrendData = mappedData?.portfolioTrendData || [];

  return (
    <div>
      <div className="section-label">Portfolio Mix — {formatMonth(data.curr_month)} Product Breakdown</div>

      {/* KPI CARDS */}

      <div className="four-col">
        <KpiCard
          label="Term Loans"
          value={formatDisplay(kpis.termLoans?.title)}
          sub={`Accrual: ${formatDisplay(kpis.termLoans?.subtitle)}`}
          footer={kpis.termLoans?.footer}
          sparkPct={100}
          accent="c1"
          iconName="threeLines"
          badge={{
            label: "Term Loan",
            bgColor: "#E8F1FF",
            textColor: "#1D4ED8",
            dotColor: "#1D4ED8",
          }}
        />

        <KpiCard
          label="Long Term Deb"
          value={formatDisplay(kpis.longTermDeb?.title)}
          sub={`Accrual: ${formatDisplay(kpis.longTermDeb?.subtitle)}`}
          footer={kpis.longTermDeb?.footer}
          sparkPct={80}
          accent="c2"
          iconName="document"
          badge={{
            label: "Debentures",
            bgColor: "#E8F5E9",
            textColor: "#43A047",
            dotColor: "#43A047",
          }}
        />

        <KpiCard
          label="Commercial Paper"
          value={formatDisplay(kpis.commercialPaper?.title)}
          sub={`Accrual: ${formatDisplay(kpis.commercialPaper?.subtitle)}`}
          footer={kpis.commercialPaper?.footer}
          sparkPct={60}
          accent="c3"
          iconName="paper"
          badge={{
            label: "Comm Paper",
            bgColor: "#FFF3E0",
            textColor: "#FB8C00",
            dotColor: "#FB8C00",
          }}
        />

        <KpiCard
          label="ECB Swap"
          value={formatDisplay(kpis.ecbSwap?.title)}
          sub={`Accrual: ${formatDisplay(kpis.ecbSwap?.subtitle)}`}
          footer={kpis.ecbSwap?.footer}
          sparkPct={90}
          accent="c4"
          iconName="globe"
          badge={{
            label: "ECB SWAP",
            bgColor: "#F3E5F5",
            textColor: "#7B1FA2",
            dotColor: "#7B1FA2",
          }}
        />
      </div>

      <div className="two-col">
        <div className="chart-card">
          <div className="chart-title">Closing Balance by Product Type</div>

          <div className="chart-subtitle">₹ CRORES — APR 2026</div>

          <HorizontalBar
            data={closingBalanceData}
            dataKey="value"
            nameKey="name"
            height={360}
            barSize={18}
          />
        </div>
        <div className="chart-card">
          <div className="chart-title">Accrual by Product Type</div>

          <div className="chart-subtitle">₹ CRORES — APR 2026</div>

          <HorizontalBar
            data={hBarData}
            dataKey="value"
            nameKey="name"
            height={360}
            barSize={18}
            formatter={(v) =>
              `₹${(Number(v || 0) / 1e7).toLocaleString("en-IN")} Cr`
            }
          />
        </div>
      </div>

      <div className="chart-card" style={{ marginTop: "20px" }}>
        <div className="chart-title">Product-wise Portfolio Trend</div>

        <div className="chart-subtitle">
          Closing Balance + Avg EIR % (Monthly)
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: 240,
              borderRadius: 12,
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 6,
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              Amount Field
            </div>

            <select
              value={amountField}
              onChange={(e) => setAmountField(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                fontSize: 13,
                fontWeight: 600,
                outline: "none",
                background: "#ffffff",
                color: "#1565C0",
                cursor: "pointer",
              }}
            >
              <option value="opening">Opening Amount</option>
              <option value="closing">Closing Amount</option>
              <option value="redemption">Redemption Amount</option>
              <option value="addition">Addition Amount</option>
            </select>
          </div>
        </div>

        <PortfolioProductTrendChart
          data={portfolioTrendData}
          height={420}
          selectedField={amountField}
        />
      </div>

      {/* ADDITION VS REDEMPTION   { Pie chart} */}

      <div className="two-col">
        <div className="chart-card" style={{ marginTop: "20px" }}>
          <div className="chart-title">Addition vs Redemption</div>

          <div className="chart-subtitle">MONTHLY FLOW ₹ CR</div>

          <AdditionVsRedemptionChart data={additionData} height={560} />
        </div>

        <div className="chart-card" style={{ marginTop: "20px" }}>
          <div className="chart-title">Product Share % — Apr 2026</div>

          <div className="chart-subtitle">CONTRIBUTION TO TOTAL CLOSING</div>

          <DonutChart
            data={productDonut}
            colors={["#1565c0", "#00acc1", "#7B1FA2", "#7aaefc"]}
            height={320}
            formatter={(v) =>
              `₹${(Number(v || 0) / 1e7).toLocaleString("en-IN")} Cr`
            }
          />

          <DonutLegend
            data={productDonut}
            colors={["#1565c0", "#00acc1", "#7B1FA2", "#0064fb"]}
            showPercent={true}
            showValue={true}
            valueFormatter={(v) =>
              `₹${Math.round(Number(v || 0) / 1e7).toLocaleString("en-IN")} Cr`
            }
          />
        </div>
      </div>

      <div className="chart-card" style={{ marginTop: "20px" }}>
        <div className="card-title">Product Breakdown</div>
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
