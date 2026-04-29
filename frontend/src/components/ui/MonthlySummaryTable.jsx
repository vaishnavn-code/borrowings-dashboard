import React from "react";

const formatCr = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatRate = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });

export default function MonthlySummaryTable({
  title = "12-Month Summary",
  periodLabel,
  rows = [],
  highlightLastRow = true,
}) {
  const computedPeriodLabel =
    periodLabel ||
    (rows.length > 1
      ? `${rows[0].period} -> ${rows[rows.length - 1].period}`
      : rows[0]?.period || "");

  return (
    <div className="chart-card summary-monthly-card">
      <div className="summary-monthly-header">
        <div className="summary-monthly-title">{title}</div>
        {computedPeriodLabel ? (
          <span className="summary-monthly-badge">{computedPeriodLabel}</span>
        ) : null}
      </div>

      <div className="summary-monthly-wrap">
        <table className="summary-monthly-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Opening (₹Cr)</th>
              <th>Addition (₹Cr)</th>
              <th>Redemption (₹Cr)</th>
              <th>Closing (₹Cr)</th>
              <th>Accrual (₹Cr)</th>
              <th>EIR Int (₹Cr)</th>
              <th>Avg EIR%</th>
              <th>Avg Exit%</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const isCurrent = highlightLastRow && index === rows.length - 1;

              return (
                <tr
                  key={`${row.period}-${index}`}
                  className={isCurrent ? "is-current" : ""}
                >
                  <td>{row.period}</td>
                  <td>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        background: "#E3F2FD", // light blue
                        color: "#1565C0", // dark blue text
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#1E88E5", // blue dot
                          display: "inline-block",
                        }}
                      />
                      {formatCr(row.openingCr)}
                    </span>
                  </td>
                  <td>{formatCr(row.additionCr)}</td>
                  <td>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        background: "#FFEBEE", // light red
                        color: "#C62828", // dark red text
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#E53935", // red dot
                          display: "inline-block",
                        }}
                      />
                      {formatCr(row.redemptionCr)}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        background: "#E8F5E9", // light green badge
                        color: "#2E7D32", // dark green text
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#43A047", // green dot
                          display: "inline-block",
                        }}
                      />
                      {formatCr(row.closingCr)}
                    </span>
                  </td>
                  <td>{formatCr(row.accrualCr)}</td>
                  <td>{formatCr(row.eirIntCr)}</td>
                  <td>{formatRate(row.avgEir)}</td>
                  <td>{formatRate(row.avgExit)}</td>
                  <td>{Number(row.count || 0).toLocaleString("en-IN")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
