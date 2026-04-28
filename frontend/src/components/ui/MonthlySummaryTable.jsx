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
              <th>Opening ₹Cr</th>
              <th>Closing ₹Cr</th>
              <th>Addition ₹Cr</th>
              <th>Redemption ₹Cr</th>
              <th>Accrual ₹Cr</th>
              <th>EIR Int ₹Cr</th>
              <th>Avg EIR%</th>
              <th>Avg Exit%</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const isCurrent = highlightLastRow && index === rows.length - 1;

              return (
                <tr key={`${row.period}-${index}`} className={isCurrent ? "is-current" : ""}>
                  <td>{row.period}</td>
                  <td>{formatCr(row.openingCr)}</td>
                  <td>{formatCr(row.closingCr)}</td>
                  <td>{formatCr(row.additionCr)}</td>
                  <td>{formatCr(row.redemptionCr)}</td>
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
