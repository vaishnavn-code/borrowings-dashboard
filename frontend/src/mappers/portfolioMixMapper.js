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

  const additionRaw = portfolioCharts?.["Addition vs Redemption"]?.values || {};

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

    productType: item?.pgroup || "-",

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
      percent: parseFloat(String(item?.Share || "0").replace("%", "")),
    }))
    .filter((item) => item.value > 0);

  const portfolioTrendRaw =
    portfolioCharts?.["Portfolio Month-Year Product Group Split"]?.values || {};

  const portfolioTrendData = Object.entries(portfolioTrendRaw)
  .map(([month, products]) => {
    const debentures = products?.Debentures || {};
    const commercialPaper =
      products?.["Commercial Paper"] ||
      products?.["Commerical Paper"] ||
      {};
    const others = products?.Others || {};
    const loans = products?.Loans || {};

    return {
      name: month,

      /* OPENING */
      debenturesOpening: Number(debentures?.opening || 0),
      commercialPaperOpening: Number(commercialPaper?.opening || 0),
      othersOpening: Number(others?.opening || 0),
      loansOpening: Number(loans?.opening || 0),

      /* CLOSING */
      debenturesClosing: Number(debentures?.closing || 0),
      commercialPaperClosing: Number(commercialPaper?.closing || 0),
      othersClosing: Number(others?.closing || 0),
      loansClosing: Number(loans?.closing || 0),

      /* REDEMPTION */
      debenturesRedemption: Number(debentures?.redemption || 0),
      commercialPaperRedemption: Number(commercialPaper?.redemption || 0),
      othersRedemption: Number(others?.redemption || 0),
      loansRedemption: Number(loans?.redemption || 0),

      /* ADDITION */
      debenturesAddition: Number(debentures?.addition || 0),
      commercialPaperAddition: Number(commercialPaper?.addition || 0),
      othersAddition: Number(others?.addition || 0),
      loansAddition: Number(loans?.addition || 0),

      /* AVG EIR */
      debenturesEir: Number(debentures?.avg_eir || 0),
      commercialPaperEir: Number(commercialPaper?.avg_eir || 0),
      othersEir: Number(others?.avg_eir || 0),
      loansEir: Number(loans?.avg_eir || 0),

      /* WT AVG AMT */
      debenturesWtAvgAmt: Number(debentures?.wt_avg_amt || 0),
      commercialPaperWtAvgAmt: Number(commercialPaper?.wt_avg_amt || 0),
      othersWtAvgAmt: Number(others?.wt_avg_amt || 0),
      loansWtAvgAmt: Number(loans?.wt_avg_amt || 0),

      /* AVG FUNDS */
      debenturesAvgFunds: Number(debentures?.avg_funds || 0),
      commercialPaperAvgFunds: Number(commercialPaper?.avg_funds || 0),
      othersAvgFunds: Number(others?.avg_funds || 0),
      loansAvgFunds: Number(loans?.avg_funds || 0),

      /* OPEN EIR */
      debenturesOpenEir: Number(debentures?.open_eir || 0),
      commercialPaperOpenEir: Number(commercialPaper?.open_eir || 0),
      othersOpenEir: Number(others?.open_eir || 0),
      loansOpenEir: Number(loans?.open_eir || 0),

      /* EXIT EIR */
      debenturesExitEir: Number(debentures?.exit_eir || 0),
      commercialPaperExitEir: Number(commercialPaper?.exit_eir || 0),
      othersExitEir: Number(others?.exit_eir || 0),
      loansExitEir: Number(loans?.exit_eir || 0),

      /* WT INT AMT EIR */
      debenturesWtIntAmtEir: Number(debentures?.wt_int_amt_eir || 0),
      commercialPaperWtIntAmtEir: Number(commercialPaper?.wt_int_amt_eir || 0),
      othersWtIntAmtEir: Number(others?.wt_int_amt_eir || 0),
      loansWtIntAmtEir: Number(loans?.wt_int_amt_eir || 0),

      /* AVG RATE EIR */
      debenturesAvgRateEir: Number(debentures?.avg_rate_eir || 0),
      commercialPaperAvgRateEir: Number(commercialPaper?.avg_rate_eir || 0),
      othersAvgRateEir: Number(others?.avg_rate_eir || 0),
      loansAvgRateEir: Number(loans?.avg_rate_eir || 0),

      /* AVG RATE EIR PAPM */
      debenturesAvgRateEirPapm: Number(debentures?.avg_rate_eir_papm || 0),
      commercialPaperAvgRateEirPapm: Number(
        commercialPaper?.avg_rate_eir_papm || 0
      ),
      othersAvgRateEirPapm: Number(others?.avg_rate_eir_papm || 0),
      loansAvgRateEirPapm: Number(loans?.avg_rate_eir_papm || 0),

      /* EXIT RATE */
      debenturesExitRate: Number(debentures?.exit_rate || 0),
      commercialPaperExitRate: Number(commercialPaper?.exit_rate || 0),
      othersExitRate: Number(others?.exit_rate || 0),
      loansExitRate: Number(loans?.exit_rate || 0),

      /* EXIT SPREAD */
      debenturesExitSpread: Number(debentures?.exit_spread || 0),
      commercialPaperExitSpread: Number(commercialPaper?.exit_spread || 0),
      othersExitSpread: Number(others?.exit_spread || 0),
      loansExitSpread: Number(loans?.exit_spread || 0),

      /* EXIT FINAL RATE */
      debenturesExitFinalRate: Number(debentures?.exit_final_rate || 0),
      commercialPaperExitFinalRate: Number(
        commercialPaper?.exit_final_rate || 0
      ),
      othersExitFinalRate: Number(others?.exit_final_rate || 0),
      loansExitFinalRate: Number(loans?.exit_final_rate || 0),

      /* EXIT FINAL RATE PAPM */
      debenturesExitFinalRatePapm: Number(
        debentures?.exit_final_rate_papm || 0
      ),
      commercialPaperExitFinalRatePapm: Number(
        commercialPaper?.exit_final_rate_papm || 0
      ),
      othersExitFinalRatePapm: Number(others?.exit_final_rate_papm || 0),
      loansExitFinalRatePapm: Number(loans?.exit_final_rate_papm || 0),

      /* AVG RATE YIELD */
      debenturesAvgRateYield: Number(debentures?.avg_rate_yield || 0),
      commercialPaperAvgRateYield: Number(
        commercialPaper?.avg_rate_yield || 0
      ),
      othersAvgRateYield: Number(others?.avg_rate_yield || 0),
      loansAvgRateYield: Number(loans?.avg_rate_yield || 0),

      /* AVG RATE YIELD PAPM */
      debenturesAvgRateYieldPapm: Number(
        debentures?.avg_rate_yield_papm || 0
      ),
      commercialPaperAvgRateYieldPapm: Number(
        commercialPaper?.avg_rate_yield_papm || 0
      ),
      othersAvgRateYieldPapm: Number(others?.avg_rate_yield_papm || 0),
      loansAvgRateYieldPapm: Number(loans?.avg_rate_yield_papm || 0),

      /* WT INT AMT COUPON YIELD */
      debenturesWtIntAmtCouponYield: Number(
        debentures?.wt_int_amt_coupon_yield || 0
      ),
      commercialPaperWtIntAmtCouponYield: Number(
        commercialPaper?.wt_int_amt_coupon_yield || 0
      ),
      othersWtIntAmtCouponYield: Number(
        others?.wt_int_amt_coupon_yield || 0
      ),
      loansWtIntAmtCouponYield: Number(
        loans?.wt_int_amt_coupon_yield || 0
      ),

      /* WT AMT COUPON YIELD */
      debenturesWtAmtCouponYield: Number(
        debentures?.wt_amt_coupon_yield || 0
      ),
      commercialPaperWtAmtCouponYield: Number(
        commercialPaper?.wt_amt_coupon_yield || 0
      ),
      othersWtAmtCouponYield: Number(
        others?.wt_amt_coupon_yield || 0
      ),
      loansWtAmtCouponYield: Number(
        loans?.wt_amt_coupon_yield || 0
      ),
    };
  })
  .slice(-13);

  const firstMonth = Object.values(portfolioTrendRaw || {})[0] || {};
  const firstProduct = Object.values(firstMonth)[0] || {};

  const portfolioFieldOptions = Object.keys(firstProduct);

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
    portfolioTrendData,
    portfolioFieldOptions
  };
}
