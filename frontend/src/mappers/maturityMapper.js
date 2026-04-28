export function mapMaturityAnalysis(rawData) {
  const maturityRaw = rawData?.["Maturity Analysis"] || rawData || {};

  const kpi = maturityRaw?.kpi || {};
  const charts = maturityRaw?.charts || {};

  /*
  =========================
  KPI MAPPING
  =========================
  */

  const mappedKpis = {
    wtdAvgResidual: {
      title: kpi?.Wtd_Avg_Residual?.Title || 0,
      subtitle: kpi?.Wtd_Avg_Residual?.Subtitle || "",
      footer: kpi?.Wtd_Avg_Residual?.Footer || "",
    },

    maturing: {
      title: kpi?.Maturing?.Title || 0,
      subtitle: kpi?.Maturing?.Subtitle || "",
      footer: kpi?.Maturing?.Footer || "",
    },

    alreadyMatured: {
      title: kpi?.Already_Matured?.Title || 0,
      subtitle: kpi?.Already_Matured?.Subtitle || "",
      footer: kpi?.Already_Matured?.Footer || "",
    },

    longTerm: {
      title: kpi?.Long_Term?.Title || 0,
      subtitle: kpi?.Long_Term?.Subtitle || "",
      footer: kpi?.Long_Term?.Footer || "",
    },
  };

  /*
  =========================
  STACKED BAR + LINE CHART
  Closing Balance by Maturity Bucket
  =========================
  */

  const maturityTrendRaw =
    charts?.["Closing Balance by Maturity Bucket"]?.values || {};

  const maturityClosingTrendData = Object.entries(maturityTrendRaw).map(
    ([month, item]) => {
      const buckets = item?.buckets || {};

      return {
        name: month,

        matured: Number(buckets?.["Matured"]?.closing_bal || 0),
        lt1: Number(buckets?.["<1Y"]?.closing_bal || 0),
        y1to3: Number(buckets?.["1-3Y"]?.closing_bal || 0),
        y3to5: Number(buckets?.["3-5Y"]?.closing_bal || 0),
        gt5: Number(buckets?.[">5Y"]?.closing_bal || 0),

        avgEir: Number(buckets?.["3-5Y"]?.Avg_Eir || 0),
      };
    },
  );

  const productTypeRaw = charts?.["Maturity Bucket Distribution"]?.values || {};

  const productTypeMaturityBucketData = Object.entries(productTypeRaw).map(
    ([productName, item]) => {
      const buckets = item?.buckets || {};

      return {
        name: productName,

        matured: Number(buckets?.["Matured"]?.closing_amt || 0),

        lt1: Number(buckets?.["<1Y"]?.closing_amt || 0),

        y1to3: Number(buckets?.["1-3Y"]?.closing_amt || 0),

        y3to5: Number(buckets?.["3-5Y"]?.closing_amt || 0),

        gt5: Number(buckets?.[">5Y"]?.closing_amt || 0),
      };
    },
  );

  /*
  =========================
  DONUT CHART
  Maturity Bucket Distribution
  =========================
  */

  const maturityBucketRaw =
    charts?.["Maturity Bucket Distribution"]?.values || {};

  const bucketTotals = {
    matured: 0,
    lt1: 0,
    y1to3: 0,
    y3to5: 0,
    gt5: 0,
  };

  Object.values(maturityBucketRaw).forEach((product) => {
    const buckets = product?.buckets || {};

    bucketTotals.matured += Number(buckets?.["Matured"]?.closing_amt || 0);

    bucketTotals.lt1 += Number(buckets?.["<1Y"]?.closing_amt || 0);

    bucketTotals.y1to3 += Number(buckets?.["1-3Y"]?.closing_amt || 0);

    bucketTotals.y3to5 += Number(buckets?.["3-5Y"]?.closing_amt || 0);

    bucketTotals.gt5 += Number(buckets?.[">5Y"]?.closing_amt || 0);
  });

  const totalMaturityValue =
    Number(bucketTotals.matured || 0) +
    Number(bucketTotals.lt1 || 0) +
    Number(bucketTotals.y1to3 || 0) +
    Number(bucketTotals.y3to5 || 0) +
    Number(bucketTotals.gt5 || 0);

  const getPercent = (value) =>
    totalMaturityValue ? (Number(value || 0) / totalMaturityValue) * 100 : 0;

  const maturityBucketDistributionData = [
    {
      name: "Matured",
      value: bucketTotals.matured,
      percent: getPercent(bucketTotals.matured),
      color: "#90CAF9",
    },
    {
      name: "< 1 Year",
      value: bucketTotals.lt1,
      percent: getPercent(bucketTotals.lt1),
      color: "#1565C0",
    },
    {
      name: "1 - 3 Years",
      value: bucketTotals.y1to3,
      percent: getPercent(bucketTotals.y1to3),
      color: "#1E88E5",
    },
    {
      name: "3 - 5 Years",
      value: bucketTotals.y3to5,
      percent: getPercent(bucketTotals.y3to5),
      color: "#42A5F5",
    },
    {
      name: "> 5 Years",
      value: bucketTotals.gt5,
      percent: getPercent(bucketTotals.gt5),
      color: "#0288D1",
    },
  ];

  const rateTypeRaw = charts?.["Rate Type by Maturity Bucket"]?.values || {};

  const rateTypeByMaturityBucketData = [
    "Matured",
    "<1Y",
    "1-3Y",
    "3-5Y",
    ">5Y",
  ].map((bucket) => ({
    name: bucket,

    fixed: Number(rateTypeRaw?.[bucket]?.Fixed || 0),

    floating: Number(rateTypeRaw?.[bucket]?.Floating || 0),
  }));

  const annualMaturityRaw = charts?.["Annual Maturity Profile"]?.values || {};

  const annualMaturityProfileData = Object.entries(annualMaturityRaw).map(
    ([year, value]) => ({
      name: year,
      fixed: Number(value || 0), // using existing chart key
      floating: 0, // keep 0 since we reuse same stacked bar component
    }),
  );

  return {
    kpis: mappedKpis,
    maturityClosingTrendData,
    maturityBucketDistributionData,
    productTypeMaturityBucketData,
    rateTypeByMaturityBucketData,
    annualMaturityProfileData,
  };
}
