/**
 * All display-formatting helpers.
 * Values are always in raw INR from the API; these convert to display units.
 */

export const fmt = {
  /** ₹ 1,234.56 Bn  (raw value in INR) */
  bn: (v, decimals = 2) => `₹${(v / 1e9).toFixed(decimals)} Bn`,

  /** ₹ 1,234.56 Cr  (raw value in INR) */
  cr: (v) => {
    const val = Number(v || 0) / 1e7; // INR → Cr

    // Very large values → Lakh Cr
    if (val >= 100000) {
      return `₹${Math.round(val / 100000).toLocaleString("en-IN")} L Cr`;
    }

    // Normal values → Cr
    return `₹${Math.round(val).toLocaleString("en-IN")} Cr`;
  },

  /** ₹ 1,234.56 Mn */
  mn: (v, decimals = 2) => `₹${(v / 1e6).toFixed(decimals)} Mn`,

  /** Auto-pick Bn / Mn / raw */
  auto: (v) => {
    const abs = Math.abs(v);
    if (abs >= 1e9) return `₹${(v / 1e9).toFixed(2)} Bn`;
    if (abs >= 1e6) return `₹${(v / 1e6).toFixed(2)} Mn`;
    return `₹${v.toLocaleString("en-IN")}`;
  },

  /** 8.25 → "8.25%" */
  pct: (v, decimals = 2) => `${parseFloat(v).toFixed(decimals)}%`,

  /** 14.5 → "14.5 yrs" */
  tenor: (v) => `${v} yrs`,

  /** Already in Bn from API */
  bnRaw: (v, decimals = 2) => `₹${parseFloat(v).toFixed(decimals)} Bn`,

  /** Already in Mn from API */
  mnRaw: (v, decimals = 2) => `₹${parseFloat(v).toFixed(decimals)} Mn`,

  /** Integer with commas */
  int: (v) => Number(v).toLocaleString("en-IN"),

  /** Clamp a percentage 0–100 */
  spark: (v) => `${Math.min(100, Math.max(0, v)).toFixed(1)}%`,
};

export const fullMonthMap = {
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April",
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
};

export const formatMonthLabel = (value) => {
  if (!value) return "-";

  const monthMap = {
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Aug",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec",
  };

  // convert to number first
  let monthNum = Number(value);

  // keep only 1 → 12 cycle
  // example:
  // 13 → 1 (Jan)
  // 14 → 2 (Feb)
  // 26 → 2 (Feb)
  // 31 → 7 (Jul)

  monthNum = ((monthNum - 1) % 12) + 1;

  const key = String(monthNum).padStart(2, "0");

  return monthMap[key] || "-";
};

export const formatMonth = (val) => {
  if (!val) return "";
  const [mon, year] = val.split("-");
  return `${fullMonthMap[mon] || mon} - ${year}`;
};
