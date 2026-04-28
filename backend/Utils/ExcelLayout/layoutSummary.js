function layoutSummarySheet(sheet, fromDate, toDate) {

  sheet.mergeCells('A1:E1');
  sheet.getCell('A1').value = 'CHILLER PLANT SUMMARY';
  sheet.getCell('A1').font = { bold: true, size: 14 };
  sheet.getCell('A1').alignment = { horizontal: 'center' };

  sheet.mergeCells('A2:E2');
  sheet.getCell('A2').value = `Report Date : ${new Date().toLocaleString()}`;
  sheet.getCell('A2').alignment = { horizontal: 'center' };

  sheet.mergeCells('A3:E3');
  sheet.getCell('A3').value = `From Date : ${fromDate}   To Date : ${toDate}`;
  sheet.getCell('A3').alignment = { horizontal: 'center' };

  sheet.mergeCells('A4:E4');
  sheet.getCell('A4').value = 'Unicharm, Sricity';
  sheet.getCell('A4').alignment = { horizontal: 'center' };

  sheet.addRow([]);

  sheet.mergeCells('A6:E6');
  const sec = sheet.getCell('A6');
  sec.value = 'New Chiller Plant Performance Details';
  sec.font = { bold: true };
  sec.alignment = { horizontal: 'center' };
  sec.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'C6EFCE' }
  };

  const header = sheet.addRow([
    'DESCRIPTION',
    'RUN HOURS',
    'COMMITTED KWH/DAY',
    'ACTUAL KWH/DAY',
    'DIFFERENCE'
  ]);

  header.eachCell(c => {
    c.font = { bold: true };
    c.alignment = { horizontal: 'center' };
    c.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  sheet.columns.forEach(col => col.width = 22);
}

module.exports = { layoutSummarySheet };
