import React, { useState } from "react";
 
const COL_WIDTHS = ["50%", "25%", "25%"];
const HEADERS = ["DESCRIPTION", "RUN HOURS", "ACTUAL"];
 
const fmt = (val) => {
  if (val === null || val === undefined || val === "" || val === "-") return "—";

  const num = Number(val);

  if (isNaN(num)) return val; // text values

  return num.toFixed(2); // ✅ FORCE 2 DECIMALS
};
 
const CollapsibleSectionTable = ({ title, rows = [], totalRow, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
 

  

  return (
    <div style={{ marginBottom: "2px" }}>
      {/* ─── Group Header Row ─── */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          background: "#eef0f3",
          padding: "8px 14px",
          cursor: "pointer",
          userSelect: "none",
          borderBottom: "1px solid #dfe2e6",
        }}
      >
        <span style={{ flex: 1, fontSize: "12px", fontWeight: "700", color: "#3a4150", letterSpacing: "0.4px" }}>
          {title}
        </span>
        <span
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "22px", height: "22px",
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="#3a4150" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
 
      {/* ─── Expandable Content ─── */}
      <div
        style={{
          overflow: "hidden",
          maxHeight: open ? `${rows.length * 38 + 42}px` : "0px",
          transition: "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Data Rows */}
        {rows.map((row, idx) => (
          <div
            key={idx}
            style={{
              display: "grid",
              gridTemplateColumns: COL_WIDTHS.join(" "),
              borderBottom: "1px solid #eef0f3",
              background: idx % 2 === 0 ? "#fff" : "#fafbfc",
            }}
          >
            <div style={{ padding: "8px 14px 8px 32px", fontSize: "13px", color: "#3a4150" }}>
              {row.description}
            </div>
            <div style={{ padding: "8px 0", fontSize: "13px", color: "#3a4150", textAlign: "center" }}>
              {fmt(row.runHours)}
            </div>
            <div style={{ padding: "8px 14px 8px 0", fontSize: "13px", color: "#3a4150", textAlign: "center" }}>
              {fmt(row.actualKwh)}
            </div>
          </div>
        ))}
 
        {/* Total Row */}
        {totalRow && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: COL_WIDTHS.join(" "),
              background: "#e8eaee",
              borderTop: "2px solid #c8cdd2",
            }}
          >
            <div style={{ padding: "9px 14px 9px 18px", fontSize: "13px", fontWeight: "700", color: "#2c3141" }}>
              {totalRow.description}
            </div>
            <div style={{ padding: "9px 0", fontSize: "13px", fontWeight: "700", color: "#2c3141", textAlign: "center" }}>
              {fmt(totalRow.runHours)}
            </div>
            <div style={{ padding: "9px 14px 9px 0", fontSize: "13px", fontWeight: "700", color: "#2c3141", textAlign: "center" }}>
              {fmt(totalRow.actualKwh)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
/* ──── Bottom rows (no runHours) ──── */
const SummaryBottomRows = ({ rows = [] }) => {
  if (rows.length === 0) return null;
  const BOTTOM_COL_WIDTHS = ["75%", "25%"];
 
  return (
    <>
      {rows.map((row, idx) => (
        <div
          key={idx}
          style={{
            display: "grid",
            gridTemplateColumns: BOTTOM_COL_WIDTHS.join(" "),
            background: idx % 2 === 0 ? "#fff" : "#f7f8fa",
            borderBottom: "1px solid #eef0f3",
          }}
        >
          <div style={{ padding: "9px 14px 9px 18px", fontSize: "13px", fontWeight: "600", color: "#2c3141" }}>
            {row.description}
          </div>
          <div style={{ padding: "9px 14px 9px 0", fontSize: "13px", color: "#3a4150", textAlign: "center", fontWeight: "500" }}>
            {fmt(row.actualKwh)}
          </div>
        </div>
      ))}
    </>
  );
};
 
/* ──── Sticky column header ──── */
const SummaryTableHeader = () => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: COL_WIDTHS.join(" "),
      background: "#d9dce1",
      borderBottom: "2px solid #c0c4ca",
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}
  >
    {HEADERS.map((h, i) => (
      <div
        key={h}
        style={{
          padding: "10px 14px",
          fontSize: "11px",
          fontWeight: "700",
          color: "#3a4150",
          letterSpacing: "0.6px",
          textAlign: i === 0 ? "left" : "center",
        }}
      >
        {h}
      </div>
    ))}
  </div>
);
 
export { CollapsibleSectionTable, SummaryTableHeader, SummaryBottomRows };
 