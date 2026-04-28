function layoutBtuMeterSheet(sheet, fromDate, toDate, headers) {

  sheet.views = [{ state: 'frozen', ySplit: 6 }];

  const totalCols = headers.length;

  sheet.mergeCells(1, 1, 1, totalCols);
  sheet.getCell('A1').value = 'BTU METER PERFORMANCE REPORT';
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

  const headerRow = sheet.addRow(headers);
  headerRow.height = 40;

  headerRow.eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'CFEFFF' }
    };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  sheet.columns.forEach(col => col.width = 20);
}

module.exports = { layoutBtuMeterSheet };
