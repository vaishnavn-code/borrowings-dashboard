export function mapTransactions(rawData) {
  const transactions = rawData?.transactions || {};

  const allPeriods = Object.keys(transactions);

  const sortedPeriods = allPeriods
    .sort((a, b) => new Date(b) - new Date(a))
    .slice(0, 13); // latest 13 periods

  const latestPeriod = sortedPeriods[0] || "";

  const getPeriodData = (selectedPeriod = latestPeriod) => {
    const txnRaw = transactions[selectedPeriod] || {};

    const kpi = txnRaw.kpi || {};
    const table = txnRaw.table || [];

    return {
      selectedPeriod,

      kpis: {
        totalRecords: kpi?.Total_Records?.Title || 0,
        totalClosingBal: kpi?.Total_Closing_Bal?.Title || 0,
        totalAccrual: kpi?.Total_Accrual?.Title || 0,
        reportingPeriod:
          kpi?.Reporting_Period?.Title || selectedPeriod,
      },

      tableData: table.map((item, index) => ({
        id: index + 1,

        counterParty: item.Counter_party || "-",
        productType: item.product_type || "-",
        rateType: item.Rate_type || "-",
        portfolio: item.Portfolio || "-",
        txnType: item.Txn_type || "-",

        startDate: item.Start_date || "-",
        endDate: item.End_date || "-",

        days: item.days || 0,
        openingCr: item.Opening_cr || 0,
        additionCr: item.Addition_cr || 0,
      })),
    };
  };

  return {
    periods: sortedPeriods,
    latestPeriod,
    getPeriodData,
  };
}