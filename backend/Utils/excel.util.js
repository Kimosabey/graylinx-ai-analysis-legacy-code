const ExcelJS = require("exceljs");
const mapping = require("../Config/reportsParameterMapping");
const { layoutSummarySheet } = require("./ExcelLayout/layoutSummary");
const { layoutChillerSheet } = require("./ExcelLayout/layoutChiller");
const { layoutPlantEnergySheet } = require("./ExcelLayout/layoutPlantEnergy");
const { layoutBtuMeterSheet } = require("./ExcelLayout/layoutBtuMeter");
const layoutToMapping = require("./ExcelLayout/layoutToMapping");
const plantLayout = require("../Config/plantEnergyLayout");

/* ============================
   HELPER FUNCTIONS
   ============================ */

function roundVal(value, decimals = 2) {
  if (!Number.isFinite(value)) return null;
  return Number(value.toFixed(decimals));
}

function buildColumnIndexMap(sheet, mappingObj) {
  if (!mappingObj) return {};
  const map = {};
  let col = 3; // A=DATE, B=TIME

  for (const key of Object.keys(mappingObj)) {
    map[key] = sheet.getColumn(col).letter;
    col++;
  }
  return map;
}

function writeRows(sheet, rows, mappingObj) {
  let rowNum = 7;

  rows.forEach((dbRow) => {
    const row = [dbRow.date, dbRow.time];

    for (const key in mappingObj) {
      const m = mappingObj[key];

      // Constant
      if (m.constant !== undefined) {
        row.push(m.constant);
      }

      // Formula placeholder
      else if (m.formula) {
        row.push(null);
      }

      //  CALCULATED FIELD (MOVE UP)
      else if (m.calculate) {
        const val = m.calculate(dbRow);
        row.push(
          val !== undefined && val !== null
            ? roundVal(Number(val), m.round)
            : null,
        );
      }

      // Source based
      else if (m.source) {
        const val = dbRow[m.source];
        row.push(
          val !== undefined && val !== null
            ? roundVal(Number(val), m.round)
            : null,
        );
      }

      // Normal key mapping
      else if (m.round !== undefined) {
        row.push(
          dbRow[key] !== undefined && dbRow[key] !== null
            ? roundVal(Number(dbRow[key]), m.round)
            : null,
        );
      }

      // Fallback
      else {
        row.push(dbRow[key] ?? null);
      }
    }

    sheet.addRow(row);
    rowNum++;
  });

  return rowNum - 1;
}

// function writeRows(sheet, rows, mappingObj) {
//   let rowNum = 7;
//   rows.forEach(dbRow => {
//     const row = [dbRow.date, dbRow.time];

//     for (const key in mappingObj) {
//       const m = mappingObj[key];

//   if (m.constant !== undefined) row.push(m.constant);

// else if (m.formula) row.push(null);

// else if (m.source) {
//   row.push(roundVal(Number(dbRow[m.source]), m.round));
// }

// else if (m.round !== undefined) {
//   row.push(roundVal(dbRow[key], m.round));
// }

// else row.push(dbRow[key] ?? null);
//     }

//     sheet.addRow(row);
//     rowNum++;
//   });

//   return rowNum - 1;
// }

// function applyFormulas(sheet, mappingObj, colMap, startRow, endRow) {
//   for (let r = startRow; r <= endRow; r++) {
//     for (const key in mappingObj) {
//       const m = mappingObj[key];
//       if (m.formula) {
//         sheet.getCell(`${colMap[key]}${r}`).value = {
//           formula: m.formula(r, colMap)
//         };
//       }
//     }
//   }
// }
function applyFormulas(sheet, mappingObj, colMap, startRow, endRow) {
  for (let r = startRow; r <= endRow; r++) {
    for (const key in mappingObj) {
      const m = mappingObj[key];

      if (!m.formula) continue;

      if (typeof m.formula === "function") {
        // JS-calculated formula (optional, if you want to precompute)
        sheet.getCell(`${colMap[key]}${r}`).value = m.formula(r, colMap);
      } else if (typeof m.formula === "string") {
        // Excel formula string
        sheet.getCell(`${colMap[key]}${r}`).value = {
          formula: m.formula.replace("{row}", r),
        };
      }
    }
  }
}

/* ============================
   MAIN GENERATOR
   ============================ */

exports.generateExcel = async ({
  dataByEquipment,
  filePath,
  fromDate,
  toDate,
}) => {
  const workbook = new ExcelJS.Workbook();

  /* ===== SUMMARY ===== */
  const summary = workbook.addWorksheet("SUMMARY");
  layoutSummarySheet(summary, fromDate, toDate);

  /* ===== CHILLERS ===== */
  for (const eq of ["CHILLER_1", "CHILLER_2"]) {
    const sheet = workbook.addWorksheet(eq);
    const map = mapping[eq];

    layoutChillerSheet(
      sheet,
      `PERFORMANCE REPORT FOR ${eq.replace("_", " ")}`,
      fromDate,
      toDate,
      ["DATE", "TIME", ...Object.values(map).map((m) => m.label)],
    );

    const colMap = buildColumnIndexMap(sheet, map);
    const lastRow = writeRows(sheet, dataByEquipment[eq], map);
    applyFormulas(sheet, map, colMap, 7, lastRow);
  }

  /* ===== PLANT ENERGY ===== */
  const plant = workbook.addWorksheet("CHILLER PLANT ENERGY");
  const plantMap = layoutToMapping(plantLayout);

  layoutPlantEnergySheet(plant, fromDate, toDate, [
    "DATE",
    "TIME",
    ...Object.values(plantMap).map((m) => m.label),
  ]);

  let colMap = buildColumnIndexMap(plant, plantMap);
  let lastRow = writeRows(
    plant,
    dataByEquipment.CHILLER_PLANT_ENERGY,
    plantMap,
  );
  applyFormulas(plant, plantMap, colMap, 7, lastRow);

  /* ===== BTU METER ===== */
  const btu = workbook.addWorksheet("BTU METER");
  const btuMap = mapping.BTU_METER;

  layoutBtuMeterSheet(btu, fromDate, toDate, [
    "DATE",
    "TIME",
    ...Object.values(btuMap).map((m) => m.label),
  ]);

  colMap = buildColumnIndexMap(btu, btuMap);
  lastRow = writeRows(btu, dataByEquipment.BTU_METER, btuMap);
  applyFormulas(btu, btuMap, colMap, 7, lastRow);

  await workbook.xlsx.writeFile(filePath);
};
