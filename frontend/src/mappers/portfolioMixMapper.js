export function mapPortfolioMix(rawData) {
  /*
   ==================================================
   TWO ROOTS
   ==================================================

   Portfolio Mix:
   - KPI cards
   - Addition vs Redemption
   - Table

   Cost Analysis:
   - Closing Balance by Product Type
   - Accrual by Product Type
   - Product Share %
  */

  const portfolioMixRaw = rawData?.["Portfolio Mix"] || {};
  const costAnalysisRaw = rawData?.["Cost Analysis"] || {};

  /*
   ==================================================
   SOURCES
   ==================================================
  */

  // Portfolio Mix
  const kpi = portfolioMixRaw?.kpi || {};
  const table = portfolioMixRaw?.table || [];
  const portfolioCharts =
    portfolioMixRaw?.Charts || portfolioMixRaw?.charts || {};

  // Cost Analysis
  const costCharts = costAnalysisRaw?.charts || {};

  /*
   ==================================================
   KPI MAPPING
   ==================================================
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
   ==================================================
   ADDITION VS REDEMPTION
   (FROM PORTFOLIO MIX)
   ==================================================
  */

  const additionRaw =
    portfolioCharts?.["Addition vs Redemption"]?.values || {};

  const additionVsRedemption = Object.entries(additionRaw)
    .map(([month, item]) => ({
      name: month,

      // positive bar
      addition: Number(item?.Addition || 0),

      // negative for UI effect
      redemption: -Math.abs(Number(item?.Redemption || 0)),
    }))
    .slice(-13);

  /*
   ==================================================
   TABLE
   (FROM PORTFOLIO MIX)
   ==================================================
  */

  const mappedTable = table.map((item, index) => ({
    id: index + 1,

    productType: item?.ptype || "-",

    closingBalance: Number(item?.Closing || 0),

    accrual: Number(item?.Accrual || 0),

    eirInterest: Number(item?.Eir_int || 0),

    productCode: item?.pcode || "-",

    transactions: Number(item?.Txns || 0),
  }));

  /*
   ==================================================
   COST ANALYSIS CHARTS
   (FROM COST ANALYSIS)
   ==================================================
  */

  const accrualProductRaw =
    costCharts?.["Accrual by Product Type — Apr 2026"]?.values || {};

  /*
   ==================================================
   ACCRUAL BY PRODUCT TYPE
   ==================================================
  */

  const productBreakdownChart = Object.entries(accrualProductRaw)
    .map(([name, item]) => ({
      name,
      value: Number(item?.Accrual || 0),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  /*
   ==================================================
   CLOSING BALANCE BY PRODUCT TYPE
   ==================================================
  */

  const closingBalanceChart = Object.entries(accrualProductRaw)
    .map(([name, item]) => ({
      name,
      value: Number(item?.Closing || 0),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  /*
   ==================================================
   PRODUCT SHARE DONUT
   ==================================================
  */

  const productShareDonut = Object.entries(accrualProductRaw)
    .map(([name, item]) => ({
      name,
      value: Number(item?.Closing || 0),
      percent: parseFloat(
        String(item?.Share || "0").replace("%", "")
      ),
    }))
    .filter((item) => item.value > 0);

  /*
   ==================================================
   FINAL RETURN
   ==================================================
  */

  return {
    kpis: mappedKpis,
    additionVsRedemption,
    tableData: mappedTable,
    productBreakdownChart,
    closingBalanceChart,
    productShareDonut,
  };
}