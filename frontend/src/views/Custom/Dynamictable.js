import React from "react";

const DynamicTable = ({ columns = [], rows = [] }) => {
  if (columns.length === 0) return null;

  // Calculate minimum width per column to ensure readability
  const colW = Math.max(140, Math.floor(1400 / columns.length));
  const minTableWidth = colW * columns.length;

  const formatCell = (value) => {
  if (value === null || value === undefined || value === "") return "-";

  const num = Number(value);

  if (isNaN(num)) return value;

  return num.toFixed(2);
};

  return (
    <div 
      style={{ 
        overflowX: "auto",
        overflowY: "auto",
        maxHeight: "600px",
        width: "100%",
        maxWidth: "100%",
        position: "relative",
        WebkitOverflowScrolling: "touch"
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
          minWidth: `${minTableWidth}px`,
        }}
      >
        {/* ─── colgroup – equal widths ─── */}
        <colgroup>
          {columns.map((_, i) => (
            <col key={i} style={{ width: `${colW}px`, minWidth: `${colW}px` }} />
          ))}
        </colgroup>

        {/* ─── sticky header ─── */}
        <thead>
          <tr style={{ background: "#d9dce1", borderBottom: "2px solid #c0c4ca" }}>
            {columns.map((header, i) => (
              <th
                key={i}
                style={{
                  padding: "10px 12px",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#3a4150",
                  letterSpacing: "0.5px",
                  textAlign: "center",
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                  lineHeight: "1.4",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  background: "#d9dce1",
                  borderRight: i < columns.length - 1 ? "1px solid #c0c4ca" : "none",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        {/* ─── body rows ─── */}
        <tbody>
          {rows.map((row, rIdx) => (
            <tr
              key={rIdx}
              style={{
                background: rIdx % 2 === 0 ? "#ffffff" : "#f7f8fa",
                borderBottom: "1px solid #eef0f3",
              }}
            >
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  style={{
                    padding: "9px 12px",
                    fontSize: "13px",
                    color: "#3a4150",
                    textAlign: cIdx === 0 ? "left" : "center",
                    whiteSpace: "nowrap",
                    borderRight: cIdx < columns.length - 1 ? "1px solid #eef0f3" : "none",
                  }}
                >
                  {formatCell(cell)}
                </td>
              ))}
            </tr>
          ))}

          {/* empty state */}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "14px",
                }}
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;