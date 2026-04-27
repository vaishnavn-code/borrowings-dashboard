export function mapCounterParty(rawData) {
  const cpRaw = rawData?.["Counter Parties"] || {};

  const kpi = cpRaw?.kpi || {};
  const charts = cpRaw?.Charts || {};
  const table = cpRaw?.table || [];

  const closingBalanceChart =
    charts?.["Counterparties by Closing Balance"] || {};

  const concentrationChart =
    charts?.["Concentration"] || {};

  return {
    kpis: {
      uniqueCPs: kpi?.Unique_CPs?.Title || 0,

      topCounterparty: {
        value: kpi?.Top_Counterparty?.Title || 0,
        name: kpi?.Top_Counterparty?.Subtitle || "-",
        share: kpi?.Top_Counterparty?.Footer || "",
      },

      topConcentration: {
        value: kpi?.Top_concentration?.Title || "",
        subtitle: kpi?.Top_concentration?.Subtitle || "",
        footer: kpi?.Top_concentration?.Footer || "",
      },

      totalPortfolio: kpi?.Total_portfolio?.Title || 0,
    },

    chartData: Object.entries(closingBalanceChart)
      .map(([name, value]) => ({
        name,
        value: Number(value || 0),
        concentration: concentrationChart?.[name] || "0%",
      }))
      .sort((a, b) => b.value - a.value),

    tableData: table.map((item, index) => ({
      id: index + 1,

      counterparty: item?.Counterparty || "-",
      closingAmt: item?.Closing_amt || 0,
      share: item?.Share || "0%",
      accrualAmt: item?.Accrual_amt || 0,
      rateType: item?.Rate_type || "-",
      txns: item?.Txns || 0,
    })),
  };
}