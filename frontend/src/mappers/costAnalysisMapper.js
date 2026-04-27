export function mapCostAnalysis(rawData) {
  const costRaw = rawData?.["Cost Analysis"] || {};

  const kpi = costRaw?.kpi || {};
  const charts = costRaw?.charts || {};

  /*
   =========================
   KPI MAPPING
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
    ]?.values || {};

  const trendChart = Object.entries(trendRaw)
    .map(([month, item]) => ({
      name: month,

      // bar 1
      loan: Number(item?.Accrual_Amt || 0),

      // bar 2
      sanction: Number(item?.Eir_Int_Amt || 0),

      // line + area
      outstanding: Number(item?.Closing_Balance || 0),
    }))
    .slice(-13); // latest 13 months only

  return {
    kpis: mappedKpis,
    trendChart,
  };
}