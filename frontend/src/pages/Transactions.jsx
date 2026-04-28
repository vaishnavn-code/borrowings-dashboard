import React, { useState, useMemo } from "react";
import DataTable from "../components/ui/DataTable";
import KpiCard from "../components/ui/KpiCard";
import { mapTransactions } from "../mappers/transactionMapper";
import { fmt } from "../utils/formatters";
import {formatMonth} from "../utils/formatters";


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
    { key: "counterParty", label: "Counter Party" },
    { key: "productType", label: "Product Group" },
    { key: "rateType", label: "Rate Type" },
    { key: "portfolio", label: "Portfolio" },
    { key: "txnType", label: "Txn Type" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    { key: "days", label: "Days" },
    {
      key: "openingCr",
      label: "Opening",
      render: (v) => fmt.cr(v),
    },
    {
      key: "additionCr",
      label: "Addition",
      render: (v) => fmt.cr(v),
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
