// src/mappers/overviewMapper.js

export const mapOverviewData = (apiData) => {
  const overview = apiData?.overview || {};
  const kpis = overview?.kpis || {};
  const charts = overview?.Charts || {};
  const table = overview?.Table || [];

  /*
  =====================================================
  HELPERS
  =====================================================
  */

  const toCr = (value) => {
    if (!value && value !== 0) return 0;
    return +(Number(value) / 10000000).toFixed(2);
  };

  /*
  =====================================================
  1. KPI CARDS
  =====================================================
  */

  const mappedKpis = {
    closingBalance: {
      Title: toCr(kpis?.["Closing Balance"]?.Title),
      Subtitle: kpis?.["Closing Balance"]?.Subtitle || "",
      Footer: kpis?.["Closing Balance"]?.Footer || "",
    },

    monthlyAccrual: {
      Title: toCr(kpis?.["Monthly Accural"]?.Title),
      Subtitle: kpis?.["Monthly Accural"]?.Subtitle || "",
      Footer: kpis?.["Monthly Accural"]?.Footer || "",
    },

    avgEirRate: {
      Title: Number(kpis?.["Avg Eir Rate"]?.Title || 0),
      Subtitle: kpis?.["Avg Eir Rate"]?.Subtitle || "%",
      Footer: kpis?.["Avg Eir Rate"]?.Footer || "",
    },

    totalClosing: {
      Title: toCr(kpis?.["Total Closing"]?.Title),
      Subtitle: kpis?.["Total Closing"]?.Subtitle || "",
      Footer: kpis?.["Total Closing"]?.Footer || "",
    },
  };

  /*
  =====================================================
  2. Monthly Closing Balance & Accrual Trend
  (Opening + Closing + Avg EIR)
  =====================================================
  */

  const monthlyTrendRaw =
    charts?.["Monthly Closing Balance & Accrual Trend"]?.Months || {};

  const monthlyTrend = Object.entries(monthlyTrendRaw)
    .sort((a, b) => Number(a[0]) - Number(b[0])) // proper month order
    .slice(-13) // only latest 13 months
    .map(([month, value]) => ({
      name: month,
      opening: Number(value?.Opening_amt || 0),
      closing: Number(value?.Closing_bal || 0),
      eir: Number(value?.["Avg Eir"] || 0),
      count: Number(value?.count || 0),
    }));

  /*
  =====================================================
  3. Borrowing Book by Product Type
  (default latest month used)
  =====================================================
  */

  const borrowingBookRaw =
    charts?.["Borrowing Book by Product Type"]?.Month || {};

  const latestMonth =
    Object.keys(borrowingBookRaw).sort((a, b) => Number(b) - Number(a))[0] ||
    null;

  const borrowingBookByProduct = latestMonth
    ? Object.entries(borrowingBookRaw[latestMonth] || {}).map(
        ([label, value]) => ({
          label,
          count: toCr(value?.book || 0),
          accrual: toCr(value?.accural || 0),
          eir: +Number(value?.eir || 0).toFixed(2),
          rawCount: value?.count || 0,
        }),
      )
    : [];

  /*
  =====================================================
  4. Product Type Mix
  =====================================================
  */

  const productMixRaw = charts?.["Product Type Mix"] || {};

  const productMix = Object.entries(productMixRaw).map(([name, value]) => ({
    name,
    value: toCr(value),
  }));

  /*
  =====================================================
  5. Summary Metrics
  =====================================================
  */

  const summaryMetricsRaw = charts?.["Summary Metrics"] || {};

  const summaryMetrics = {
    totalBook: toCr(summaryMetricsRaw?.["Total Book"]),
    wtdAvgEir: Number(summaryMetricsRaw?.["Wtd Avg EIR"] || 0),
    totalAccrual: toCr(summaryMetricsRaw?.["Total Accrual"]),
    activeLines: Number(summaryMetricsRaw?.["Active Lines"] || 0),
  };

  /*
  =====================================================
  6. Rate & Mix Snapshot
  =====================================================
  */

  const rateMixRaw = charts?.["Rate & Mix Snapshot"] || {};

  const rateMixSnapshot = {
    fixedRate: toCr(rateMixRaw?.["Fixed Rate"]),
    floatingRate: toCr(rateMixRaw?.["Floating Rate"]),
    avgExitRate: Number(rateMixRaw?.["Avg Exit Rate"] || 0),
    avgCouponYield: Number(rateMixRaw?.["Avg Coupon/Yield"] || 0),
    maturities2026: Number(rateMixRaw?.["2026_Maturities"] || 0),
    peakMaturity: Number(rateMixRaw?.["Peak_Maturity"] || 0),
  };

  const portfolioSplitRaw =
    charts?.["Portfolio & Rate Type Split"]?.Portfolio || {};

  const portfolioSplitData = Object.entries(portfolioSplitRaw).map(
    ([label, value]) => ({
      label,
      count: toCr(value),
    }),
  );

  const rateTypeRaw =
    charts?.["Portfolio & Rate Type Split"]?.["Rate Type"] || {};

  const rateTypeData = Object.entries(rateTypeRaw).map(([label, value]) => ({
    label,
    count: toCr(value),
  }));

  /*
  =====================================================
  7. Monthly Summary Table
  =====================================================
  */

  const monthlySummaryTable = table.map((row) => ({
    period: row?.Period || "",
    openingCr: toCr(row?.Opening || 0),
    closingCr: toCr(row?.Closing || 0),
    additionCr: toCr(row?.Addition || 0),
    redemptionCr: toCr(row?.Redemption || 0),
    accrualCr: toCr(row?.Accural || 0),
    eirIntCr: toCr(row?.["Eir Int"] || 0),
    avgEir: Number(row?.["Avg Eir"] || 0),
    avgExit: Number(row?.["Avg Exit"] || 0),
    count: Number(row?.Count || 0),
  }));

  /*
  =====================================================
  FINAL RETURN
  =====================================================
  */

  return {
    kpis: mappedKpis,
    monthlyTrend,
    borrowingBookByProduct,
    latestBorrowingBookMonth: latestMonth,
    productMix,
    summaryMetrics,
    rateMixSnapshot,
    portfolioSplitData,
    rateTypeData,
    monthlySummaryTable,
  };
};
