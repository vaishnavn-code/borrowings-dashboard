import { useState, Suspense } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Overview from "./pages/Overview";
import Portfolio from "./pages/Portfolio";
import Rates from "./pages/Rates";
import CostAnalysis from "./pages/CostAnalysis";
import Maturity from "./pages/Maturity";
import CounterParty from "./pages/CounterParty";
import Transactions from "./pages/Transactions";
import { Spinner, ErrorMsg } from "./components/ui/helpers";
import { useDashboardData } from "./hooks/useDashboardData";
// import mockData from "./data/mockOverview.json";
import React from "react";

const DASHBOARD_SUBTITLE = "COF Dashboard · v14 · All Amounts in INR Crores";

const PAGE_TITLES = {
  overview: "ABHL — Overview",
  portfolioMix: "ABHL — Portfolio Mix",
  costAnalysis: "ABHL — Cost Analysis",
  rateTrends: "ABHL — Rate Trends",
  maturityAnalysis: "ABHL — Maturity Analysis",
  counterparties: "ABHL — Counterparties",
  transactions: "ABHL — Transactions",
};

export default function App() {
  const [isExportingFull, setIsExportingFull] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [page, setPage] = useState("overview");
  const [darkMode, setDark] = useState(false);
  const { data, loading, error } = useDashboardData();

  const toggleDark = () => {
    const next = !darkMode;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "");
  };

  const renderPage = () => {
    if (!data) return null;

    switch (page) {
      case "overview":
        return <Overview data={data} />;

      case "portfolioMix":
        return <Portfolio data={data} />;

      case "costAnalysis":
        return <CostAnalysis data={data} />;

      case "rateTrends":
        return <Rates data={data} />;

      case "maturityAnalysis":
        return <Maturity data={data} />;

      case "counterparties":
        return <CounterParty data={data} />;

      case "transactions":
        return <Transactions data={data} />;

      default:
        return null;
    }
  };

  const ExportOverlay = ({ status }) => {
    if (!status) return null;

    return (
      <div
        id="export-overlay"
        style={{
          position: "fixed",
          inset: 0,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999999,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "#fff",
            color: "#111",
            padding: "40px 50px",
            borderRadius: 16,
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            minWidth: "340px",
          }}
        >
          <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: 16 }}>
            Exporting Full Report
          </div>
          <div style={{ fontSize: "15px", color: "#1565c0", marginBottom: 20 }}>
            {status}
          </div>
          <svg
            viewBox="0 0 24 24"
            width={28}
            height={28}
            fill="none"
            stroke="#1565c0"
            strokeWidth={3}
            strokeLinecap="round"
            style={{ animation: "spin 1s linear infinite" }}
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
      </div>
    );
  };
  return (
    <div className="wrapper">
      <Sidebar activePage={page} onNavigate={setPage} />

      <div className="main-area">
        <Header
          title={PAGE_TITLES[page]}
          subtitle={DASHBOARD_SUBTITLE}
          darkMode={darkMode}
          onToggleDark={toggleDark}
          activePage={page}
          setActivePage={setPage}
          setIsExportingFull={setIsExportingFull}
          setExportStatus={setExportStatus}
        />

        <div className="page-content">
          {loading && <Spinner />}
          {error && <ErrorMsg message={error} />}
          {!loading && !error && renderPage()}
        </div>
      </div>

      <ExportOverlay status={exportStatus} />
    </div>
  );
}
