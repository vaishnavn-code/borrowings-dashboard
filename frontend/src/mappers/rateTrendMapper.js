export function mapRateTrends(rawData) {
  const rateRaw = rawData?.["Rate Trends"] || {};

  const kpi = rateRaw?.kpi || {};
  const charts = rateRaw?.charts || {};
  const table = rateRaw?.table || [];   

  /*
   =========================
   KPI MAPPING
   =========================
  */

  const mappedKpis = {
    fixedBalance: {
      title: kpi?.Fixed_Balance?.Title || 0,
      subtitle: kpi?.Fixed_Balance?.Subtitle || "",
      footer: kpi?.Fixed_Balance?.Footer || "",
    },

    avgEirRate: {
      title: kpi?.Avg_Eir_Rate?.Title || 0,
      subtitle: kpi?.Avg_Eir_Rate?.Subtitle || "",
      footer: kpi?.Avg_Eir_Rate?.Footer || "",
    },

    avgExitRate: {
      title: kpi?.Avg_Exit_Rate?.Title || 0,
      subtitle: kpi?.Avg_Exit_Rate?.Subtitle || "",
      footer: kpi?.Avg_Exit_Rate?.Footer || "",
    },

    avgCouponYield: {
      title: kpi?.Avg_Coupon_Yeild?.Title || 0,
      subtitle: kpi?.Avg_Coupon_Yeild?.Subtitle || "",
      footer: kpi?.Avg_Coupon_Yeild?.Footer || "",
    },
  };

  /*
   =========================
   MIXED CHART
   =========================
  */

  const trendRaw = charts?.["Rate Trend"] || {};

  const rateTrendData = Object.entries(trendRaw).map(([month, item]) => ({
    name: month,

    fixedBalance: Number(item?.Fixed_Bal || 0),
    floatingBalance: Number(item?.Floating_Bal || 0),

    avgEir: Number(item?.Avg_Eir || 0),
    exitRate: Number(item?.Exit_Eir || 0),
    couponYield: Number(item?.Coupon_Yeild || 0),
  }));

  /*
   =========================
   LINE CHART
   =========================
  */

  const eirMovementData = rateTrendData.map((item) => ({
    name: item.name,
    value: item.avgEir,
  }));

  /*
   =========================
   GROUPED BAR
   =========================
  */

  const comparisonData = rateTrendData.map((item) => ({
    name: item.name,
    Coupon: item.couponYield,
    EIR: item.avgEir,
  }));

  /*
   =========================
   TABLE
   =========================
  */

  const mappedTable = table.map((item, index) => ({
    id: index + 1,

    period: item?.Period || "-",

    avgEir: Number(item?.["Avg EIR%"] || 0),

    avgExit: Number(item?.["Avg Exit%"] || 0),

    avgYield: Number(item?.["Avg Yield%"] || 0),

    fixedCr: Number(item?.["Fixed ₹Cr"] || 0),

    floatingCr: Number(item?.["Floating ₹Cr"] || 0),

    closingCr: Number(item?.["Closing ₹Cr"] || 0),
  }));

  return {
    kpis: mappedKpis,
    rateTrendData,
    eirMovementData,
    comparisonData,
    tableData: mappedTable,
  };
}
