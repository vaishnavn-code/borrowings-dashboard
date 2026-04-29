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
        totalRecords: {
          title: kpi?.Total_Records?.Title || 0,
          subtitle: kpi?.Total_Records?.Subtitle || "",
          footer: kpi?.Total_Records?.Footer || "",
        },

        totalClosingBal: {
          title: kpi?.Total_Closing_Bal?.Title || 0,
          subtitle: kpi?.Total_Closing_Bal?.Subtitle || "",
          footer: kpi?.Total_Closing_Bal?.Footer || "",
        },

        totalAccrual: {
          title: kpi?.Total_Accrual?.Title || 0,
          subtitle: kpi?.Total_Accrual?.Subtitle || "",
          footer: kpi?.Total_Accrual?.Footer || "",
        },

        reportingPeriod: {
          title: kpi?.Reporting_Period?.Title || selectedPeriod,
          subtitle: kpi?.Reporting_Period?.Subtitle || "",
          footer: kpi?.Reporting_Period?.Footer || "",
        },
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
        redemptionCr: item.Redemption_cr || 0,
        closingCr: item.Closing_cr || 0,
        accrualAmt: item.Accrual_amt || 0,

        wtAvgAmt: item.Wt_avg_amt || 0,
        avgFunds: item.Avg_funds || 0,

        openEir: item.Open_EIR || 0,
        exitEir: item.Exit_EIR || 0,
        wtIntAmtEir: item.Wt_Int_Amt_EIR || 0,
        avgRateEir: item.Avg_Rate_EIR || 0,
        avgRateEirPapm: item.Avg_Rate_EIR_PAPM || 0,

        exitRate: item.Exit_Rate || 0,
        exitSpread: item.Exit_Spread || 0,
        exitFinalRate: item.Exit_Final_Rate || 0,
        exitFinalRatePapm: item.Exit_Final_Rate_PAPM || 0,

        avgRateYield: item.Avg_Rate_Yield || 0,
        avgRateYieldPapm: item.Avg_Rate_Yield_PAPM || 0,

        wtIntAmtCouponYield: item.Wt_Int_Amt_Coupon_Yield || 0,
        wtAmtCouponYield: item.Wt_Amt_Coupon_Yield || 0,
      })),
    };
  };

  return {
    periods: sortedPeriods,
    latestPeriod,
    getPeriodData,
  };
}
