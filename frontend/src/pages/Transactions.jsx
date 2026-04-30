import React, { useState, useMemo } from "react";
import DataTable from "../components/ui/DataTable";
import KpiCard from "../components/ui/KpiCard";
import { mapTransactions } from "../mappers/transactionMapper";
import { fmt } from "../utils/formatters";
import { formatMonth } from "../utils/formatters";

export default function Transactions({ data }) {
  const mappedTxn = mapTransactions(data);

  const [selectedPeriod, setSelectedPeriod] = useState(
    mappedTxn.latestPeriod || "",
  );

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const currentData = mappedTxn.getPeriodData?.(selectedPeriod) || {};

  const txnKpis = currentData.kpis || {};
  const tableData = currentData.tableData || [];
  const productOptions = [
    ...new Set(tableData.map((row) => row.productType).filter(Boolean)),
  ];

  const rateOptions = [
    ...new Set(tableData.map((row) => row.rateType).filter(Boolean)),
  ];

  const portfolioOptions = [
    ...new Set(tableData.map((row) => row.portfolio).filter(Boolean)),
  ];

  const txnTypeOptions = [
    ...new Set(tableData.map((row) => row.txnType).filter(Boolean)),
  ];

  const formatDisplay = (v) => {
    if (v === null || v === undefined || v === "") return "-";

    const num = Number(v);

    if (isNaN(num)) return v;

    return `₹${num.toLocaleString("en-IN")} Cr`;
  };

  const TXN_COLUMNS = [
    {
      key: "counterParty",
      label: "Counter Party",
      render: (v) => <strong>{v || "-"}</strong>,
    },
    { key: "productType", label: "Product Group" },
    {
      key: "rateType",
      label: "Rate Type",
      render: (v) => {
        const value = String(v || "").toLowerCase();

        const isFixed = value === "fixed";
        const isFloating = value === "floating";

        return (
          <span
            className="pill"
            style={{
              background: isFixed
                ? "#E8F1FF"
                : isFloating
                  ? "#FFF4E5"
                  : "#F3F4F6",
              color: isFixed ? "#1565C0" : isFloating ? "#F57C00" : "#374151",
            }}
          >
            <span
              className="dot"
              style={{
                background: isFixed
                  ? "#1565C0"
                  : isFloating
                    ? "#F57C00"
                    : "#6B7280",
              }}
            />
            {v || "-"}
          </span>
        );
      },
    },
    {
      key: "portfolio",
      label: "Portfolio",
      render: (v) => {
        const value = String(v || "")
          .trim()
          .toLowerCase();

        const isSecured = value === "secured liability";
        const isUnsecured = value === "unsecured liability";
        const isDashOnly = value === "-";

        return (
          <span
            className="pill"
            style={{
              background: isSecured
                ? "#E8F1FF"
                : isUnsecured
                  ? "#E0F7FA"
                  : isDashOnly
                    ? "#FEF3C7"
                    : "#F3F4F6",
              color: isSecured
                ? "#1565C0"
                : isUnsecured
                  ? "#00ACC1"
                  : isDashOnly
                    ? "#D97706"
                    : "#374151",
            }}
          >
            <span
              className="dot"
              style={{
                background: isSecured
                  ? "#1565C0"
                  : isUnsecured
                    ? "#00ACC1"
                    : isDashOnly
                      ? "#D97706"
                      : "#6B7280",
              }}
            />
            {v || "-"}
          </span>
        );
      },
    },
    {
      key: "txnType",
      label: "Txn Type",
      render: (v) => {
        const value = String(v || "").trim();

        return (
          <span
            className="pill"
            style={{
              background:
                value === "100"
                  ? "#E8F1FF"
                  : value === "200" || value === "210"
                    ? "#E0F7FA"
                    : value === "300"
                      ? "#E8F5E9"
                      : value === "350"
                        ? "#FFF3E0"
                        : "#F3F4F6",

              color:
                value === "100"
                  ? "#1565C0"
                  : value === "200" || value === "210"
                    ? "#00ACC1"
                    : value === "300"
                      ? "#43A047"
                      : value === "350"
                        ? "#FB8C00"
                        : "#374151",
            }}
          >
            <span
              className="dot"
              style={{
                background:
                  value === "100"
                    ? "#1565C0"
                    : value === "200" || value === "210"
                      ? "#00ACC1"
                      : value === "300"
                        ? "#43A047"
                        : value === "350"
                          ? "#FB8C00"
                          : "#6B7280",
              }}
            />
            {v || "-"}
          </span>
        );
      },
    },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    { key: "days", label: "Days" },
    {
      key: "openingCr",
      label: "Opening (₹ Cr)",
      render: (v) => fmt.n_cr(v).replace("₹", ""),
    },
    {
      key: "additionCr",
      label: "Addition (₹ Cr)",
      render: (v) => fmt.n_cr(v).replace("₹", ""),
    },
    {
      key: "redemptionCr",
      label: "Redemption (₹ Cr)",
      render: (v) => fmt.n_cr(v).replace("₹", ""),
    },
    {
      key: "closingCr",
      label: "Closing (₹ Cr)",
      render: (v) => fmt.n_cr(v).replace("₹", ""),
    },
    {
      key: "accrualAmt",
      label: "Accrual (₹ Cr)",
      render: (v) => fmt.n_cr(v).replace("₹", ""),
    },
    {
      key: "wtAvgAmt",
      label: "Wt Avg Amt (₹ Cr)",
      render: (v) => fmt.n_cr(v).replace("₹", ""),
    },
    {
      key: "avgFunds",
      label: "Avg Funds (₹ Cr)",
      render: (v) => fmt.n_cr(v).replace("₹", ""),
    },
    {
      key: "openEir",
      label: "Open EIR",
      render: (v) => fmt.percent?.(v) || v,
    },
    {
      key: "exitEir",
      label: "Exit EIR",
      render: (v) => fmt.percent?.(v) || v,
    },
    {
      key: "avgRateEir",
      label: "Avg Rate EIR",
      render: (v) => fmt.percent?.(v) || v,
    },
    {
      key: "avgRateEirPapm",
      label: "Avg Rate EIR PAPM",
      render: (v) => fmt.percent?.(v) || v,
    },
    {
      key: "exitRate",
      label: "Exit Rate",
      render: (v) => fmt.percent?.(v) || v,
    },
    {
      key: "exitSpread",
      label: "Exit Spread",
      render: (v) => fmt.percent?.(v) || v,
    },
    {
      key: "exitFinalRate",
      label: "Exit Final Rate",
      render: (v) => fmt.percent?.(v) || v,
    },
    {
      key: "exitFinalRatePapm",
      label: "Exit Final Rate PAPM",
      render: (v) => fmt.percent?.(v) || v,
    },
    {
      key: "avgRateYield",
      label: "Avg Rate Yield",
      render: (v) => fmt.percent?.(v) || v,
    },
    {
      key: "avgRateYieldPapm",
      label: "Avg Rate Yield PAPM",
      render: (v) => fmt.percent?.(v) || v,
    },
    {
      key: "wtIntAmtCouponYield",
      label: "Wt Int Amt Coupon Yield (₹ Cr)",
      render: (v) => fmt.n_cr(v).replace("₹", ""),
    },
    {
      key: "wtAmtCouponYield",
      label: "Wt Amt Coupon Yield (₹ Cr)",
      render: (v) => fmt.n_cr(v).replace("₹", ""),
    },
  ];

  const [productType, setProductType] = useState("");
  const [rateType, setRateType] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [txnType, setTxnType] = useState("");

  const filteredRows = useMemo(() => {
    return tableData.filter((row) => {
      const matchSearch =
        !search ||
        row.counterParty?.toLowerCase().includes(search.toLowerCase()) ||
        row.productType?.toLowerCase().includes(search.toLowerCase()) ||
        row.portfolio?.toLowerCase().includes(search.toLowerCase());

      const matchProduct = !productType || row.productType === productType;

      const matchRate = !rateType || row.rateType === rateType;

      const matchPortfolio = !portfolio || row.portfolio === portfolio;

      const matchTxnType = !txnType || row.txnType === txnType;

      return (
        matchSearch &&
        matchProduct &&
        matchRate &&
        matchPortfolio &&
        matchTxnType
      );
    });
  }, [tableData, search, productType, rateType, portfolio, txnType]);

  const paginatedRows = filteredRows.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);

  return (
    <div>
      <div className="section-label">
        Transaction Register — {selectedPeriod} · ₹ Crores
      </div>

      {/* Period Selector */}
      <div className="txn-month-bar">
        <label>&#128197; Period:</label>

        <div className="txn-month-pills">
          {mappedTxn.periods?.map((period) => (
            <button
              key={period}
              type="button"
              className={`txn-month-pill ${
                selectedPeriod === period ? "active" : ""
              }`}
              onClick={() => {
                setSelectedPeriod(period);
                setPage(1);
              }}
            >
              {period}
            </button>
          ))}
        </div>

        <span
          className="txn-period-info"
          style={{
            marginLeft: "auto",
            whiteSpace: "nowrap",
          }}
        >
          {tableData.length} records
        </span>
      </div>

      {/* KPI Cards */}
      <div className="four-col">
        <KpiCard
          label="Total Records"
          value={txnKpis.totalRecords?.title || 0}
          sub={txnKpis.totalRecords?.subtitle}
          footer={txnKpis.totalRecords?.footer}
          iconName="document"
          accent="c1"
          sparkPct={100}
          badge={{
            label: "Volume",
            bgColor: "#E8F1FF",
            textColor: "#1D4ED8",
          }}
        />

        <KpiCard
          label="Total Closing Balance"
          value={fmt.cr(txnKpis.totalClosingBal?.title)}
          sub={txnKpis.totalClosingBal?.subtitle}
          footer={txnKpis.totalClosingBal?.footer}
          iconName="dollar"
          accent="c2"
          sparkPct={80}
          badge={{
            label: "Closing",
            bgColor: "#E0F7FA",
            textColor: "#00ACC1",
          }}
        />

        <KpiCard
          label="Total Accrual"
          value={fmt.cr(txnKpis.totalAccrual?.title)}
          sub={txnKpis.totalAccrual?.subtitle}
          footer={txnKpis.totalAccrual?.footer}
          iconName="storage"
          accent="c3"
          sparkPct={60}
          badge={{
            label: "Accrual",
            bgColor: "#E8F5E9",
            textColor: "#43A047",
          }}
        />

        <KpiCard
          label="Reporting Period"
          value={txnKpis.reportingPeriod?.title || "-"}
          sub={txnKpis.reportingPeriod?.subtitle}
          footer={txnKpis.reportingPeriod?.footer}
          iconName="graph"
          accent="c4"
          sparkPct={40}
          badge={{
            label: "Period",
            bgColor: "#FFF3E0",
            textColor: "#FB8C00",
          }}
        />
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-title">All Transactions</div>

        <div className="txn-toolbar">
          <input
            className="txn-search"
            placeholder="Search counterparty, product..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <select
            className="txn-select"
            value={productType}
            onChange={(e) => {
              setProductType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Product Types</option>
            {productOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            className="txn-select"
            value={rateType}
            onChange={(e) => {
              setRateType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Rate Types</option>
            {rateOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            className="txn-select"
            value={portfolio}
            onChange={(e) => {
              setPortfolio(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Portfolios</option>
            {portfolioOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            className="txn-select"
            value={txnType}
            onChange={(e) => {
              setTxnType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Txn Types</option>
            {txnTypeOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            className="txn-clear"
            onClick={() => {
              setSearch("");
              setProductType("");
              setRateType("");
              setPortfolio("");
              setTxnType("");
              setPage(1);
            }}
          >
            Clear
          </button>

          <span className="txn-count">{filteredRows.length} records</span>
        </div>

        <DataTable
          columns={TXN_COLUMNS}
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
