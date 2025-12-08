const ExcelJS = require('exceljs');

const generateYearlyExcel = async (yearlySummary, year) => {
  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    
    // Add company info sheet
    const infoSheet = workbook.addWorksheet('Company Info');
    
    // Company Header
    infoSheet.mergeCells('A1:E1');
    infoSheet.getCell('A1').value = 'SHAHFARID REAL ESTATE COMPANY';
    infoSheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF5722' } };
    infoSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    
    infoSheet.mergeCells('A2:E2');
    infoSheet.getCell('A2').value = 'Ambika Sarak, Jhiltuli, Faridpur';
    infoSheet.getCell('A2').font = { size: 12 };
    infoSheet.getCell('A2').alignment = { horizontal: 'center' };
    
    infoSheet.mergeCells('A3:E3');
    infoSheet.getCell('A3').value = `Yearly Financial Report - ${year}`;
    infoSheet.getCell('A3').font = { bold: true, size: 14 };
    infoSheet.getCell('A3').alignment = { horizontal: 'center' };
    
    infoSheet.mergeCells('A4:E4');
    infoSheet.getCell('A4').value = `Generated on: ${new Date().toLocaleDateString('en-GB')}`;
    infoSheet.getCell('A4').alignment = { horizontal: 'center' };
    
    // Summary Statistics
    infoSheet.getCell('A6').value = 'SUMMARY STATISTICS';
    infoSheet.getCell('A6').font = { bold: true, size: 12 };
    
    const summaryData = [
      ['Total Income', yearlySummary.totalIncome || 0],
      ['Total Expense', yearlySummary.totalExpense || 0],
      ['Yearly Balance', yearlySummary.yearlyBalance || 0],
      ['Total Transactions', yearlySummary.totalTransactions || 0]
    ];
    
    infoSheet.addRows(summaryData);
    
    // Format summary cells
    for (let i = 7; i <= 10; i++) {
      infoSheet.getCell(`A${i}`).font = { bold: true };
      infoSheet.getCell(`B${i}`).numFmt = '#,##0.00;[Red]-#,##0.00';
      infoSheet.getCell(`B${i}`).alignment = { horizontal: 'right' };
    }
    
    // Set column widths
    infoSheet.columns = [
      { width: 25 },
      { width: 20 }
    ];
    
    // Add Monthly Breakdown Sheet
    const monthlySheet = workbook.addWorksheet('Monthly Breakdown');
    
    // Monthly Header
    monthlySheet.mergeCells('A1:D1');
    monthlySheet.getCell('A1').value = `MONTHLY BREAKDOWN - ${year}`;
    monthlySheet.getCell('A1').font = { bold: true, size: 14 };
    monthlySheet.getCell('A1').alignment = { horizontal: 'center' };
    
    // Monthly Table Headers
    monthlySheet.getCell('A3').value = 'Month';
    monthlySheet.getCell('B3').value = 'Income';
    monthlySheet.getCell('C3').value = 'Expense';
    monthlySheet.getCell('D3').value = 'Net Balance';
    
    // Style headers
    ['A3', 'B3', 'C3', 'D3'].forEach(cell => {
      monthlySheet.getCell(cell).font = { bold: true, color: { argb: 'FFFFFF' } };
      monthlySheet.getCell(cell).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF5722' }
      };
      monthlySheet.getCell(cell).alignment = { horizontal: 'center' };
    });
    
    // Add monthly data
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    let row = 4;
    months.forEach((month, index) => {
      const monthData = yearlySummary.monthlySummary?.[index] || { income: 0, expense: 0, net: 0 };
      
      monthlySheet.getCell(`A${row}`).value = month;
      monthlySheet.getCell(`B${row}`).value = monthData.income || 0;
      monthlySheet.getCell(`C${row}`).value = monthData.expense || 0;
      monthlySheet.getCell(`D${row}`).value = monthData.net || 0;
      
      // Format numbers
      ['B', 'C', 'D'].forEach(col => {
        monthlySheet.getCell(`${col}${row}`).numFmt = '#,##0.00;[Red]-#,##0.00';
        monthlySheet.getCell(`${col}${row}`).alignment = { horizontal: 'right' };
      });
      
      row++;
    });
    
    // Add totals row
    monthlySheet.getCell(`A${row}`).value = 'TOTAL';
    monthlySheet.getCell(`A${row}`).font = { bold: true };
    monthlySheet.getCell(`B${row}`).value = yearlySummary.totalIncome || 0;
    monthlySheet.getCell(`C${row}`).value = yearlySummary.totalExpense || 0;
    monthlySheet.getCell(`D${row}`).value = yearlySummary.yearlyBalance || 0;
    
    // Format total row
    ['B', 'C', 'D'].forEach(col => {
      monthlySheet.getCell(`${col}${row}`).numFmt = '#,##0.00;[Red]-#,##0.00';
      monthlySheet.getCell(`${col}${row}`).font = { bold: true };
      monthlySheet.getCell(`${col}${row}`).alignment = { horizontal: 'right' };
    });
    
    // Set column widths
    monthlySheet.columns = [
      { width: 20 },
      { width: 15 },
      { width: 15 },
      { width: 15 }
    ];
    
    // Add Category Breakdown Sheet
    const categorySheet = workbook.addWorksheet('Category Breakdown');
    
    // Income Categories
    categorySheet.mergeCells('A1:B1');
    categorySheet.getCell('A1').value = 'INCOME CATEGORIES';
    categorySheet.getCell('A1').font = { bold: true, size: 12 };
    
    categorySheet.getCell('A2').value = 'Category';
    categorySheet.getCell('B2').value = 'Amount';
    
    // Style income headers
    categorySheet.getCell('A2').font = { bold: true };
    categorySheet.getCell('B2').font = { bold: true };
    
    let incomeRow = 3;
    Object.entries(yearlySummary.incomeByCategory || {}).forEach(([category, amount]) => {
      categorySheet.getCell(`A${incomeRow}`).value = category;
      categorySheet.getCell(`B${incomeRow}`).value = amount;
      categorySheet.getCell(`B${incomeRow}`).numFmt = '#,##0.00';
      incomeRow++;
    });
    
    // Expense Categories
    categorySheet.getCell('D1').value = 'EXPENSE CATEGORIES';
    categorySheet.getCell('D1').font = { bold: true, size: 12 };
    
    categorySheet.getCell('D2').value = 'Category';
    categorySheet.getCell('E2').value = 'Amount';
    
    // Style expense headers
    categorySheet.getCell('D2').font = { bold: true };
    categorySheet.getCell('E2').font = { bold: true };
    
    let expenseRow = 3;
    Object.entries(yearlySummary.expenseByCategory || {}).forEach(([category, amount]) => {
      categorySheet.getCell(`D${expenseRow}`).value = category;
      categorySheet.getCell(`E${expenseRow}`).value = amount;
      categorySheet.getCell(`E${expenseRow}`).numFmt = '#,##0.00';
      expenseRow++;
    });
    
    // Set column widths
    categorySheet.columns = [
      { width: 30 },
      { width: 15 },
      { width: 10 },
      { width: 30 },
      { width: 15 }
    ];
    
    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
    
  } catch (error) {
    console.error('Excel generation error:', error);
    throw error;
  }
};

module.exports = {
  generateYearlyExcel
};