import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const C = {
  /* Title block */
  titleBg:      "FFFFFF", // white background
  titleFg:      "1A1A2E", // dark text
  titleBorder:  "BFBFBF", // light grey outer border

  /* Column header band colours */
  hdrDateBg:    "BDD7EE", // blue-grey  — Date & Time group
  hdrChillerBg: "D9E1F2", // light blue — Chiller Parameters group
  hdrPumpBg:    "E2EFDA", // light green— Primary Pumps group
  hdrCTBg:      "FCE4D6", // light orange— Cooling Tower group
  hdrCondBg:    "FFF2CC", // light yellow— Condenser group
  hdrDefaultBg: "D9E1F2", // fallback light blue
  hdrFg:        "1A1A2E", // header text colour

  /* Data rows */
  altRowBg:  "EBF3FB", // alternate row light blue
  whiteBg:   "FFFFFF",
  bodyFg:    "1A1A2E",

  /* Summary specific */
  sectionBg: "D3D8DE",
  totalBg:   "C0C8D0",

  /* Diff colours */
  negFg: "C62828",
  posFg: "1B5E20",
};


// Excel desktop requires BOTH fgColor and bgColor for solid pattern fills.
// Browser-based viewers (Google Sheets, Excel Online) are lenient and work
// without bgColor, but the desktop app silently drops cells without it.
const solidFill = (hex) => ({
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF" + hex },
  bgColor: { argb: "FFFFFFFF" },
});
const fnt  = (sz, bold, color, italic = false) => ({ name: "Arial", size: sz, bold, italic, color: { argb: "FF" + color } });
const aln  = (h, v = "middle", wrap = false)   => ({ horizontal: h, vertical: v, wrapText: wrap });

const thin   = (color = "BFBFBF") => ({ style: "thin",   color: { argb: "FF" + color } });
const medium = (color = "9EA5AF") => ({ style: "medium", color: { argb: "FF" + color } });
const thick  = (color = "595959") => ({ style: "thick",  color: { argb: "FF" + color } });

const borders = {
  all:    (c = "BFBFBF") => ({ top: thin(c), bottom: thin(c), left: thin(c), right: thin(c) }),
  medTop: ()              => ({ top: medium(), bottom: thin(), left: thin(), right: thin() }),
  outer:  ()              => ({ top: medium("595959"), bottom: medium("595959"), left: medium("595959"), right: medium("595959") }),
  hdr:    ()              => ({ top: medium("595959"), bottom: medium("595959"), left: thin(), right: thin() }),
};

const applyStyle = (cell, cfg) => {
  if (cfg.fnt)    cell.font      = cfg.fnt;
  if (cfg.fill)   cell.fill      = cfg.fill;
  if (cfg.aln)    cell.alignment = cfg.aln;
  if (cfg.border) cell.border    = cfg.border;
};

/* 0-based col index → Excel column letter (A, B, … Z, AA …) */
const colLetter = (idx) => {
  let s = "", n = idx + 1;
  while (n > 0) { s = String.fromCharCode(64 + ((n - 1) % 26 + 1)) + s; n = Math.floor((n - 1) / 26); }
  return s;
};

const toNum = (val) => {
  if (val === null || val === undefined || val === "" || val === "-" || val === "—") return "";
  const n = Number(val);
  return isNaN(n) ? String(val) : n;
};

const diffColor = (val) => {
  const n = Number(val);
  if (isNaN(n) || val === "" || val == null) return C.bodyFg;
  return n < 0 ? C.negFg : n > 0 ? C.posFg : C.bodyFg;
};


const buildTitleBlock = (ws, opts, numCols) => {
  const lastLetter = colLetter(numCols - 1);

  const mergedRow = (text, fontSize, bold, italic, rowHeight) => {
    const row = ws.addRow(new Array(numCols).fill(""));
    row.height = rowHeight;
    for (let c = 1; c <= numCols; c++) {
      const cell = ws.getCell(row.number, c);
      cell.fill      = solidFill(C.titleBg);
      cell.alignment = aln("center", "middle");
      cell.border    = borders.all("FFFFFF"); // invisible inner borders
      // top outer border only on row 1
      if (row.number === 1) cell.border = { ...cell.border, top: medium(C.titleBorder) };
      if (c === 1)          cell.border = { ...cell.border, left: medium(C.titleBorder) };
      if (c === numCols)    cell.border = { ...cell.border, right: medium(C.titleBorder) };
    }
    ws.mergeCells(`A${row.number}:${lastLetter}${row.number}`);
    const mc = ws.getCell(`A${row.number}`);
    mc.value     = text;
    mc.font      = fnt(fontSize, bold, C.titleFg, italic);
    mc.fill      = solidFill(C.titleBg);
    mc.alignment = aln("center", "middle");
    return row;
  };

  // Row 1: Report Title — big bold
  mergedRow(opts.reportTitle, 16, true, false, 34);
  // Row 2: Report Date — italic
  mergedRow(`Report Date : ${opts.reportDate}`, 10, false, true, 18);
  // Row 3: From – To
  mergedRow(`From Date: ${opts.fromDate}  To Date: ${opts.toDate}`, 10, false, false, 18);
  // Row 4: Location — bold
  mergedRow(opts.location || "", 10, true, false, 18);

  // Spacer row
  const spacer = ws.addRow(new Array(numCols).fill(null));
  spacer.height = 6;
  spacer.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = solidFill(C.whiteBg);
  });

  return ws.lastRow.number; // last title row index (for freeze)
};


// const freezeAt = (ws, rowNumber) => {
//   ws.views = [
//     {
//       state: "frozen",
//       xSplit: 0,
//       ySplit: rowNumber,
//       topLeftCell: `A${rowNumber + 1}`,
//     }
//   ];
// };

const freezeAt = (ws, headerRowNumber) => {
  // Excel desktop app requires topLeftCell to be explicitly set alongside ySplit.
  // Without it, the desktop app can misrender or clip rows below the freeze line.
  ws.views = [
    {
      state: "frozen",
      ySplit: headerRowNumber,
      xSplit: 0,
      topLeftCell: `A${headerRowNumber + 1}`,
      activeCell: `A${headerRowNumber + 1}`,
    }
  ];
};

const PLANT_GROUPS = [
  { label: "Date & Time",              cols: ["DATE", "TIME"],              bg: C.hdrDateBg    },
  { label: "Chiller Parameters",       cols: ["YK CHILLER 1 TR","YK CHILLER 1 kW","SPC 1","YK CHILLER 2 TR","YK CHILLER 2 kW","SPC 2"], bg: C.hdrChillerBg },
  { label: "Primary Pumps Parameters", cols: ["NEW CHW PRIMARY PUMP # 1- KW","NEW CHW PRIMARY PUMP # 2- KW","NEW CHW PRIMARY PUMP # 3- KW","NEW CHW PRIMARY PUMPS- TOTAL KW","NEW CHW PRIMARY PUMPS- TOTAL KWH"], bg: C.hdrPumpBg },
  { label: "Condenser Pump Parameters",cols: ["NEW CONDENSER PUMP-01-02 KW","NEW CONDENSER PUMP-01-02 KWH","NEW CONDENSER PUMP 3 KW","NEW CONDENSER PUMP 3 KWH","NEW CDW CONDENSER PUMPS- TOTAL KW","NEW CDW CONDENSER PUMPS- TOTAL KWH"], bg: C.hdrCondBg },
  { label: "Cooling Tower Parameters", cols: ["NEW COOLING TOWER-1 FAN-1 KW","NEW COOLING TOWER-1 FAN-1 KWH","NEW COOLING TOWER-1 FAN-2 KW","NEW COOLING TOWER-1 FAN-2 KWH","NEW COOLING TOWER-1 FAN-3 KW","NEW COOLING TOWER-1 FAN-3 KWH","NEW COOLING TOWER-2 FAN-1 KW","NEW COOLING TOWER-2 FAN-1 KWH","NEW COOLING TOWER-2 FAN-2 KW","NEW COOLING TOWER-2 FAN-2 KWH","NEW COOLING TOWER-2 FAN-3 KW","NEW COOLING TOWER-2 FAN-3 KWH","TOTAL COOLING TOWER FANS (KW)","TOTAL COOLING TOWER FANS (KWH)"], bg: C.hdrCTBg },
  { label: "Overall Parameters",       cols: [], bg: C.hdrDefaultBg }, // catch-all
];

const getGroupForCol = (colLabel) => {
  const upper = colLabel.toUpperCase();
  for (const grp of PLANT_GROUPS) {
    if (grp.cols.some((c) => upper.includes(c.toUpperCase()) || c.toUpperCase().includes(upper))) {
      return grp;
    }
  }
  return PLANT_GROUPS[PLANT_GROUPS.length - 1];
};


const buildPlantHeaders = (ws, columns) => {
  // Assign each column to a group
  const colGroups = columns.map((col) => getGroupForCol(col));

  /* ── Group label row ── */
  const grpRow = ws.addRow(new Array(columns.length).fill(null));
  grpRow.height = 22;

  let c = 0;
  while (c < columns.length) {
    const grp     = colGroups[c];
    let   spanEnd = c;
    // find contiguous span of same group
    while (spanEnd + 1 < columns.length && colGroups[spanEnd + 1].label === grp.label) spanEnd++;

    // Style all cells in span
    for (let i = c; i <= spanEnd; i++) {
      const cell = grpRow.getCell(i + 1);
      cell.value     = i === c ? grp.label : null;
      cell.fill      = solidFill(grp.bg);
      cell.font      = fnt(10, true, C.hdrFg);
      cell.alignment = aln("center", "middle");
      cell.border    = { top: medium("595959"), bottom: thin(), left: thin(), right: thin() };
      if (i === c)       cell.border.left  = medium("595959");
      if (i === spanEnd) cell.border.right = medium("595959");
    }

    // Merge span if more than 1 col
    if (spanEnd > c) {
      ws.mergeCells(`${colLetter(c)}${grpRow.number}:${colLetter(spanEnd)}${grpRow.number}`);
    }
    // Ensure merged cell value and style is set
    const mc = ws.getCell(grpRow.number, c + 1);
    mc.value     = grp.label;
    mc.font      = fnt(10, true, C.hdrFg);
    mc.fill      = solidFill(grp.bg);
    mc.alignment = aln("center", "middle");

    c = spanEnd + 1;
  }

  /* ── Individual column name row ── */
  const colRow = ws.addRow(new Array(columns.length).fill(null));
  colRow.height = 48; // tall for wrapped text

  columns.forEach((colName, i) => {
    const grp  = colGroups[i];
    const cell = colRow.getCell(i + 1);
    cell.value     = colName;
    cell.font      = fnt(9, true, C.hdrFg);
    cell.fill      = solidFill(grp.bg);
    cell.alignment = aln(i < 2 ? "left" : "center", "middle", true);
    cell.border    = {
      top:    thin(),
      bottom: medium("595959"),
      left:   thin(),
      right:  thin(),
    };
  });
 return colRow.number;
  // Freeze panes below this row
//   freezeAt(ws, colRow.number);/
};

const buildSimpleHeaders = (ws, columns) => {
  const row = ws.addRow(new Array(columns.length).fill(null));
  row.height = 52; // tall for multi-line wrapped column names

  columns.forEach((colName, i) => {
    const cell = row.getCell(i + 1);
    cell.value     = colName;
    cell.font      = fnt(9, true, C.hdrFg);
    cell.fill      = solidFill(C.hdrDefaultBg);
    cell.alignment = aln(i < 2 ? "left" : "center", "middle", true);
    cell.border    = {
      top:    medium("595959"),
      bottom: medium("595959"),
      left:   thin(),
      right:  thin(),
    };
  });
return row.number;
  // Freeze at this row
//   freezeAt(ws, row.number);
};

const buildSummaryHeaders = (ws) => {
  const HDRS = ["DESCRIPTION", "RUN HOURS", "COMMITTED", "ACTUAL", "DIFFERENCE"];
  const row  = ws.addRow(HDRS);
  row.height = 28;

  HDRS.forEach((_, i) => {
    const cell = row.getCell(i + 1);
    cell.font      = fnt(10, true, C.hdrFg);
    cell.fill      = solidFill(C.hdrDefaultBg);
    cell.alignment = aln(i === 0 ? "left" : i === 4 ? "right" : "center", "middle");
    cell.border    = borders.hdr();
  });
return row.number;
//   freezeAt(ws, row.number);
};


const dataCell = (ws, rowNum, colNum, value, cfg) => {
  const cell = ws.getCell(rowNum, colNum);
  const n    = typeof value === "number" ? value : Number(value);
  cell.value     = (!isNaN(n) && value !== "") ? n : (value === "" ? null : value);
  cell.font      = cfg.fnt    || fnt(10, false, C.bodyFg);
  cell.fill      = cfg.fill   || solidFill(C.whiteBg);
  cell.alignment = cfg.aln    || aln("center");
  cell.border    = cfg.border || borders.all();
};


export const generateExcel = async (opts) => {
  /*
    opts.reportTitle, reportDate, fromDate, toDate, location, filename
    Flat table  → opts.columns (string[]), opts.rows (any[][]), opts.tableType ("plant"|"chiller"|"btu")
    Summary     → opts.sections, opts.bottomRows
  */

  const wb = new ExcelJS.Workbook();
  wb.creator  = "ChillerApp";
  wb.lastModifiedBy = "ChillerApp";
  wb.created  = new Date();
  wb.modified = new Date();

  const isSummary = !!opts.sections;
  const isPlant   = opts.tableType === "plant";
  const numCols   = isSummary ? 5 : (opts.columns?.length ?? 1);
const ws = wb.addWorksheet("Report", {
  pageSetup: {
    orientation:  "landscape",
    paperSize:    9,           // A4
    fitToPage:    true,
    fitToWidth:   1,
    fitToHeight:  0,
  },
  views: [],                   // will be set by freezeAt() after headers are built
});

ws.properties.defaultRowHeight = 18;

  /* ── Column widths ── */
  if (isSummary) {
    ws.columns = [
      { width: 42 }, // DESCRIPTION
      { width: 13 }, // RUN HOURS
      { width: 15 }, // COMMITTED
      { width: 15 }, // ACTUAL
      { width: 13 }, // DIFFERENCE
    ];
  } else if (isPlant) {
    ws.columns = opts.columns.map((_, i) => ({
      width: i === 0 ? 14 : i === 1 ? 8 : 16, // DATE | TIME | data cols
    }));
  } else {
    // Chiller / BTU — slightly wider cols for readability
    ws.columns = opts.columns.map((_, i) => ({
      width: i === 0 ? 14 : i === 1 ? 8 : i === 2 ? 10 : 15,
    }));
  }

  /* ── Title block ── */
  buildTitleBlock(ws, opts, numCols);

let headerRowNumber;

if (isSummary) {
  headerRowNumber = buildSummaryHeaders(ws);
} else if (isPlant) {
  headerRowNumber = buildPlantHeaders(ws, opts.columns);
} else {
  headerRowNumber = buildSimpleHeaders(ws, opts.columns);
}


// Freeze exactly below header row
freezeAt(ws, headerRowNumber);

  if (isSummary) {
    opts.sections.forEach((section) => {

      /* Section header */
      const secRow = ws.addRow([section.title, "", "", "", ""]);
      secRow.height = 20;
      for (let c = 1; c <= 5; c++) {
        applyStyle(ws.getCell(secRow.number, c), {
          fnt:    fnt(10, true, C.bodyFg),
          fill:   solidFill(C.sectionBg),
          aln:    aln("left"),
          border: borders.all(),
        });
      }

      /* Data rows */
      section.rows.forEach((row, idx) => {
        const bg     = idx % 2 !== 0 ? C.altRowBg : C.whiteBg;
        const diff   = toNum(row.difference);
        const dColor = diffColor(row.difference);
        const dr     = ws.addRow([row.description, toNum(row.runHours), toNum(row.committedKwh), toNum(row.actualKwh), diff]);
        dr.height    = 18;
        const bdr    = borders.all();
        applyStyle(dr.getCell(1), { fnt: fnt(10, false, C.bodyFg), fill: solidFill(bg), aln: aln("left"),    border: bdr });
        applyStyle(dr.getCell(2), { fnt: fnt(10, false, C.bodyFg), fill: solidFill(bg), aln: aln("center"),  border: bdr });
        applyStyle(dr.getCell(3), { fnt: fnt(10, false, C.bodyFg), fill: solidFill(bg), aln: aln("center"),  border: bdr });
        applyStyle(dr.getCell(4), { fnt: fnt(10, false, C.bodyFg), fill: solidFill(bg), aln: aln("center"),  border: bdr });
        applyStyle(dr.getCell(5), { fnt: fnt(10, diff !== "", dColor), fill: solidFill(bg), aln: aln("right"), border: bdr });
      });

      /* Total row */
      if (section.totalRow) {
        const tr     = section.totalRow;
        const diff   = toNum(tr.difference);
        const dColor = diffColor(tr.difference);
        const trow   = ws.addRow([tr.description, toNum(tr.runHours), toNum(tr.committedKwh), toNum(tr.actualKwh), diff]);
        trow.height  = 20;
        const bdr    = borders.medTop();
        applyStyle(trow.getCell(1), { fnt: fnt(10, true, C.bodyFg), fill: solidFill(C.totalBg), aln: aln("left"),    border: bdr });
        applyStyle(trow.getCell(2), { fnt: fnt(10, true, C.bodyFg), fill: solidFill(C.totalBg), aln: aln("center"),  border: bdr });
        applyStyle(trow.getCell(3), { fnt: fnt(10, true, C.bodyFg), fill: solidFill(C.totalBg), aln: aln("center"),  border: bdr });
        applyStyle(trow.getCell(4), { fnt: fnt(10, true, C.bodyFg), fill: solidFill(C.totalBg), aln: aln("center"),  border: bdr });
        applyStyle(trow.getCell(5), { fnt: fnt(10, true, dColor),   fill: solidFill(C.totalBg), aln: aln("right"),   border: bdr });
      }
    });

    /* Bottom rows */
    (opts.bottomRows ?? []).forEach((row, idx) => {
      const bg     = idx % 2 !== 0 ? C.altRowBg : C.whiteBg;
      const diff   = toNum(row.difference);
      const dColor = diffColor(row.difference);
      const br     = ws.addRow([row.description, toNum(row.runHours), toNum(row.committedKwh), toNum(row.actualKwh), diff]);
      br.height    = 18;
      const bdr    = borders.all();
      applyStyle(br.getCell(1), { fnt: fnt(10, true, C.bodyFg),  fill: solidFill(bg), aln: aln("left"),   border: bdr });
      applyStyle(br.getCell(2), { fnt: fnt(10, false, C.bodyFg), fill: solidFill(bg), aln: aln("center"), border: bdr });
      applyStyle(br.getCell(3), { fnt: fnt(10, false, C.bodyFg), fill: solidFill(bg), aln: aln("center"), border: bdr });
      applyStyle(br.getCell(4), { fnt: fnt(10, false, C.bodyFg), fill: solidFill(bg), aln: aln("center"), border: bdr });
      applyStyle(br.getCell(5), { fnt: fnt(10, true, dColor),    fill: solidFill(bg), aln: aln("right"),  border: bdr });
    });


  } else {
    const colGroups = isPlant ? opts.columns.map((col) => getGroupForCol(col)) : null;

    opts.rows.forEach((row, rIdx) => {
      const isAlt = rIdx % 2 !== 0;
      const bg    = isAlt ? C.altRowBg : C.whiteBg;

      // Build the values array to pass directly into addRow (avoids ExcelJS
      // index-tracking issues that cause cells to go missing on large datasets)
      const values = row.map((cell) => {
        const raw = (cell === "-" || cell === null || cell === undefined) ? "" : cell;
        const n   = Number(raw);
        const val = (raw !== "" && !isNaN(n)) ? n : raw;
        return val === "" ? null : val;
      });

      const dr = ws.addRow(values);
      dr.height = 18;

      // Now apply styles only (values already committed to the row)
      row.forEach((_, cIdx) => {
        const wc = dr.getCell(cIdx + 1);
        wc.font      = fnt(10, false, C.bodyFg);
        wc.fill      = solidFill(bg);
        wc.alignment = aln(cIdx < 2 ? "left" : "center", "middle");
        wc.border    = borders.all();
      });
    });
  }

  /* ── Write and trigger download ── */
  const buffer = await wb.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    opts.filename
  );
};