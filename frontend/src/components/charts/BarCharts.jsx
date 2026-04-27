import React from "react";

import {
  BarChart,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
  Area,
} from "recharts";
import { buildUnifiedTooltip } from "./ChartTooltip";
import { fmt } from "../../utils/formatters";

/** Vertical bar chart */
export function VerticalBar({
  data,
  dataKey,
  nameKey = "label",
  color = "var(--blue)",
  height = 280,
  unit = "",
  formatter,
  barSize = 32,
  slantLabels = false,
  isCurrency = false,
}) {
  const maxValue = Math.max(...data.map((d) => d[dataKey] || 0));
  const step = Math.ceil(maxValue / 4);
  const ticks = Array.from({ length: 5 }, (_, i) => i * step);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 25, right: 8, left: 0, bottom: 80 }}>
        <CartesianGrid
          stroke="rgba(0,0,0,0.08)"
          horizontal={true}
          vertical={false}
        />
        <XAxis
          dataKey={nameKey}
          interval={0}
          tickLine={false}
          axisLine={false}
          height={10}
          tick={({ x, y, payload }) => {
            let value = payload.value || "";

            value = value.replace("Years", "Y");

            const displayValue =
              value.length > 20 ? value.slice(0, 20) + "..." : value;

            if (slantLabels) {
              return (
                <text
                  x={x}
                  y={y + 10}
                  textAnchor="end"
                  fill="var(--text-muted)"
                  fontSize={10}
                  fontFamily="Inter"
                  transform={`rotate(-35, ${x}, ${y})`}
                >
                  {displayValue}
                </text>
              );
            }

            // ✅ STRAIGHT LABEL
            return (
              <text
                x={x}
                y={y + 10}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize={10}
                fontFamily="Inter"
              >
                {displayValue}
              </text>
            );
          }}
        />
        <YAxis
          tick={{
            fontSize: 10,
            fill: "var(--text-muted)",
            fontFamily: "Inter",
          }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          tickFormatter={(v) =>
            isCurrency ? Math.round(v / 1e7) : Math.round(v)
          }
          label={{
            value: isCurrency ? "In ₹ Crs" : "",
            angle: -90,
            position: "insideLeft",
            style: {
              fontSize: 10,
              fill: "var(--text-muted)",
            },
          }}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={buildUnifiedTooltip({
            valueFormatter: (value) =>
              formatter
                ? formatter(value) // ✅ use custom formatter if passed
                : Number(value).toLocaleString("en-IN"), // ✅ default = plain number
          })}
        />
        <defs>
          <linearGradient id="tenorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(71, 136, 208, 1)" />
            <stop offset="100%" stopColor="rgba(144,202,249,0.22)" />
          </linearGradient>

          <linearGradient id="intGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(111, 164, 221, 1)" />{" "}
            {/* TOP = dark */}
            <stop offset="100%" stopColor="rgba(220, 238, 253, 1)" />{" "}
            {/* BOTTOM = light */}
          </linearGradient>

          <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(111, 164, 221, 1)" />{" "}
            {/* TOP = dark */}
            <stop offset="100%" stopColor="rgba(220, 238, 253, 1)" />{" "}
            {/* BOTTOM = light */}
          </linearGradient>

          <linearGradient id="ratePurpleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(111, 164, 221, 1)" />{" "}
            {/* TOP = dark */}
            <stop offset="100%" stopColor="rgba(220, 238, 253, 1)" />{" "}
            {/* BOTTOM = light */}
          </linearGradient>

          <linearGradient id="tenorOrangeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(111, 164, 221, 1)" />{" "}
            {/* TOP = dark */}
            <stop offset="100%" stopColor="rgba(220, 238, 253, 1)" />{" "}
            {/* BOTTOM = light */}
          </linearGradient>

          <linearGradient id="principalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(77, 145, 81, 1)" />
            <stop offset="100%" stopColor="rgba(77, 145, 81, 0.2)" />
          </linearGradient>
        </defs>

        <Bar
          dataKey={dataKey}
          fill={color?.startsWith("url") ? color : "url(#tenorGradient)"}
          radius={[4, 4, 0, 0]}
          maxBarSize={barSize}
          activeBar={false} // ✅ ADD THIS
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Horizontal bar chart — best for named group comparisons */
export function HorizontalBar({
  data,
  dataKey,
  nameKey = "name",
  height,
  unit = "",
  formatter,
}) {
  const h = height || Math.max(220, data.length * 28);
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart
        data={data}
        layout="vertical"
        barCategoryGap="25%"
        margin={{ top: 20, right: 8, left: 0, bottom: 20 }}
      >
        <defs>
          <linearGradient id="hbarBlueGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(220, 238, 253, 1)" />{" "}
            {/* light */}
            <stop offset="100%" stopColor="rgba(111, 164, 221, 1)" />{" "}
            {/* dark */}
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(0,0,0,0.08)" horizontal={false} />
        <XAxis
          type="number"
          tick={{
            fontSize: 10,
            fill: "var(--text-muted)",
            fontFamily: "Inter",
          }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatter}
        />
        <YAxis
          type="category"
          dataKey={nameKey}
          width={140}
          tick={{
            fontSize: 11,
            fill: "#5f7ea3",
            fontFamily: "Inter",
            textAnchor: "end",
          }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "transparent" }} // ✅ ADD THIS
          content={buildUnifiedTooltip({
            valueFormatter: (value) =>
              formatter ? formatter(value) : `${value}${unit}`,
          })}
        />
        <Bar
          dataKey={dataKey}
          fill="url(#hbarBlueGrad)"
          radius={[0, 4, 4, 0]}
          maxBarSize={18}
        >
          {/* <LabelList
            dataKey={dataKey}
            position="right"
            style={{
              fontSize: 9,
              fill: "var(--text-muted)",
              fontFamily: "Inter",
            }}
            formatter={(v) => (formatter ? formatter(v) : `${v}${unit}`)}
          /> */}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Multi-series grouped bar */
export function GroupedBar({
  data,
  series,
  nameKey = "name",
  height = 280,
  formatter,
  unit = "",
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 40, right: 12, left: 10, bottom: 4 }}
      >
        <defs>
          {/* Blue gradient (Sanction) */}
          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(71, 136, 208, 1)" />
            <stop offset="100%" stopColor="rgba(144,202,249,0.22)" />
          </linearGradient>

          {/* Green gradient (Outstanding) */}
          <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(160, 227, 236, 1)" />
            <stop offset="100%" stopColor="rgba(178,223,219,0.25)" />
          </linearGradient>
        </defs>
        <CartesianGrid
          stroke="rgba(0,0,0,0.08)"
          horizontal={true}
          vertical={false}
        />
        <XAxis
          dataKey={nameKey}
          interval={0}
          tickLine={false}
          axisLine={false}
          height={50}
          tick={({ x, y, payload }) => {
            const words = payload.value.split(" ");

            return (
              <text
                x={x}
                y={y + 8}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize={10}
                fontFamily="Inter"
              >
                {words.slice(0, 2).map((word, i) => (
                  <tspan key={i} x={x} dy={i === 0 ? 0 : 12}>
                    {word}
                  </tspan>
                ))}
              </text>
            );
          }}
        />
        <YAxis
          tick={{
            fontSize: 10,
            fill: "var(--text-muted)",
            fontFamily: "Inter",
          }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => (v / 1e7).toFixed(0)}
          padding={{ top: 1 }}
          label={{
            value: "In ₹ Crs",
            angle: -90,
            position: "insideLeft",
            dx: -5,
            style: {
              fontSize: 10,
              fill: "var(--text-muted)",
            },
          }}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={buildUnifiedTooltip({
            valueFormatter: (value) =>
              formatter ? formatter(value) : `${value}${unit}`,
          })}
        />
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={s.gradient ? `url(#${s.gradient})` : s.color}
            radius={[3, 3, 0, 0]}
            maxBarSize={20}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

const formatDate = (value, viewMode) => {
  if (!value) return "";

  // 🟦 MONTHLY → Feb - 26
  if (viewMode === "monthly") {
    const date = new Date(value);

    if (!isNaN(date)) {
      const month = date.toLocaleString("en-IN", { month: "short" });
      const year = String(date.getFullYear()).slice(-2);
      return `${month} - ${year}`;
    }

    return value;
  }

  // 🟨 QUARTERLY → Q4 - 25
  if (viewMode === "quarterly") {
    const str = String(value);

    // Handles "2025 Q4" OR "Q4"
    const match = str.match(/(\d{4})?\s*(Q\d)/);

    if (match) {
      const year = match[1];
      const quarter = match[2];

      if (year) {
        return `${quarter} - ${year.slice(-2)}`;
      }

      return quarter;
    }

    return str;
  }

  // 🟩 YEARLY → 2026 (ONLY YEAR)
  if (viewMode === "yearly") {
    const str = String(value);

    // If value is like "2026 - 26" → extract only 2026
    const match = str.match(/\d{4}/);

    return match ? match[0] : str;
  }

  return value;
};

export function VerticalBarWithLineOverview({ data, height = 320, viewMode }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        margin={{ top: 22, right: 16, left: 8, bottom: 2 }}
        barCategoryGap="30%"
        barGap={2}
      >
        <defs>
          {/* Opening Balance */}
          <linearGradient id="openingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(21,101,192,0.90)" />
            <stop offset="100%" stopColor="rgba(144,202,249,0.24)" />
          </linearGradient>

          {/* Closing Balance */}
          <linearGradient id="closingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(144,202,249,0.72)" />
            <stop offset="100%" stopColor="rgba(144,202,249,0.10)" />
          </linearGradient>

          {/* Closing Balance Area Shade */}
          <linearGradient id="closingAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,172,193,0.30)" />
            <stop offset="100%" stopColor="rgba(0,172,193,0.05)" />
          </linearGradient>
        </defs>

        <CartesianGrid
          stroke="rgba(0,0,0,0.08)"
          horizontal={true}
          vertical={false}
        />

        {/* X Axis */}
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "#6a9cbf", fontFamily: "Inter" }}
          tickFormatter={(value) => formatDate(value, viewMode)}
        />

        {/* LEFT AXIS → Opening + Closing Balance */}
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 10, fill: "#6a9cbf" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => Math.round(v)}
          label={{
            value: "Opening / Closing Balance (₹ Cr)",
            angle: -90,
            dx: -9,
            dy: 35,
            position: "insideLeft",
            style: {
              fontSize: 9,
              fill: "#6a9cbf",
            },
          }}
        />

        {/* RIGHT AXIS → Avg EIR */}
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 10, fill: "#6a9cbf" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${Number(v).toFixed(1)}%`}
          label={{
            value: "Avg EIR Rate (%)",
            angle: 90,
            position: "insideRight",
            style: {
              fontSize: 9,
              fill: "#6a9cbf",
            },
          }}
        />

        {/* TOOLTIP */}
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={buildUnifiedTooltip({
            valueFormatter: (value, _name, entry) => {
              if (entry.dataKey === "eir") {
                return `${Number(value).toFixed(2)} %`;
              }

              return `₹${Number(value).toLocaleString("en-IN")} Cr`;
            },
          })}
        />

        {/* OPENING BALANCE BAR */}
        <Bar
          yAxisId="left"
          dataKey="opening"
          name="Opening Balance (₹ Cr)"
          fill="url(#openingGrad)"
          radius={[5, 5, 0, 0]}
          maxBarSize={32}
        />

        {/* CLOSING BALANCE BAR */}
        <Bar
          yAxisId="left"
          dataKey="closing"
          name="Closing Balance (₹ Cr)"
          fill="url(#closingGrad)"
          radius={[5, 5, 0, 0]}
          maxBarSize={32}
        />

        <Area
          yAxisId="left"
          type="monotone"
          dataKey="closing"
          fill="url(#closingAreaGrad)"
          stroke="none"
          tooltipType="none"
        />

        {/* AVG EIR LINE */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="eir"
          name="Avg EIR Rate (%)"
          stroke="#00acc1"
          strokeWidth={2.5}
          dot={{
            r: 4,
            stroke: "#fff",
            strokeWidth: 2,
            fill: "#00acc1",
          }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function VerticalBarWithLineTransactions({ data, height = 320 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        margin={{ top: 22, right: 16, left: 8, bottom: 2 }}
        barCategoryGap="30%"
        barGap={2}
      >
        <defs>
          <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(21,101,192,0.90)" />
            <stop offset="100%" stopColor="rgba(144,202,249,0.24)" />
          </linearGradient>

          <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(21,101,192,0.90)" />
            <stop offset="100%" stopColor="rgba(144,202,249,0.24)" />
          </linearGradient>

          <linearGradient id="sanctionAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,172,193,0.35)" />
            <stop offset="100%" stopColor="rgba(0,172,193,0.05)" />
          </linearGradient>
        </defs>

        <CartesianGrid
          stroke="rgba(0,0,0,0.08)"
          horizontal={true}
          vertical={false}
        />
        <XAxis
          dataKey="year"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "#6a9cbf", fontFamily: "Inter" }}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 10, fill: "#6a9cbf" }}
          axisLine={false}
          tickLine={false}
          label={{
            value: "No. of Loans",
            angle: -90,
            position: "insideLeft",
            style: { fontSize: 9, fill: "#6a9cbf" },
          }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 10, fill: "#00acc1" }}
          axisLine={false}
          tickLine={false}
          label={{
            value: "Sanction (Rs Bn)",
            angle: 90,
            position: "insideRight",
            style: { fontSize: 9, fill: "#00acc1" },
          }}
        />

        <Tooltip
          cursor={{ fill: "transparent" }}
          content={buildUnifiedTooltip({
            valueFormatter: (value, _name, entry) =>
              entry.dataKey === "loans" ? value : `Rs ${value} Bn`,
          })}
        />

        <Legend
          verticalAlign="top"
          align="center"
          iconType="rect"
          wrapperStyle={{
            fontSize: 10,
            color: "#6a9cbf",
            fontFamily: "Inter",
          }}
        />

        <Bar
          yAxisId="left"
          dataKey="loans"
          name="No. of Loans"
          fill="url(#loanGrad)"
          radius={[5, 5, 0, 0]}
          maxBarSize={32}
        />

        <Area
          yAxisId="right"
          type="monotone"
          dataKey="sanction"
          fill="url(#sanctionAreaGrad)"
          stroke="none"
        />

        <Line
          yAxisId="right"
          type="monotone"
          dataKey="sanction"
          name="Sanction (Rs Bn)"
          stroke="#00acc1"
          strokeWidth={2.5}
          tension={0.38}
          dot={{
            r: 4,
            stroke: "#fff",
            strokeWidth: 2,
            fill: "#00acc1",
          }}
          activeDot={{ r: 5 }}
          fill="rgba(0,172,193,0.07)"
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function VerticalBarWithLineCostAnalysis({
  data,
  height = 320,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        margin={{ top: 22, right: 16, left: 8, bottom: 2 }}
        barCategoryGap="30%"
        barGap={2}
      >
        <defs>
          {/* Accrual */}
          <linearGradient id="accrualGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(21,101,192,0.90)" />
            <stop offset="100%" stopColor="rgba(144,202,249,0.24)" />
          </linearGradient>

          {/* EIR Interest */}
          <linearGradient id="eirGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(144,202,249,0.72)" />
            <stop offset="100%" stopColor="rgba(144,202,249,0.10)" />
          </linearGradient>

          {/* Closing Balance Area */}
          <linearGradient id="costClosingAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,172,193,0.30)" />
            <stop offset="100%" stopColor="rgba(0,172,193,0.05)" />
          </linearGradient>
        </defs>

        <CartesianGrid
          stroke="rgba(0,0,0,0.08)"
          horizontal={true}
          vertical={false}
        />

        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 10,
            fill: "#6a9cbf",
            fontFamily: "Inter",
          }}
        />

        {/* LEFT → Accrual + EIR */}
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 10, fill: "#6a9cbf" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => Math.round(v / 10000000)}
          label={{
            value: "Accrual + EIR (₹ Cr)",
            angle: -90,
            dx: -9,
            dy: 35,
            position: "insideLeft",
            style: {
              fontSize: 9,
              fill: "#6a9cbf",
            },
          }}
        />

        {/* RIGHT → Closing Balance */}
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 10, fill: "#6a9cbf" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => Math.round(v / 10000000)}
          label={{
            value: "Closing Balance (₹ Cr)",
            angle: 90,
            position: "insideRight",
            style: {
              fontSize: 9,
              fill: "#6a9cbf",
            },
          }}
        />

        <Tooltip
          cursor={{ fill: "transparent" }}
          content={buildUnifiedTooltip({
            valueFormatter: (value) =>
              `₹${Math.round(Number(value) / 10000000).toLocaleString(
                "en-IN"
              )} Cr`,
          })}
        />

        {/* Accrual Bar */}
        <Bar
          yAxisId="left"
          dataKey="loan"
          name="Accrual Amount"
          fill="url(#accrualGrad)"
          radius={[5, 5, 0, 0]}
          maxBarSize={28}
        />

        {/* EIR Bar */}
        <Bar
          yAxisId="left"
          dataKey="sanction"
          name="EIR Interest"
          fill="url(#eirGrad)"
          radius={[5, 5, 0, 0]}
          maxBarSize={28}
        />

        {/* Closing Balance Area */}
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="outstanding"
          fill="url(#costClosingAreaGrad)"
          stroke="none"
          tooltipType="none"
        />

        {/* Closing Balance Line */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="outstanding"
          name="Closing Balance"
          stroke="#00acc1"
          strokeWidth={2.5}
          dot={{
            r: 4,
            stroke: "#fff",
            strokeWidth: 2,
            fill: "#00acc1",
          }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Backward-compatible alias.
export function VerticalBarWithLine(props) {
  return <VerticalBarWithLineOverview {...props} />;
}
