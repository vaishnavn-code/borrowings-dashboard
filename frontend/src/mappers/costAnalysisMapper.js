export function mapCostAnalysis(rawData) {
  const costRaw = rawData?.["Cost Analysis"] || {};

  const kpi = costRaw?.kpi || {};
  const charts = costRaw?.charts || {};

  /*
   =========================
   KPI
   =========================
  */

  const mappedKpis = {
    monthlyAccrual: {
      title: kpi?.Monthly_Accrual?.Title || "",
      subtitle: kpi?.Monthly_Accrual?.Subtitle || "",
      footer: kpi?.Monthly_Accrual?.Footer || "",
    },

    eirWeightedInt: {
      title: kpi?.["Eir_Weighted Int"]?.Title || "",
      subtitle: kpi?.["Eir_Weighted Int"]?.Subtitle || "",
      footer: kpi?.["Eir_Weighted Int"]?.Footer || "",
    },

    couponYield: {
      title: kpi?.Coupon_Yeild?.Title || "",
      subtitle: kpi?.Coupon_Yeild?.Subtitle || "",
      footer: kpi?.Coupon_Yeild?.Footer || "",
    },

    averageFunds: {
      title: kpi?.Average_Funds?.Title || "",
      subtitle: kpi?.Average_Funds?.Subtitle || "",
      footer: kpi?.Average_Funds?.Footer || "",
    },
  };

  /*
   =========================
   MAIN TREND CHART
   =========================
  */

  const trendRaw =
    charts?.[
      "Accrual Cost & EIR Interest vs Closing Balance Trend"
    ]?.values?.Months || {};

  const trendChart = Object.entries(trendRaw).map(([month, item]) => ({
    name: month,
    loan: Number(item?.Accrual_Amt || 0),
    sanction: Number(item?.Eir_Int_Amt || 0),
    outstanding: Number(item?.Closing_Balance || 0),
  }));

  /*
   =========================
   ACCRUAL BY PRODUCT
   =========================
  */

  const accrualProductRaw =
    charts?.["Accrual by Product Type — Apr 2026"]?.values || {};

  const accrualByProduct = Object.entries(accrualProductRaw)
    .map(([name, item]) => ({
      name,
      value: Number(item?.Accrual || 0),
    }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 13);

  /*
   =========================
   DONUT CHART
   =========================
  */

  const productSplitRaw =
    charts?.["Product Type Split"]?.values || {};

  const productDonut = Object.entries(productSplitRaw)
    .map(([name, item]) => ({
      name,
      value: Number(item?.Accrual || 0),
    }))
    .filter((x) => x.value > 0);

  /*
   =========================
   4 HORIZONTAL CHARTS
   FROM PRODUCT TYPE SPLIT
   =========================
  */

  const mapHorizontalMetric = (key) =>
    Object.entries(productSplitRaw)
      .map(([name, item]) => ({
        name,
        value: Number(item?.[key] || 0),
      }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 13);

  const accrualAmountChart = mapHorizontalMetric("Accrual");

  const wtAvgAmountChart =
    mapHorizontalMetric("Wt_Avg_Amount");

  const avgFundsChart =
    mapHorizontalMetric("Avg_Funds");

  const intAmtEirChart =
    mapHorizontalMetric("Int_Amt_Eir");

  return {
    kpis: mappedKpis,
    trendChart,
    accrualByProduct,
    productDonut,

    accrualAmountChart,
    wtAvgAmountChart,
    avgFundsChart,
    intAmtEirChart,
  };
}