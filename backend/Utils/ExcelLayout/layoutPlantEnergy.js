const plantLayout = require('../../Config/plantEnergyLayout');

function layoutPlantEnergySheet(sheet, fromDate, toDate) {

  sheet.views = [{ state: 'frozen', ySplit: 7 }];

  /* ===== CALCULATE TOTAL COLUMNS ===== */
  const totalCols =
    plantLayout.leftFixed.length +
    plantLayout.groups.reduce((s, g) => s + g.columns.length, 0);

  /* ===== TITLE ===== */

  sheet.mergeCells(1, 1, 1, totalCols);
  sheet.getCell('A1').value = 'CHILLER PLANT ENERGY PERFORMANCE';
  sheet.getCell('A1').font = { bold: true, size: 14 };
  sheet.getCell('A1').alignment = { horizontal: 'center' };

  sheet.mergeCells(2, 1, 2, totalCols);
  sheet.getCell('A2').value = `Report Date : ${new Date().toLocaleString()}`;
  sheet.getCell('A2').alignment = { horizontal: 'center' };

  sheet.mergeCells(3, 1, 3, totalCols);
  sheet.getCell('A3').value = `From Date : ${fromDate}   To Date : ${toDate}`;
  sheet.getCell('A3').alignment = { horizontal: 'center' };

  sheet.mergeCells(4, 1, 4, totalCols);
  sheet.getCell('A4').value = 'Unicharm, Sricity';
  sheet.getCell('A4').alignment = { horizontal: 'center' };

  sheet.addRow([]);

  /* =====================================================
     GROUP HEADER ROW (LEVEL 1)
     ===================================================== */
  const groupRow = sheet.addRow([]);
  let colIndex = 1;

  // Date & Time merged header
  sheet.mergeCells(groupRow.number, colIndex, groupRow.number, colIndex + 1);
  sheet.getCell(groupRow.number, colIndex).value = 'Date & Time';
  colIndex += 2;

  // Equipment groups
  plantLayout.groups.forEach(group => {
    const span = group.columns.length;
    sheet.mergeCells(groupRow.number, colIndex, groupRow.number, colIndex + span - 1);
    sheet.getCell(groupRow.number, colIndex).value = group.title;
    colIndex += span;
  });

  styleGroupRow(groupRow, sheet);

  /* =====================================================
     COLUMN HEADER ROW (LEVEL 2)
     ===================================================== */
  const headerRow = sheet.addRow([]);
  colIndex = 1;

  plantLayout.leftFixed.forEach(col => {
    sheet.getCell(headerRow.number, colIndex++).value = col.label;
  });

  plantLayout.groups.forEach(group => {
    group.columns.forEach(col => {
      sheet.getCell(headerRow.number, colIndex++).value = col.label;
    });
  });

  styleHeaderRow(headerRow);

  /* ===== WIDTH ===== */
  sheet.columns.forEach(c => c.width = 18);
}

/* ================= STYLES ================= */

function styleGroupRow(row, sheet) {
  row.eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E7F3FF' } // group header color
    };
    cell.border = thinBorder();
  });
}

function styleHeaderRow(row) {
  row.height = 40;
  row.eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'CFEFFF' }
    };
    cell.border = thinBorder();
  });
}

function thinBorder() {
  return {
    top: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
    right: { style: 'thin' }
  };
}

module.exports = { layoutPlantEnergySheet };
