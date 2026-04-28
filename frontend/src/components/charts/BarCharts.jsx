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
  LineChart,
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
          cursor={{ fill: "transparent" }}
          content={buildUnifiedTooltip({
            valueFormatter: (value) =>
              formatter
                ? formatter(value)
                : `₹${Math.round(Number(value || 0) / 10000000).toLocaleString(
                    "en-IN",
                  )} Cr`,
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
          tickFormatter={(v) => `${Number(v).toFixed(2)}%`}
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
          tickFormatter={(v) =>
            Math.round(v / 10000000).toLocaleString("en-IN")
          }
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

              return fmt.cr(value);
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
          yAxisId="right"
          type="monotone"
          dataKey="eir"
          fill="url(#closingAreaGrad)"
          stroke="none"
          tooltipType="none"
          fillOpacity={1}
          isAnimationActive={false}
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

export function VerticalBarWithLineCostAnalysis({ data, height = 320 }) {
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
                "en-IN",
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

export function StackedBarWithLine({ data, height = 360 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
        barCategoryGap="25%"
      >
        <CartesianGrid
          stroke="rgba(0,0,0,0.08)"
          vertical={true}
          horizontal={true}
        />

        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{
            fontSize: 10,
            fill: "#6a9cbf",
            fontFamily: "Inter",
          }}
        />

        {/* LEFT AXIS */}
        <YAxis
          yAxisId="left"
          tickLine={false}
          axisLine={false}
          tick={{
            fontSize: 10,
            fill: "#6a9cbf",
          }}
          tickFormatter={(v) => Math.round(v / 10000000)}
          label={{
            value: "Closing ₹ Cr",
            angle: -90,
            position: "insideLeft",
            style: {
              fontSize: 9,
              fill: "#6a9cbf",
            },
          }}
        />

        {/* RIGHT AXIS */}
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          axisLine={false}
          tick={{
            fontSize: 10,
            fill: "#f57c00",
          }}
          tickFormatter={(v) => `${v.toFixed(2)}%`}
        />

        <Tooltip
          cursor={{ fill: "transparent" }}
          content={buildUnifiedTooltip({
            valueFormatter: (value, name) => {
              if (name === "Avg EIR %") {
                return `${Number(value).toFixed(2)}%`;
              }
              return fmt.cr(value);
            },
          })}
        />

        {/* STACKED BARS */}

        <Bar
          yAxisId="left"
          dataKey="matured"
          stackId="a"
          fill="#90caf9"
          name="Matured"
        />

        <Bar
          yAxisId="left"
          dataKey="lt1"
          stackId="a"
          fill="#1565c0"
          name="< 1 Year"
        />

        <Bar
          yAxisId="left"
          dataKey="y1to3"
          stackId="a"
          fill="#1e88e5"
          name="1 - 3 Years"
        />

        <Bar
          yAxisId="left"
          dataKey="y3to5"
          stackId="a"
          fill="#42a5f5"
          name="3 - 5 Years"
        />

        <Bar
          yAxisId="left"
          dataKey="gt5"
          stackId="a"
          fill="#0288d1"
          name="> 5 Years"
        />

        {/* LINE */}

        <Line
          yAxisId="right"
          type="monotone"
          dataKey="eir"
          name="Avg EIR %"
          stroke="#f57c00"
          strokeWidth={2.5}
          dot={{
            r: 4,
            stroke: "#f57c00",
            strokeWidth: 2,
            fill: "#fff",
          }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function StackedBarOnly({ data, height = 360 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
        barCategoryGap="25%"
      >
        <CartesianGrid
          stroke="rgba(0,0,0,0.08)"
          vertical={true}
          horizontal={true}
        />

        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{
            fontSize: 10,
            fill: "#6a9cbf",
            fontFamily: "Inter",
          }}
        />

        {/* LEFT AXIS */}
        <YAxis
          yAxisId="left"
          tickLine={false}
          axisLine={false}
          tick={{
            fontSize: 10,
            fill: "#6a9cbf",
          }}
          tickFormatter={(v) => Math.round(v / 10000000)}
          label={{
            value: "Closing ₹ Cr",
            angle: -90,
            position: "insideLeft",
            style: {
              fontSize: 9,
              fill: "#6a9cbf",
            },
          }}
        />

        <Tooltip
          cursor={{ fill: "transparent" }}
          content={buildUnifiedTooltip({
            valueFormatter: (value, name) => {
              if (name === "Avg EIR %") {
                return `${Number(value).toFixed(2)}%`;
              }
              return fmt.cr(value);
            },
          })}
        />

        {/* STACKED BARS */}

        <Bar
          yAxisId="left"
          dataKey="matured"
          stackId="a"
          fill="#90caf9"
          name="Matured"
        />

        <Bar
          yAxisId="left"
          dataKey="lt1"
          stackId="a"
          fill="#1565c0"
          name="< 1 Year"
        />

        <Bar
          yAxisId="left"
          dataKey="y1to3"
          stackId="a"
          fill="#1e88e5"
          name="1 - 3 Years"
        />

        <Bar
          yAxisId="left"
          dataKey="y3to5"
          stackId="a"
          fill="#42a5f5"
          name="3 - 5 Years"
        />

        <Bar
          yAxisId="left"
          dataKey="gt5"
          stackId="a"
          fill="#0288d1"
          name="> 5 Years"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function AdditionVsRedemptionChart({ data, height = 320 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 10, left: 10, bottom: 10 }}
        barCategoryGap="30%"
      >
        <CartesianGrid
          stroke="rgba(0,0,0,0.08)"
          vertical={true}
          horizontal={true}
        />

        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 10,
            fill: "#6a9cbf",
          }}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 10,
            fill: "#6a9cbf",
          }}
          tickFormatter={(v) => Math.round(Math.abs(v) / 10000000)}
        />

        <Tooltip
          cursor={{ fill: "transparent" }}
          content={buildUnifiedTooltip({
            valueFormatter: (value, name) => {
              return fmt.cr(Math.abs(Number(value || 0)));
            },
          })}
        />

        <Bar
          dataKey="addition"
          name="Addition"
          fill="rgba(111, 164, 221, 0.9)"
          radius={[4, 4, 0, 0]}
        />

        <Bar
          dataKey="redemption"
          name="Redemption"
          fill="rgba(255, 205, 210, 0.8)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* =========================================================
   RateTrendMixedChart
   FIXED + FLOATING BAR
   AVG EIR + EXIT RATE LINE
========================================================= */

export function RateTrendMixedChart({ data = [], height = 360 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 10,
          bottom: 10,
        }}
        barCategoryGap="28%"
      >
        <defs>
          {/* SAME COLORS AS VerticalBarWithLineOverview */}

          <linearGradient id="rateFixedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(21,101,192,0.90)" />
            <stop offset="100%" stopColor="rgba(144,202,249,0.24)" />
          </linearGradient>

          <linearGradient id="rateFloatingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(144,202,249,0.72)" />
            <stop offset="100%" stopColor="rgba(144,202,249,0.10)" />
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

        {/* LEFT AXIS */}
        <YAxis
          yAxisId="left"
          tick={{
            fontSize: 10,
            fill: "#6a9cbf",
          }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            Math.round(v / 10000000).toLocaleString("en-IN")
          }
          label={{
            value: "Fixed / Floating Balance (₹ Cr)",
            angle: -90,
            position: "insideLeft",
            style: {
              fontSize: 9,
              fill: "#6a9cbf",
            },
          }}
        />

        {/* RIGHT AXIS */}
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{
            fontSize: 10,
            fill: "#6a9cbf",
          }}
          axisLine={false}
          tickLine={false}
          domain={[0, 10]}
          tickFormatter={(v) => `${Number(v).toFixed(2)}%`}
          label={{
            value: "EIR / Exit Rate (%)",
            angle: 90,
            position: "insideRight",
            style: {
              fontSize: 9,
              fill: "#6a9cbf",
            },
          }}
        />

        {/* SAME TOOLTIP AS OVERVIEW */}
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={buildUnifiedTooltip({
            valueFormatter: (value, _name, entry) => {
              if (entry.dataKey === "avgEir" || entry.dataKey === "exitRate") {
                return `${Number(value).toFixed(2)} %`;
              }

              return `₹${Math.round(Number(value) / 10000000).toLocaleString(
                "en-IN",
              )} Cr`;
            },
          })}
        />

        {/* FIXED BALANCE */}
        <Bar
          yAxisId="left"
          dataKey="fixedBalance"
          fill="url(#rateFixedGrad)"
          radius={[5, 5, 0, 0]}
          maxBarSize={26}
        />

        {/* FLOATING BALANCE */}
        <Bar
          yAxisId="left"
          dataKey="floatingBalance"
          fill="url(#rateFloatingGrad)"
          radius={[5, 5, 0, 0]}
          maxBarSize={26}
        />

        {/* AVG EIR */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="avgEir"
          name="Avg EIR %"
          stroke="#F57C00"
          strokeWidth={2.5}
          dot={{
            r: 4,
            stroke: "#fff",
            strokeWidth: 2,
            fill: "#F57C00",
          }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />

        {/* EXIT RATE */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="exitRate"
          name="Exit Rate %"
          stroke="#1565C0"
          strokeDasharray="5 5"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/* =========================================================
   EirMonthlyMovementChart
   PURE LINE CHART
========================================================= */

export function EirMonthlyMovementChart({ data = [], height = 320 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{
          top: 20,
          right: 20,
          left: 10,
          bottom: 10,
        }}
      >
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

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 10,
            fill: "#6a9cbf",
          }}
          domain={["auto", "auto"]}
          tickFormatter={(v) => `${Number(v).toFixed(2)}%`}
          label={{
            value: "Avg EIR Rate (%)",
            angle: -90,
            position: "insideLeft",
            style: {
              fontSize: 9,
              fill: "#6a9cbf",
            },
          }}
        />

        {/* SAME TOOLTIP AS OVERVIEW */}
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={buildUnifiedTooltip({
            valueFormatter: (value) => `${Number(value).toFixed(2)} %`,
          })}
        />

        <Line
          type="monotone"
          dataKey="value"
          name="Avg EIR %"
          stroke="#00acc1"
          strokeWidth={2.5}
          dot={{
            r: 4,
            stroke: "#fff",
            strokeWidth: 2,
            fill: "#00acc1",
          }}
          activeDot={{
            r: 5,
            fill: "#005ac1",
          }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* =========================================================
   Closing Balance by Maturity Bucket — Monthly Trend
   STACKED BAR + AVG EIR LINE
========================================================= */

export function MaturityClosingTrendChart({ data = [], height = 360 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 10,
          bottom: 10,
        }}
        barCategoryGap="24%"
      >
        <CartesianGrid
          stroke="rgba(0,0,0,0.08)"
          horizontal={true}
          vertical={true}
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

        {/* LEFT AXIS → Closing Balance */}
        <YAxis
          yAxisId="left"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 10,
            fill: "#6a9cbf",
          }}
          tickFormatter={(v) =>
            Math.round(v / 10000000).toLocaleString("en-IN")
          }
          label={{
            value: "Closing ₹ Cr",
            angle: -90,
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
          axisLine={false}
          tickLine={false}
          domain={[0, 9]}
          tick={{
            fontSize: 10,
            fill: "#F57C00",
          }}
          tickFormatter={(v) => `${Number(v).toFixed(2)}%`}
        />

        <Tooltip
          cursor={{ fill: "transparent" }}
          content={buildUnifiedTooltip({
            valueFormatter: (value, _name, entry) => {
              if (entry?.dataKey === "avgEir") {
                return `${Number(value).toFixed(2)} %`;
              }

              return `₹${Math.round(Number(value) / 10000000).toLocaleString(
                "en-IN",
              )} Cr`;
            },
          })}
        />

        {/* STACKED BARS */}

        <Bar
          yAxisId="left"
          dataKey="matured"
          stackId="a"
          name="Matured"
          fill="#90caf9"
          radius={[0, 0, 0, 0]}
        />

        <Bar
          yAxisId="left"
          dataKey="lt1"
          stackId="a"
          name="< 1 Year"
          fill="#1565C0"
        />

        <Bar
          yAxisId="left"
          dataKey="y1to3"
          stackId="a"
          name="1 - 3 Years"
          fill="#1E88E5"
        />

        <Bar
          yAxisId="left"
          dataKey="y3to5"
          stackId="a"
          name="3 - 5 Years"
          fill="#42A5F5"
        />

        <Bar
          yAxisId="left"
          dataKey="gt5"
          stackId="a"
          name="> 5 Years"
          fill="#0288D1"
          radius={[4, 4, 0, 0]}
        />

        {/* AVG EIR LINE */}

        <Line
          yAxisId="right"
          type="monotone"
          dataKey="avgEir"
          name="Avg EIR %"
          stroke="#F57C00"
          strokeWidth={2.5}
          dot={{
            r: 4,
            stroke: "#F57C00",
            strokeWidth: 2,
            fill: "#fff",
          }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
export default function MaturityProductTypeStackedBar({
  data = [],
  height = 520,
  formatter,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 20,
          left: 10,
          bottom: 80,
        }}
        barCategoryGap="24%" // SAME as MaturityClosingTrendChart
      >
        <CartesianGrid
          stroke="rgba(0,0,0,0.08)"
          horizontal={true}
          vertical={true} // SAME as reference chart
        />

        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-35}
          textAnchor="end"
          height={80}
          tick={{
            fontSize: 10,
            fill: "#6a9cbf",
            fontFamily: "Inter",
          }}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 10,
            fill: "#6a9cbf",
          }}
          tickFormatter={(v) =>
            Math.round(v / 10000000).toLocaleString("en-IN")
          }
          label={{
            value: "₹ Cr",
            angle: -90,
            position: "insideLeft",
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
              formatter
                ? formatter(value)
                : `₹${Math.round(Number(value || 0) / 10000000).toLocaleString(
                    "en-IN",
                  )} Cr`,
          })}
        />

        {/* SAME COLORS AS MaturityClosingTrendChart */}

        <Bar
          dataKey="matured"
          stackId="a"
          name="Matured"
          fill="#90caf9"
          radius={[0, 0, 0, 0]}
          maxBarSize={50}
        />

        <Bar
          dataKey="lt1"
          stackId="a"
          name="< 1 Year"
          fill="#1565C0"
          maxBarSize={50}
        />

        <Bar
          dataKey="y1to3"
          stackId="a"
          name="1 - 3 Years"
          fill="#1E88E5"
          maxBarSize={50}
        />

        <Bar
          dataKey="y3to5"
          stackId="a"
          name="3 - 5 Years"
          fill="#42A5F5"
          maxBarSize={50}
        />

        <Bar
          dataKey="gt5"
          stackId="a"
          name="> 5 Years"
          fill="#0288D1"
          radius={[4, 4, 0, 0]}
          maxBarSize={50}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RateTypeMaturityStackedBar({
  data = [],
  height = 420,
  formatter,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 20,
          left: 10,
          bottom: 10,
        }}
        barCategoryGap="24%"
      >
        {/* GRADIENTS SAME AS REFERENCE */}
        <defs>
          {/* Fixed = Dark Blue */}
          <linearGradient id="rateTypeFixedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(21,101,192,0.90)" />
            <stop offset="100%" stopColor="rgba(145, 197, 240, 0.24)" />
          </linearGradient>

          {/* Floating = Light Blue */}
          <linearGradient id="rateTypeFloatingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(144,202,249,0.72)" />
            <stop offset="100%" stopColor="rgba(46, 146, 228, 0.1)" />
          </linearGradient>
        </defs>

        <CartesianGrid
          stroke="rgba(0,0,0,0.08)"
          horizontal={true}
          vertical={true}
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

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 10,
            fill: "#6a9cbf",
          }}
          tickFormatter={(v) =>
            Math.round(v / 10000000).toLocaleString("en-IN")
          }
        />

        <Tooltip
          cursor={{ fill: "transparent" }}
          content={buildUnifiedTooltip({
            valueFormatter: (value) =>
              `₹${Math.round(Number(value || 0) / 10000000).toLocaleString(
                "en-IN",
              )} Cr`,
          })}
        />

        {/* FIXED */}
        <Bar
          dataKey="fixed"
          name="Fixed"
          stackId="a"
          fill="url(#rateTypeFixedGrad)"
          radius={[0, 0, 0, 0]}
          maxBarSize={48}
        />

        {/* FLOATING */}
        <Bar
          dataKey="floating"
          name="Floating"
          stackId="a"
          fill="url(#rateTypeFloatingGrad)"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PortfolioProductTrendChart({
  data = [],
  selectedField = "opening",
  height = 420,
}) {
  const fieldMap = {
    opening: {
      debentures: "debenturesOpening",
      commercialPaper: "commercialPaperOpening",
      others: "othersOpening",
      loans: "loansOpening",
    },

    closing: {
      debentures: "debenturesClosing",
      commercialPaper: "commercialPaperClosing",
      others: "othersClosing",
      loans: "loansClosing",
    },

    redemption: {
      debentures: "debenturesRedemption",
      commercialPaper: "commercialPaperRedemption",
      others: "othersRedemption",
      loans: "loansRedemption",
    },

    addition: {
      debentures: "debenturesAddition",
      commercialPaper: "commercialPaperAddition",
      others: "othersAddition",
      loans: "loansAddition",
    },

    avg_eir: {
      debentures: "debenturesEir",
      commercialPaper: "commercialPaperEir",
      others: "othersEir",
      loans: "loansEir",
    },
  };

  const isOnlyLine = selectedField === "avg_eir";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20,
        }}
        barCategoryGap="22%"
      >
        <CartesianGrid stroke="rgba(0,0,0,0.08)" vertical horizontal />

        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 11,
            fill: "#5f7ea3",
            fontFamily: "Inter",
          }}
        />

        <YAxis
          yAxisId="left"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 11,
            fill: "#5f7ea3",
            fontFamily: "Inter",
          }}
          tickFormatter={(v) => {
            if (isOnlyLine) {
              return `${Number(v || 0).toFixed(2)}%`;
            }

            // convert to Cr for readable Y-axis
            return Math.round(Number(v || 0) / 10000000).toLocaleString(
              "en-IN",
            );
          }}
          label={{
            value: "Amount (₹ Cr)",
            angle: -90,
            position: "insideLeft",
            dx: -18,
            style: {
              fontSize: 11,
              fill: "#5f7ea3",
              fontFamily: "Inter",
              fontWeight: 500,
            },
          }}
        />

        <YAxis
          yAxisId="right"
          orientation="right"
          axisLine={false}
          tickLine={false}
          domain={[0, 10]}
          tickFormatter={(v) => `${Number(v || 0).toFixed(1)}%`}
          tick={{
            fontSize: 11,
            fill: "#E27D00",
            fontFamily: "Inter",
          }}
          label={{
            value: "Avg EIR %",
            angle: 90,
            position: "insideRight",
            style: {
              fontSize: 10,
              fill: "#E27D00",
            },
          }}
        />

        <Tooltip
          cursor={{ fill: "transparent" }}
          content={buildUnifiedTooltip({
            valueFormatter: (value, name) => {
              // specifically for Avg EIR line
              if (String(name).includes("EIR")) {
                return `${Number(value || 0).toFixed(2)}%`;
              }

              // amount values → convert to Cr
              const valueInCr = Number(value || 0) / 10000000;

              return `₹${Math.round(valueInCr).toLocaleString("en-IN")} Cr`;
            },
          })}
        />

        <Legend
          verticalAlign="top"
          align="left"
          iconType="circle"
          iconSize={10}
          wrapperStyle={{
            paddingBottom: 20,
            marginTop: -20,
            fontFamily: "Inter",
            fontSize: 13,
          }}
          formatter={(value) => (
            <span
              style={{
                color: "#1F2937", // dark readable text
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {value}
            </span>
          )}
        />

        {/* BARS → only when not avg_eir */}
        {!isOnlyLine && (
          <>
            <Bar
              yAxisId="left"
              dataKey={fieldMap[selectedField].debentures}
              name="Debentures"
              fill="#77A9E0"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />

            <Bar
              yAxisId="left"
              dataKey={fieldMap[selectedField].commercialPaper}
              name="Commercial Paper"
              fill="#D6F2F6"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />

            <Bar
              yAxisId="left"
              dataKey={fieldMap[selectedField].others}
              name="Others"
              fill="#E2CCEB"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />

            <Bar
              yAxisId="left"
              dataKey={fieldMap[selectedField].loans}
              name="Loans"
              fill="#FCEEDC"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </>
        )}

        {/* LINE GRAPH */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="debenturesEir"
          name="Avg EIR %"
          stroke="#E27D00"
          strokeWidth={2.5}
          dot={{
            r: 4,
            strokeWidth: 2,
            fill: "#ffffff",
          }}
          activeDot={{
            r: 5,
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Backward-compatible alias.
export function VerticalBarWithLine(props) {
  return <VerticalBarWithLineOverview {...props} />;
}
