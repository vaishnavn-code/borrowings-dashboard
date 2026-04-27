export function mapPortfolioMix(rawData) {
  const portfolioRaw = rawData?.["Portfolio Mix"] || {};

  const kpi = portfolioRaw?.kpi || {};
  const charts = portfolioRaw?.Charts || {};
  const table = portfolioRaw?.table || [];

  /*
   =========================
   KPI MAPPING
   =========================
  */

  const mappedKpis = {
    termLoans: {
      title: kpi?.Term_Loans?.Title || 0,
      subtitle: kpi?.Term_Loans?.Subtitle || 0,
      footer: kpi?.Term_Loans?.Footer || "",
    },

    longTermDeb: {
      title: kpi?.Long_Term_Deb?.Title || 0,
      subtitle: kpi?.Long_Term_Deb?.Subtitle || 0,
      footer: kpi?.Long_Term_Deb?.Footer || "",
    },

    commercialPaper: {
      title: kpi?.Commercial_Paper?.Title || 0,
      subtitle: kpi?.Commercial_Paper?.Subtitle || 0,
      footer: kpi?.Commercial_Paper?.Footer || "",
    },

    ecbSwap: {
      title: kpi?.Ecb_Swap?.Title || 0,
      subtitle: kpi?.Ecb_Swap?.Subtitle || 0,
      footer: kpi?.Ecb_Swap?.Footer || "",
    },
  };

  /*
   =========================
   ADDITION VS REDEMPTION
   =========================
  */

  const additionRaw = charts?.["Addition vs Redemption"]?.values || {};

  const mappedTable = table.map((item, index) => ({
    id: index + 1,

    productType: item?.ptype || "-",

    closingBalance: Number(item?.Closing || 0),

    accrual: Number(item?.Accrual || 0),

    eirInterest: Number(item?.Eir_int || 0),

    productCode: item?.pcode || "-",

    transactions: Number(item?.Txns || 0),
  }));

  const productBreakdownChart = table
    .map((item) => ({
      name: item?.ptype || "-",
      value: Number(item?.Closing || 0),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 13);

  const closingBalanceChart = table
    .map((item) => ({
      name: item?.ptype || "-",
      value: Number(item?.Closing || 0),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 13);

  const productShareDonut = table
    .map((item) => ({
      name: item?.ptype || "-",
      value: Number(item?.Closing || 0),
    }))
    .filter((item) => item.value > 0);

  const additionVsRedemption = Object.entries(additionRaw)
    .map(([month, item]) => ({
      name: month,

      // positive bar
      addition: Number(item?.Addition || 0),

      // negative bar for UI effect
      redemption: -Math.abs(Number(item?.Redemption || 0)),
    }))
    .slice(-13);

  return {
    kpis: mappedKpis,
    additionVsRedemption,
    tableData: mappedTable,
    productBreakdownChart,
    closingBalanceChart,
    productShareDonut
  };
}
