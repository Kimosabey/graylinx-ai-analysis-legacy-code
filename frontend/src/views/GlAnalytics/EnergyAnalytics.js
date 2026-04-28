import React, { useState, useEffect, useRef } from "react";
import { X, Download, ChevronDown } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { CalendarSelector } from "./DayWeekMonthPicker";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api from "../../api";
 
// ─── Shared helpers ────────────────────────────────────────────────────────────
const PRIMARY = "#2E59E3";
const PRIMARY_LIGHT = "#9cb5ff";
const GRID = "#e5e7eb";
const LABEL = "#6b7280";
function replaceEmWithCp(deviceName) {
  if (!deviceName) return deviceName;
 
  return deviceName.includes("em")
    ? deviceName.replace("em", "cp")
    : deviceName;
}
const formatToKilo = (v) =>
  Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v).toString();
 
const formatDeviceName = (name) =>
  name
    ? name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
    : "";
 
// ─── Shared card wrapper ───────────────────────────────────────────────────────
const Card = ({ title, onClick, cardRef, children }) => (
  <div
    ref={cardRef}
    onClick={onClick}
    style={{
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      cursor: onClick ? "pointer" : "default",
      transition: "box-shadow 0.2s ease",
      minHeight: 0,
      overflow: "hidden",
      position: "relative",
      boxSizing: "border-box",
    }}
    onMouseEnter={(e) =>
      onClick && (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)")
    }
  >
    <h3
      style={{
        margin: 0,
        marginBottom: 8,
        fontSize: 14,
        fontWeight: 600,
        color: "#374151",
        flexShrink: 0,
      }}
    >
      {title}
    </h3>
    <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>{children}</div>
  </div>
);
 
// ─── Empty / Loading states ────────────────────────────────────────────────────
const EmptyState = ({ message = "No data available", sub }) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#9ca3af",
      fontSize: 13,
      gap: 6,
    }}
  >
    <div>{message}</div>
    {sub && <div style={{ fontSize: 11 }}>{sub}</div>}
  </div>
);
 
// ─── Custom Recharts Tooltips ──────────────────────────────────────────────────
const KwhTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.88)",
        color: "#fff",
        padding: "7px 11px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 500,
        pointerEvents: "none",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ color: "#93c5fd" }}>
        {Number(payload[0].value).toFixed(2)} kWh
      </div>
    </div>
  );
};
 
const BarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
 
  const valuePayload = payload.find((p) => p.dataKey === "value");
  if (!valuePayload) return null;
 
  const { name, value } = valuePayload.payload;
 
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.88)",
        color: "#fff",
        padding: "7px 11px",
        borderRadius: 6,
        fontSize: 11,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{name}</div>
      <div style={{ color: "#93c5fd" }}>
        {Number(value).toFixed(2)} kWh
      </div>
    </div>
  );
};
 
 
 
const HealthTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.88)",
        color: "#fff",
        padding: "7px 11px",
        borderRadius: 6,
        fontSize: 11,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ color: "#93c5fd" }}>
        Health: {Number(payload[0].value).toFixed(1)}%
      </div>
    </div>
  );
};
 
// ─── 1. Area Chart ─────────────────────────────────────────────────────────────
const EnergyAreaChart = ({ data, title, onChartClick, loading, debugInfo, labels, dateMode, selectedDate }) => {
  const cardRef = useRef(null);
 
  // Show "h" suffix only for a single-day view
  const isHourly =
    dateMode === "day" ||
    (dateMode === "custom" &&
      Array.isArray(selectedDate) &&
      selectedDate[0] === selectedDate[1]);
 
  if (loading) {
    return (
      <Card title={title} cardRef={cardRef}>
        <EmptyState message="Loading..." sub={debugInfo} />
      </Card>
    );
  }
 
  // Keep data+labels as pairs so filtering never desyncs them
  const rawData = data || [];
  const rawLabels = labels && labels.length === rawData.length ? labels : rawData.map((_, i) => i + 1);
  const pairs = rawData
    .map((v, i) => ({ v, lbl: rawLabels[i] }))
    .filter(({ v }) => typeof v === "number" && !isNaN(v) && v >= 0);
 
  if (!pairs.length) {
    return (
      <Card title={title} cardRef={cardRef}>
        <EmptyState
          message="Data is unavailable."
          sub="Please select a date from the calendar."
        />
      </Card>
    );
  }
 
  const chartData = pairs.map(({ v, lbl }) => ({ x: lbl, y: v }));
  const chartLabels = pairs.map(({ lbl }) => lbl);
 
  // Build explicit tick list so first AND last labels always show
  const buildTicks = (lbls, maxTicks = 10) => {
    if (lbls.length <= maxTicks) return lbls;
    const result = [];
    const step = Math.floor((lbls.length - 1) / (maxTicks - 1));
    for (let i = 0; i < lbls.length - 1; i += step) result.push(lbls[i]);
    result.push(lbls[lbls.length - 1]); // always include last
    return [...new Set(result)];
  };
  const xTicks = buildTicks(chartLabels);
 
  return (
    <Card
      title={title}
      cardRef={cardRef}
      onClick={() => onChartClick(title, cardRef, pairs.map(p => p.v), "area", chartLabels)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 24, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.3} />
              <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="x"
            tick={{ fontSize: 8, fill: LABEL }}
            tickLine={false}
            axisLine={{ stroke: LABEL }}
            ticks={xTicks}
            interval={0}
            tickFormatter={(val) => {
              const n = Number(val);
              if (!isNaN(n)) return isHourly ? `${n}h` : String(n);
              // Non-numeric label (day name): week mode → 3-char abbrev, else sequential index
              if (dateMode === "week") return String(val).substring(0, 3);
              const idx = xTicks.indexOf(val);
              return idx >= 0 ? String(idx + 1) : String(val).substring(0, 3);
            }}
          />
          <YAxis
            tick={{ fontSize: 8, fill: LABEL }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatToKilo}
            width={42}
          />
          <Tooltip content={<KwhTooltip />} />
          <Area
            type="linear"
            dataKey="y"
            stroke={PRIMARY}
            strokeWidth={2}
            fill="url(#areaGrad)"
            dot={{ r: 3.5, fill: PRIMARY, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
 
// ─── 2. Waterfall Bar Chart ────────────────────────────────────────────────────
const EnergyBarChart = ({ data, title, onChartClick }) => {
  console.log("EnergyBarChart data:", data);
 
  const cardRef = useRef(null);
 
  if (!data || !Array.isArray(data) || !data.length) {
    return (
      <Card title={title} cardRef={cardRef}>
        <EmptyState />
      </Card>
    );
  }
 
  // Ensure numeric and calculate total safely
  const processed = data.map((item) => ({
    name: formatDeviceName(replaceEmWithCp(item.device_name)),
    value: Number(item.energy_kwh) || 0,
  }));
 
  const totalValue = processed.reduce((sum, item) => sum + item.value, 0);
 
  let running = 0;
  const chartData = processed.map((item) => {
    const entry = {
      name: item.name,
      offset: running,
      value: item.value,
      isTotal: false,
    };
    running += item.value;
    return entry;
  });
 
  chartData.push({
    name: "Total",
    offset: 0,
    value: totalValue,
    isTotal: true,
  });
 
 
  const ValueLabel = (props) => {
    const { x, y, width, index } = props;
 
    const actualValue = chartData[index]?.value;
 
    if (!actualValue) return null;
 
    return (
      <text
        x={x + width / 2}
        y={y - 6}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        fill="#374151"
      >
        {actualValue.toFixed(2)}
      </text>
    );
  };
 
 
 
  return (
    <Card
      title={title}
      cardRef={cardRef}
      onClick={() => onChartClick(title, cardRef, data, "bar")}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 8, left: 4, bottom: 20 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, fill: LABEL }}
            tickLine={false}
            axisLine={{ stroke: LABEL }}
            interval={0}
            height={36}
          />
          <YAxis
            tick={{ fontSize: 8, fill: LABEL }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatToKilo}
            width={48}
          />
          <Tooltip content={<BarTooltip />} />
          {/* Invisible spacer bar for waterfall effect */}
          <Bar dataKey="offset" stackId="wf" fill="transparent" />
          {/* Visible value bar */}
          <Bar dataKey="value" stackId="wf" radius={[4, 4, 0, 0]}>
            <LabelList content={<ValueLabel />} />
            {chartData.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.isTotal ? PRIMARY : PRIMARY_LIGHT}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
 
// ─── 3. Heatmap (CSS grid — Recharts has no native heatmap) ───────────────────
const HeatmapChart = ({ data, title, onChartClick, dateMode, selectedDate }) => {
  const cardRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState({
    visible: false, x: 0, y: 0, device: "", hour: "", value: 0,
  });
 
  const isEmpty = !data || !Array.isArray(data) || !data.length;
  if (isEmpty) {
    return (
      <Card title={title} cardRef={cardRef}>
        <EmptyState />
      </Card>
    );
  }
 
  // Seed colour: #2E59E3 (rgb 46,89,227) — pale tint at t=0, full at t=1
  const SR = 46, SG = 89, SB = 227, TINT = 0.88;
  const LR = Math.round(SR + (255 - SR) * TINT);
  const LG = Math.round(SG + (255 - SG) * TINT);
  const LB = Math.round(SB + (255 - SB) * TINT);
  const stops = [0, 0.25, 0.5, 0.75, 1].map((s) => ({
    t: s,
    r: Math.round(LR + (SR - LR) * s),
    g: Math.round(LG + (SG - LG) * s),
    b: Math.round(LB + (SB - LB) * s),
  }));
 
  // Per-row (per-device) min/max so each equipment is coloured relative to itself
  const rowRanges = data.map((device) => {
    const vals = device.data.map((h) => h.energy_kwh);
    const minV = Math.min(...vals);
    const maxV = Math.max(...vals);
    return { minV, maxV, range: maxV - minV || 1 };
  });
 
  const cellColor = (v, rowIndex) => {
    const { minV, range } = rowRanges[rowIndex];
    const t = Math.max(0, Math.min(1, (v - minV) / range));
    let lo = stops[0], hi = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i++) {
      if (t >= stops[i].t && t <= stops[i + 1].t) { lo = stops[i]; hi = stops[i + 1]; break; }
    }
    const f = lo.t === hi.t ? 0 : (t - lo.t) / (hi.t - lo.t);
    return `rgb(${Math.round(lo.r + (hi.r - lo.r) * f)},${Math.round(lo.g + (hi.g - lo.g) * f)},${Math.round(lo.b + (hi.b - lo.b) * f)})`;
  };
 
  const textColor = (v, rowIndex) => {
    const { minV, range } = rowRanges[rowIndex];
    return (v - minV) / range > 0.55 ? "#fff" : "#1e3a6e";
  };
 
  const hours = data[0]?.data?.map((h) => h.label ?? h.hour) ?? [];
 
  // Show "h" suffix only for a single-day view
  const isHourly =
    dateMode === "day" ||
    (dateMode === "custom" &&
      Array.isArray(selectedDate) &&
      selectedDate[0] === selectedDate[1]);
 
  const fmtHour = (hr) => {
    const n = Number(hr);
    if (!isNaN(n)) return isHourly ? `${n}h` : String(n);
    // Non-numeric label (day name): week mode → 3-char abbrev, else sequential index
    if (dateMode === "week") return String(hr).substring(0, 3);
    const idx = hours.indexOf(hr);
    return idx >= 0 ? String(idx + 1) : String(hr).substring(0, 3);
  };
  const showEvery = hours.length <= 12 ? 1 : 2;
 
  const X_AXIS_H = 18;
  const GAP = 2;
  const LABEL_W = 130;
 
  return (
    <Card
      title={title}
      cardRef={cardRef}
      onClick={() => onChartClick(title, cardRef, data, "heatmap")}
    >
      {/* Tooltip */}
      {tooltip.visible && (() => {
        const cardW = cardRef.current?.offsetWidth || 400;
        const tipW = 160;
        const lp = cardW - tooltip.x < tipW + 20 ? tooltip.x - tipW - 10 : tooltip.x + 14;
        return (
          <div style={{
            position: "absolute", left: lp, top: Math.max(8, tooltip.y - 52),
            background: "rgba(0,0,0,0.88)", color: "#fff",
            padding: "6px 10px", borderRadius: 6, fontSize: 11,
            fontWeight: 500, pointerEvents: "none", zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)", whiteSpace: "nowrap",
          }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{tooltip.device}</div>
            <div style={{ color: "#d1d5db", fontSize: 10, marginBottom: 2 }}>{tooltip.hour}</div>
            <div style={{ color: "#93c5fd" }}>{Number(tooltip.value).toFixed(2)} kWh</div>
          </div>
        );
      })()}
 
      {/* Full-height container — rows use flex:1 so they always fill the card */}
      <div ref={containerRef} style={{ width: "100%", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", gap: GAP }}>
 
        {/* Rows stretch to fill available height evenly */}
        {data.map((device, ri) => (
          <div key={ri} style={{ display: "flex", alignItems: "stretch", flex: 1, minHeight: 0 }}>
            <div style={{
              width: LABEL_W, flexShrink: 0, fontSize: 9, fontWeight: 700,
              color: "#374151", textAlign: "right", paddingRight: 8,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              display: "flex", alignItems: "center", justifyContent: "flex-end",
            }}>
              {formatDeviceName(replaceEmWithCp(device.device_name))}
            </div>
            <div style={{ display: "flex", gap: GAP, flex: 1, minWidth: 0 }}>
              {device.data.map((cell, ci) => (
                <div
                  key={ci}
                  style={{
                    flex: 1, minWidth: 0, minHeight: 0,
                    backgroundColor: cellColor(cell.energy_kwh, ri),
                    borderRadius: 2, cursor: "crosshair",
                  }}
                  onMouseMove={(e) => {
                    const rect = cardRef.current?.getBoundingClientRect();
                    if (rect) setTooltip({
                      visible: true,
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                      device: formatDeviceName(replaceEmWithCp(device.device_name)),
                      hour: fmtHour(cell.label ?? cell.hour),
                      value: cell.energy_kwh,
                    });
                  }}
                  onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
                />
              ))}
            </div>
          </div>
        ))}
 
        {/* X-axis hour labels */}
        <div style={{ display: "flex", height: X_AXIS_H, alignItems: "center", flexShrink: 0 }}>
          <div style={{ width: LABEL_W, flexShrink: 0 }} />
          <div style={{ display: "flex", gap: GAP, flex: 1, minWidth: 0 }}>
            {hours.map((hr, ci) => (
              <div key={ci} style={{
                flex: 1, minWidth: 0, textAlign: "center",
                fontSize: 8, color: LABEL, overflow: "hidden",
                visibility: (ci % showEvery === 0 || ci === hours.length - 1) ? "visible" : "hidden",
              }}>
                {fmtHour(hr)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
 
// ─── 4. Asset Health Horizontal Bar Chart ─────────────────────────────────────
const HorizontalBarChart = ({ data, title, onChartClick, loading }) => {
  const cardRef = useRef(null);
 
  const parseHealth = (item) => {
    const raw = item?.asset_health;
    if (raw !== null && raw !== undefined && raw !== "") {
      const n = parseFloat(String(raw).replace("%", "").trim());
      if (!isNaN(n)) return Math.max(0, Math.min(n, 100));
    }
    const run = Number(item?.run_hours) || 0;
    const fault = Number(item?.fault_hours) || 0;
    if (run <= 0) return 0;
    return Math.max(0, Math.min(((run - fault) / run) * 100, 100));
  };
 
  const getHealthDisplay = (item) => {
    const raw = item?.asset_health;
    if (raw !== null && raw !== undefined && raw !== "") {
      const n = parseFloat(String(raw).replace("%", "").trim());
      if (!isNaN(n)) return `${Math.max(0, Math.min(n, 100)).toFixed(1)}%`;
    }
    return `${parseHealth(item).toFixed(1)}%`;
  };
 
  const formatName = (item) => {
    if (item.name) return item.name.replace(/_/g, " ");
    if (item.ss_type)
      return item.ss_type
        .replace("NONGL_SS_", "")
        .replace(/_/g, " ")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    return "";
  };
 
  if (loading) {
    return (
      <Card title={title} cardRef={cardRef}>
        <EmptyState message="Loading..." />
      </Card>
    );
  }
 
  const isEmpty = !data || !Array.isArray(data) || !data.length;
  if (isEmpty) {
    return (
      <Card title={title} cardRef={cardRef}>
        <EmptyState message="No asset health data available" />
      </Card>
    );
  }
 
  // Build Recharts-ready data
  const chartData = data.map((item) => ({
    name: formatName(item),
    value: parseHealth(item),
    display: getHealthDisplay(item),
  }));
 
  // Custom label: show inside bar if wide enough, else just after
  const HealthLabel = (props) => {
    const { x, y, width, height, value, index } = props;
    const disp = chartData[index]?.display ?? `${value.toFixed(1)}%`;
    const inside = value > 15;
    return (
      <text
        x={inside ? x + width / 2 : x + width + 5}
        y={y + height / 2 + 4}
        textAnchor={inside ? "middle" : "start"}
        fontSize={9}
        fontWeight={700}
        fill={inside ? "#fff" : "#374151"}
      >
        {disp}
      </text>
    );
  };
 
  return (
    <Card
      title={title}
      cardRef={cardRef}
      onClick={() => onChartClick(title, cardRef, data, "horizontal-bar")}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 50, left: 4, bottom: 4 }}
          barCategoryGap="30%"
        >
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 9, fill: LABEL }}
            tickLine={false}
            axisLine={{ stroke: LABEL }}
            ticks={[0, 25, 50, 75, 100]}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={92}
            tick={{ fontSize: 9.5, fill: "#374151", fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<HealthTooltip />} />
          <Bar dataKey="value" fill={PRIMARY} radius={[0, 4, 4, 0]} background={{ fill: "#f3f4f6", radius: 4 }}>
            <LabelList content={<HealthLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
 
// ─── Download Modal ────────────────────────────────────────────────────────────
const ChartDownloadModal = ({ isOpen, onClose, chartTitle, chartRef, chartData, chartType, chartLabels, dateMode, selectedDate }) => {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const dropdownRef = useRef(null);
  const modalHeatmapRef = useRef(null);
  const [heatmapTooltip, setHeatmapTooltip] = useState({ visible: false, x: 0, y: 0, device: "", hour: "", value: 0 });
 
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDownloadOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
 
  if (!isOpen) return null;
 
  // Render a full-size preview of the chart inside the modal
  const renderModalChart = () => {
    // Show "h" suffix only for a single-day view
    const isHourly =
      dateMode === "day" ||
      (dateMode === "custom" &&
        Array.isArray(selectedDate) &&
        selectedDate[0] === selectedDate[1]);
 
    if (chartType === "area" && chartData?.length) {
      const labels = chartLabels ?? chartData.map((_, i) => i + 1);
      const mData = chartData.map((v, i) => ({ x: labels[i], y: v }));
      const ti = chartData.length <= 7 ? 0 : Math.ceil(chartData.length / 8) - 1;
      return (
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={mData} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="mgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.3} />
                <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis
              dataKey="x"
              tick={{ fontSize: 10, fill: LABEL }}
              tickLine={false}
              axisLine={{ stroke: LABEL }}
              interval={ti}
              tickFormatter={(val) => {
                const n = Number(val);
                if (!isNaN(n)) return isHourly ? `${n}h` : String(n);
                if (dateMode === "week") return String(val).substring(0, 3);
                const idx = labels.indexOf(val);
                return idx >= 0 ? String(idx + 1) : String(val).substring(0, 3);
              }}
            />
            <YAxis tick={{ fontSize: 10, fill: LABEL }} tickLine={false} axisLine={false} tickFormatter={formatToKilo} width={48} />
            <Tooltip content={<KwhTooltip />} />
            <Area type="linear" dataKey="y" stroke={PRIMARY} strokeWidth={2.5} fill="url(#mgGrad)" dot={{ r: 4, fill: PRIMARY, strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
 
    if (chartType === "bar" && chartData?.length) {
      let running = 0;
      const bars = chartData.map((item) => {
        const val = Number(item.energy_kwh) || 0;
        const entry = { name: formatDeviceName(replaceEmWithCp(item.device_name)), offset: running, value: val, isTotal: false };
        running += val;
        return entry;
      });
      bars.push({ name: "Total", offset: 0, value: running, isTotal: true });
      const VL = (props) => {
        const { x, y, width, index } = props;
        const actualValue = bars[index]?.value;
        if (!actualValue) return null;
        return <text x={x + width / 2} y={y - 5} textAnchor="middle" fontSize={11} fontWeight={700} fill="#374151">{actualValue.toFixed(2)}</text>;
      };
      return (
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={bars} margin={{ top: 28, right: 16, left: 0, bottom: 32 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: LABEL }} tickLine={false} axisLine={{ stroke: LABEL }} interval={0} height={42} />
            <YAxis tick={{ fontSize: 10, fill: LABEL }} tickLine={false} axisLine={false} tickFormatter={formatToKilo} width={52} />
            <Tooltip content={<BarTooltip />} />
            <Bar dataKey="offset" stackId="wf" fill="transparent" />
            <Bar dataKey="value" stackId="wf" radius={[4, 4, 0, 0]}>
              <LabelList content={<VL />} />
              {bars.map((b, i) => <Cell key={i} fill={b.isTotal ? PRIMARY : PRIMARY_LIGHT} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
 
    if (chartType === "heatmap" && chartData?.length) {
      // Per-row (per-device) colour scale — same as main HeatmapChart card
      const SR2 = 46, SG2 = 89, SB2 = 227, TINT2 = 0.88;
      const LR2 = Math.round(SR2 + (255 - SR2) * TINT2);
      const LG2 = Math.round(SG2 + (255 - SG2) * TINT2);
      const LB2 = Math.round(SB2 + (255 - SB2) * TINT2);
      const stops2 = [0, 0.25, 0.5, 0.75, 1].map((s) => ({ t: s, r: Math.round(LR2 + (SR2 - LR2) * s), g: Math.round(LG2 + (SG2 - LG2) * s), b: Math.round(LB2 + (SB2 - LB2) * s) }));
      const rowRanges2 = chartData.map((device) => {
        const vals = device.data.map((h) => h.energy_kwh);
        const minV = Math.min(...vals);
        const maxV = Math.max(...vals);
        return { minV, range: maxV - minV || 1 };
      });
      const cc = (v, ri) => {
        const { minV, range } = rowRanges2[ri];
        const t = Math.max(0, Math.min(1, (v - minV) / range));
        let lo = stops2[0], hi = stops2[stops2.length - 1];
        for (let i = 0; i < stops2.length - 1; i++) { if (t >= stops2[i].t && t <= stops2[i + 1].t) { lo = stops2[i]; hi = stops2[i + 1]; break; } }
        const f = lo.t === hi.t ? 0 : (t - lo.t) / (hi.t - lo.t);
        return `rgb(${Math.round(lo.r + (hi.r - lo.r) * f)},${Math.round(lo.g + (hi.g - lo.g) * f)},${Math.round(lo.b + (hi.b - lo.b) * f)})`;
      };
      const tc = (v, ri) => {
        const { minV, range } = rowRanges2[ri];
        return (v - minV) / range > 0.55 ? "#fff" : "#1e3a6e";
      };
      const hours2 = chartData[0]?.data?.map((h) => h.label ?? h.hour) ?? [];
      const isWk2 = typeof hours2[0] === "string" && hours2[0].length > 3;
      const isMonthly2 = dateMode === "month";
      const DS2 = { Sunday: "Sun", Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat" };
      const fh2 = (hr) => {
        const n = Number(hr);
        if (!isNaN(n)) return isHourly ? `${n}h` : String(n);
        // Non-numeric label: week mode → 3-char abbrev, else sequential index
        if (dateMode === "week") return String(hr).substring(0, 3);
        const idx = hours2.indexOf(hr);
        return idx >= 0 ? String(idx + 1) : String(hr).substring(0, 3);
      };
      const CH2 = 36, LW2 = 140, GAP2 = 2;
      const showEvery2 = hours2.length <= 12 ? 1 : 2;
      return (
        <div ref={modalHeatmapRef} style={{ position: "relative" }}>
          {heatmapTooltip.visible && (() => {
            const contW = modalHeatmapRef.current?.offsetWidth || 600;
            const tipW = 160;
            const lp = contW - heatmapTooltip.x < tipW + 20 ? heatmapTooltip.x - tipW - 10 : heatmapTooltip.x + 14;
            return (
              <div style={{
                position: "absolute", left: lp, top: Math.max(8, heatmapTooltip.y - 52),
                background: "rgba(0,0,0,0.88)", color: "#fff",
                padding: "6px 10px", borderRadius: 6, fontSize: 11,
                fontWeight: 500, pointerEvents: "none", zIndex: 1000,
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)", whiteSpace: "nowrap",
              }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{heatmapTooltip.device}</div>
                <div style={{ color: "#d1d5db", fontSize: 10, marginBottom: 2 }}>{heatmapTooltip.hour}</div>
                <div style={{ color: "#93c5fd" }}>{Number(heatmapTooltip.value).toFixed(2)} kWh</div>
              </div>
            );
          })()}
          <div style={{ width: "100%", overflow: "hidden" }}>
            {chartData.map((device, ri) => (
              <div key={ri} style={{ display: "flex", alignItems: "center", marginBottom: GAP2 }}>
                <div style={{ width: LW2, flexShrink: 0, fontSize: 10, fontWeight: 700, color: "#374151", textAlign: "right", paddingRight: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{formatDeviceName(replaceEmWithCp(device.device_name))}</div>
                <div style={{ display: "flex", gap: GAP2, flex: 1, minWidth: 0 }}>
                  {device.data.map((cell, ci) => (
                    <div
                      key={ci}
                      style={{ flex: 1, minWidth: 0, height: CH2, backgroundColor: cc(cell.energy_kwh, ri), borderRadius: 2, flexShrink: 1, cursor: "crosshair" }}
                      onMouseMove={(e) => {
                        const rect = modalHeatmapRef.current?.getBoundingClientRect();
                        if (rect) setHeatmapTooltip({
                          visible: true,
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                          device: formatDeviceName(replaceEmWithCp(device.device_name)),
                          hour: fh2(cell.label ?? cell.hour),
                          value: cell.energy_kwh,
                        });
                      }}
                      onMouseLeave={() => setHeatmapTooltip((t) => ({ ...t, visible: false }))}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div style={{ display: "flex", marginTop: 4 }}>
              <div style={{ width: LW2, flexShrink: 0 }} />
              <div style={{ display: "flex", gap: GAP2, flex: 1, minWidth: 0 }}>
                {hours2.map((hr, ci) => (
                  <div key={ci} style={{ flex: 1, minWidth: 0, textAlign: "center", fontSize: 9, color: LABEL, overflow: "hidden", visibility: (ci % showEvery2 === 0 || ci === hours2.length - 1) ? "visible" : "hidden" }}>{fh2(hr)}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
 
    if (chartType === "horizontal-bar" && chartData?.length) {
      const parseH2 = (item) => {
        const raw = item?.asset_health;
        if (raw !== null && raw !== undefined && raw !== "") { const n = parseFloat(String(raw).replace("%", "").trim()); if (!isNaN(n)) return Math.max(0, Math.min(n, 100)); }
        const run = Number(item?.run_hours) || 0; const fault = Number(item?.fault_hours) || 0; if (run <= 0) return 0; return Math.max(0, Math.min(((run - fault) / run) * 100, 100));
      };
      const getHD2 = (item) => { const raw = item?.asset_health; if (raw !== null && raw !== undefined && raw !== "") { const n = parseFloat(String(raw).replace("%", "").trim()); if (!isNaN(n)) return `${Math.max(0, Math.min(n, 100)).toFixed(1)}%`; } return `${parseH2(item).toFixed(1)}%`; };
      const fmtN2 = (item) => { if (item.name) return item.name.replace(/_/g, " "); if (item.ss_type) return item.ss_type.replace("NONGL_SS_", "").replace(/_/g, " ").split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" "); return ""; };
      const cData2 = chartData.map((item) => ({ name: fmtN2(item), value: parseH2(item), display: getHD2(item) }));
      const HL2 = (props) => { const { x, y, width, height, value, index } = props; const disp = cData2[index]?.display ?? `${value.toFixed(1)}%`; const inside = value > 15; return <text x={inside ? x + width / 2 : x + width + 5} y={y + height / 2 + 4} textAnchor={inside ? "middle" : "start"} fontSize={11} fontWeight={700} fill={inside ? "#fff" : "#374151"}>{disp}</text>; };
      return (
        <ResponsiveContainer width="100%" height={Math.max(200, cData2.length * 60)}>
          <BarChart data={cData2} layout="vertical" margin={{ top: 8, right: 60, left: 8, bottom: 8 }} barCategoryGap="30%">
            <CartesianGrid stroke={GRID} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: LABEL }} tickLine={false} axisLine={{ stroke: LABEL }} ticks={[0, 25, 50, 75, 100]} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "#374151", fontWeight: 500 }} tickLine={false} axisLine={false} />
            <Tooltip content={<HealthTooltip />} />
            <Bar dataKey="value" fill={PRIMARY} radius={[0, 4, 4, 0]} background={{ fill: "#f3f4f6", radius: 4 }}>
              <LabelList content={<HL2 />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
 
    return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>No preview available</div>;
  };
 
  const handleDownload = async (format) => {
    let offscreen = null;
    try {
      const el = document.getElementById("modal-chart-only");
      if (!el) return;
 
      const fullW = el.scrollWidth;
      const fullH = el.scrollHeight;
 
      offscreen = document.createElement("div");
      offscreen.style.cssText = `position:fixed;top:-99999px;left:-99999px;width:${fullW}px;height:${fullH}px;overflow:visible;background:#fff;z-index:-1;`;
 
      const clone = el.cloneNode(true);
      clone.style.width = fullW + "px";
      clone.style.height = fullH + "px";
      clone.style.overflow = "visible";
      clone.style.display = "block";
 
      // Strip all overflow clipping from every child so nothing is cut off
      clone.querySelectorAll("*").forEach((node) => {
        const s = node.style;
        if (s.overflow === "auto" || s.overflow === "hidden" || s.overflow === "scroll") s.overflow = "visible";
        if (s.overflowX === "auto" || s.overflowX === "hidden" || s.overflowX === "scroll") s.overflowX = "visible";
        if (s.overflowY === "auto" || s.overflowY === "hidden" || s.overflowY === "scroll") s.overflowY = "visible";
      });
 
      offscreen.appendChild(clone);
      document.body.appendChild(offscreen);
 
      await new Promise((r) => setTimeout(r, 100));
 
      const canvas = await html2canvas(offscreen, {
        backgroundColor: "#fff",
        scale: 2,
        useCORS: true,
        width: fullW,
        height: fullH,
        scrollX: 0,
        scrollY: 0,
        windowWidth: fullW,
        windowHeight: fullH,
      });
 
      document.body.removeChild(offscreen);
      offscreen = null;
 
      const imgData = canvas.toDataURL("image/png");
 
      if (format === "PDF") {
        const imgW = canvas.width / 2;
        const imgH = canvas.height / 2;
        const pdf = new jsPDF({
          orientation: imgW >= imgH ? "landscape" : "portrait",
          unit: "px",
          format: [imgW, imgH],
        });
        pdf.addImage(imgData, "PNG", 0, 0, imgW, imgH);
        pdf.save(`${chartTitle.replace(/\s+/g, "_")}.pdf`);
      } else {
        const link = document.createElement("a");
        link.download = `${chartTitle.replace(/\s+/g, "_")}.png`;
        link.href = imgData;
        link.click();
      }
      setDownloadOpen(false);
      onClose();
    } catch (err) {
      if (offscreen && document.body.contains(offscreen)) document.body.removeChild(offscreen);
      console.error("Download error:", err);
      alert("Error downloading chart. Please try again.");
    }
  };
 
  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
      <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: 24, width: "92%", maxWidth: 900, boxShadow: "0 10px 40px rgba(0,0,0,0.2)", maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#374151" }}>{chartTitle}</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}>
            <X size={20} />
          </button>
        </div>
        {/* Chart */}
        <div style={{ flex: 1, overflow: "hidden", backgroundColor: "#fff" }}>
          <div id="modal-chart-only" style={{ backgroundColor: "#fff", padding: 4, width: "100%" }}>
            {renderModalChart()}
          </div>
        </div>
        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid #e5e7eb", flexShrink: 0 }}>
          <span style={{ fontSize: 14, color: LABEL, fontWeight: 500 }}>Export Chart</span>
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setDownloadOpen((p) => !p)}
              style={{ padding: "8px 20px", backgroundColor: PRIMARY, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}
            >
              <Download size={14} />
              Download
              <ChevronDown size={14} />
            </button>
            {downloadOpen && (
              <div style={{ position: "absolute", bottom: "100%", right: 0, marginBottom: 8, background: "#fff", borderRadius: 8, boxShadow: "0 8px 20px rgba(0,0,0,0.15)", zIndex: 9999, minWidth: 140 }}>
                {["PNG", "PDF"].map((fmt) => (
                  <div key={fmt} onClick={() => handleDownload(fmt)}
                    style={{ padding: "10px 16px", cursor: "pointer", fontSize: 13, color: "#374151", fontWeight: 500 }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
                  >
                    {fmt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
 
// ─── Custom Dropdown ───────────────────────────────────────────────────────────
const CustomDropdown = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
 
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
 
  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: "100%", padding: "12px 16px", backgroundColor: "#fff", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", color: value ? "#374151" : "#9ca3af", fontWeight: 500 }}
      >
        {value || placeholder}
        <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
      </button>
      {isOpen && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, backgroundColor: "#fff", border: "1px solid #d1d5db", borderRadius: 8, boxShadow: "0 4px 6px rgba(0,0,0,0.1)", zIndex: 1000, maxHeight: 200, overflowY: "auto" }}>
          {options.map((option, i) => (
            <div key={i}
              onClick={() => { onChange(option); setIsOpen(false); }}
              style={{ padding: "12px 16px", cursor: "pointer", backgroundColor: value === option ? "#f3f4f6" : "#fff", fontSize: 14, color: "#374151", fontWeight: value === option ? 600 : 400 }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = value === option ? "#f3f4f6" : "#fff")}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
 
// ─── Main Component ────────────────────────────────────────────────────────────
const EnergyAnalytics = () => {
  const [plantRoom, setPlantRoom] = useState("Plant Room");
  const [equipmentType, setEquipmentType] = useState("ALL");
  const [dateMode, setDateMode] = useState("day");
  const [selectedDate, setSelectedDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState({ title: "", ref: null, data: null, type: null, labels: null });
 
  const [areaChartData, setAreaChartData] = useState([]);
  const [areaChartLabels, setAreaChartLabels] = useState([]);
  const [barChartDataAPI, setBarChartDataAPI] = useState([]);
  const [heatmapDataAPI, setHeatmapDataAPI] = useState([]);
  const [assetHealthData, setAssetHealthData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [assetHealthLoading, setAssetHealthLoading] = useState(false);
 
  const equipmentOptions = [
    { label: "All", value: "ALL" },
    { label: "Chiller", value: "CHILLER" },
    { label: "Cooling Tower", value: "COOLING_TOWER" },
    { label: "Condenser Pump", value: "CONDENSER_PUMP" },
    { label: "Primary Pump", value: "PRIMARY_PUMP" },
    { label: "Secondary Pump", value: "SECONDARY_PUMP" },
  ];
 
  // ── Date range helpers ───────────────────────────────────────────────────
  // Use local date parts to avoid UTC shift in IST/UTC+ timezones
  const toLocalDateStr = (d) => {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  };
 
  const getDateRange = () => {
    let startDate, endDate, timeRange;
    if (dateMode === "day") {
      startDate = selectedDate; endDate = selectedDate; timeRange = "daily";
    } else if (dateMode === "week") {
      startDate = selectedDate;
      const end = new Date(selectedDate + "T00:00:00");
      end.setDate(end.getDate() + 6);
      endDate = toLocalDateStr(end); // toISOString() shifts date back in UTC+ zones (e.g. IST)
      timeRange = "weekly";
    } else if (dateMode === "month") {
      startDate = selectedDate;
      const s = new Date(selectedDate + "T00:00:00");
      const e = new Date(s.getFullYear(), s.getMonth() + 1, 0);
      endDate = toLocalDateStr(e); // same fix for month last day
      timeRange = "monthly";
    } else if (dateMode === "custom" && Array.isArray(selectedDate)) {
      startDate = selectedDate[0]; endDate = selectedDate[1];
      const diff = Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000);
      timeRange = diff === 0 ? "daily" : diff <= 7 ? "weekly" : diff <= 31 ? "monthly" : "custom";
    }
    return { startDate, endDate, timeRange };
  };
 
  // ── API fetchers ─────────────────────────────────────────────────────────
  const fetchEnergyData = async () => {
    if (!selectedDate) { setDebugInfo("No date selected"); return; }
    setLoading(true);
    setDebugInfo("Loading...");
    try {
      const { startDate, endDate, timeRange } = getDateRange();
      setDebugInfo(`Fetching: ${equipmentType}, ${timeRange}, ${startDate} to ${endDate}`);
      const response = await api.analytics.energyConsumptionChart(equipmentType, timeRange, startDate, endDate);
      if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
        setAreaChartData(response.data.map((item) => item.value));
        setAreaChartLabels(response.data.map((item) => item.label));
        setDebugInfo(`Success: ${response.data.length} data points (${timeRange})`);
      } else {
        setAreaChartData([]); setAreaChartLabels([]);
        setDebugInfo(`Invalid response: success=${response?.success}, hasData=${!!response?.data}`);
      }
    } catch (err) {
      console.error("Energy data error:", err);
      setAreaChartData([]); setAreaChartLabels([]);
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
 
  const fetchAssetWiseData = async () => {
    if (!selectedDate) return;
    try {
      const { startDate, endDate, timeRange } = getDateRange();
      const response = await api.analytics.energyConsumptionAssetWise(equipmentType, timeRange, startDate, endDate);
      setBarChartDataAPI(Array.isArray(response) && response.length > 0 ? response : []);
    } catch (err) {
      console.error("Asset wise error:", err);
      setBarChartDataAPI([]);
    }
  };
 
  const fetchHeatmapData = async () => {
    if (!selectedDate) return;
    try {
      const { startDate, endDate, timeRange } = getDateRange();
      const response = await api.analytics.energyConsumptionHeatmap(equipmentType, timeRange, startDate, endDate);
      if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
        setHeatmapDataAPI(response.data);
      } else {
        setHeatmapDataAPI([]);
      }
    } catch (err) {
      console.error("Heatmap error:", err);
      setHeatmapDataAPI([]);
    }
  };
 
  const fetchAssetHealthData = async () => {
    if (!selectedDate) return;
    setAssetHealthLoading(true);
 
    try {
      const { startDate, endDate, timeRange } = getDateRange();
 
      const response = await api.analytics.energyConsumptionAssetHealth(
        equipmentType,
        timeRange,
        startDate,
        endDate
      );
 
      console.log("Asset Health API Response:", response);
 
      let healthArr = [];
 
      if (response?.status === true) {
        // CASE 1: Nested structure (your current response)
        if (Array.isArray(response?.data?.data)) {
          healthArr = response.data.data;
        }
        // CASE 2: Direct array inside data
        else if (Array.isArray(response?.data)) {
          healthArr = response.data;
        }
        // CASE 3: API directly returns array
        else if (Array.isArray(response)) {
          healthArr = response;
        }
      }
 
      setAssetHealthData(healthArr);
 
    } catch (err) {
      console.error("Asset health error:", err);
      setAssetHealthData([]);
    } finally {
      setAssetHealthLoading(false);
    }
  };
 
  useEffect(() => {
    if (selectedDate) {
      fetchEnergyData();
      fetchAssetWiseData();
      fetchHeatmapData();
      fetchAssetHealthData();
    }
  }, [equipmentType, selectedDate, dateMode]);
 
  // ── Chart click handler ──────────────────────────────────────────────────
  const handleChartClick = (title, ref, data = null, type = null, labels = null) => {
    setSelectedChart({ title, ref, data, type, labels });
    setModalOpen(true);
  };
 
  // ── Date handlers ────────────────────────────────────────────────────────
  const parseDateInput = (input) => {
    if (!input) return input;
    if (typeof input === "object" && input.startDate) {
      const p = input.startDate.split("/");
      return `${p[2]}-${p[1]}-${p[0]}`;
    }
    if (input instanceof Date) return input.toISOString().split("T")[0];
    if (typeof input === "string" && input.includes("/")) {
      const p = input.split("/");
      return `${p[2]}-${p[1]}-${p[0]}`;
    }
    return input;
  };
 
  const handleDateSelect = (date) => { setDateMode("day"); setSelectedDate(parseDateInput(date)); };
  const handleWeekSelect = (week) => { setDateMode("week"); setSelectedDate(parseDateInput(week)); };
  const handleMonthSelect = (month) => { setDateMode("month"); setSelectedDate(parseDateInput(month)); };
  const handleCustomDateSelect = (range) => {
    setDateMode("custom");
    if (range && typeof range === "object" && range.startDate && range.endDate) {
      const sp = range.startDate.split("/"); const ep = range.endDate.split("/");
      setSelectedDate([`${sp[2]}-${sp[1]}-${sp[0]}`, `${ep[2]}-${ep[1]}-${ep[0]}`]);
    } else if (Array.isArray(range)) {
      setSelectedDate(range.map((d) => parseDateInput(d)));
    } else {
      setSelectedDate(range);
    }
  };
 
  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 16, backgroundColor: "#f9fafb", height: "calc(100vh - 47px)", overflow: "hidden", display: "flex", flexDirection: "column", boxSizing: "border-box", margin: "-24px" }}>
      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(160px,200px) minmax(160px,200px) 1fr auto", gap: 12, marginBottom: 16, flexShrink: 0 }}>
        <CustomDropdown value={plantRoom} onChange={setPlantRoom} options={["Plant Room"]} placeholder="Select Plant Room" />
        <CustomDropdown
          value={equipmentOptions.find((o) => o.value === equipmentType)?.label || "All"}
          onChange={(label) => { const sel = equipmentOptions.find((o) => o.label === label); setEquipmentType(sel?.value || "ALL"); }}
          options={equipmentOptions.map((o) => o.label)}
          placeholder="Select Equipment"
        />
        <div />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <CalendarSelector
            defaultMode="day"
            onDateSelect={handleDateSelect}
            onWeekSelect={handleWeekSelect}
            onMonthSelect={handleMonthSelect}
            onCustomSelect={handleCustomDateSelect}
            showSelection={false}
          />
        </div>
      </div>
 
      {/* Charts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* Row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "40fr 60fr", gap: 16, flex: 1, minHeight: 0 }}>
          <EnergyAreaChart
            data={areaChartData}
            labels={areaChartLabels}
            title="Energy Consumption - kWh"
            onChartClick={handleChartClick}
            loading={loading}
            debugInfo={debugInfo}
            dateMode={dateMode}
            selectedDate={selectedDate}
          />
          <EnergyBarChart
            data={barChartDataAPI}
            title="Energy Consumption Asset Type - kWh"
            onChartClick={handleChartClick}
          />
        </div>
        {/* Row 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "60fr 40fr", gap: 16, flex: 1, minHeight: 0 }}>
          <HeatmapChart
            data={heatmapDataAPI}
            title="Energy Consumption Heatmap - kWh"
            onChartClick={handleChartClick}
            dateMode={dateMode}
            selectedDate={selectedDate}
          />
          <HorizontalBarChart
            data={assetHealthData}
            title="Asset Health"
            onChartClick={handleChartClick}
            loading={assetHealthLoading}
          />
        </div>
      </div>
 
      {/* Modal */}
      <ChartDownloadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        chartTitle={selectedChart.title}
        chartRef={selectedChart.ref}
        chartData={selectedChart.data}
        chartType={selectedChart.type}
        chartLabels={selectedChart.labels}
        dateMode={dateMode}
        selectedDate={selectedDate}
      />
    </div>
  );
};
 
export default EnergyAnalytics;
 