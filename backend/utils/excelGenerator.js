const ExcelJS = require('exceljs');

const generateYearlyExcel = async (yearlySummary, transactions, year) => {
  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    
    // ========== SHEET 1: SUMMARY ==========
    const summarySheet = workbook.addWorksheet('Summary');
    
    // Company Header
    summarySheet.mergeCells('A1:F1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'SHAHFARID REAL ESTATE COMPANY';
    titleCell.font = { bold: true, size: 16, color: { argb: 'FF5722' } };
    titleCell.alignment = { horizontal: 'center' };
    
    summarySheet.mergeCells('A2:F2');
    summarySheet.getCell('A2').value = 'Ambika Sarak, Jhiltuli, Faridpur';
    summarySheet.getCell('A2').alignment = { horizontal: 'center' };
    
    summarySheet.mergeCells('A3:F3');
    summarySheet.getCell('A3').value = `YEARLY FINANCIAL REPORT - ${year}`;
    summarySheet.getCell('A3').font = { bold: true, size: 14 };
    summarySheet.getCell('A3').alignment = { horizontal: 'center' };
    
    // Summary Statistics
    summarySheet.getCell('A5').value = 'SUMMARY STATISTICS';
    summarySheet.getCell('A5').font = { bold: true, size: 12 };
    
    const summaryData = [
      ['Total Income', yearlySummary.totalIncome || 0],
      ['Total Expense', yearlySummary.totalExpense || 0],
      ['Yearly Balance', yearlySummary.yearlyBalance || 0],
      ['Total Transactions', yearlySummary.totalTransactions || 0]
    ];
    
    summarySheet.addRows(summaryData);
    
    // Format summary
    for (let i = 6; i <= 9; i++) {
      summarySheet.getCell(`A${i}`).font = { bold: true };
      summarySheet.getCell(`B${i}`).numFmt = '#,##0.00';
      summarySheet.getCell(`B${i}`).alignment = { horizontal: 'right' };
    }
    
    // ========== SHEET 2: DETAILED TRANSACTIONS ==========
    const detailSheet = workbook.addWorksheet('All Transactions');
    
    // Header
    detailSheet.mergeCells('A1:I1');
    detailSheet.getCell('A1').value = `DETAILED TRANSACTIONS - ${year}`;
    detailSheet.getCell('A1').font = { bold: true, size: 14 };
    detailSheet.getCell('A1').alignment = { horizontal: 'center' };
    
    // Column Headers
    const headers = [
      'SL', 'Date', 'Voucher No', 'Type', 'Category', 
      'Name', 'Description', 'Payment Method', 'Amount'
    ];
    
    detailSheet.addRow(headers);
    
    // Style headers
    const headerRow = detailSheet.getRow(2);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF5722' }
    };
    headerRow.alignment = { horizontal: 'center' };
    
    // Add transaction data
    let rowIndex = 3;
    let totalIncome = 0;
    let totalExpense = 0;
    
    transactions.forEach((transaction, index) => {
      const row = detailSheet.addRow([
        index + 1,
        new Date(transaction.date).toLocaleDateString('en-GB'),
        transaction.voucher_number || '-',
        transaction.type === 'income' ? 'Credit' : 'Debit',
        transaction.category || '-',
        transaction.name || '-',
        transaction.description || '-',
        transaction.payment_method || '-',
        parseFloat(transaction.amount || 0)
      ]);
      
      // Format amount column
      const amountCell = row.getCell(9);
      amountCell.numFmt = '#,##0.00';
      amountCell.alignment = { horizontal: 'right' };
      
      // Color code income/expense
      if (transaction.type === 'income') {
        amountCell.font = { color: { argb: '2E7D32' } }; // Green
        totalIncome += parseFloat(transaction.amount || 0);
      } else {
        amountCell.font = { color: { argb: 'C62828' } }; // Red
        totalExpense += parseFloat(transaction.amount || 0);
      }
      
      rowIndex++;
    });
    
    // Add totals row
    detailSheet.addRow([]);
    const totalRow = detailSheet.addRow([
      '', '', '', '', '', '', 'TOTAL INCOME:', '', totalIncome
    ]);
    totalRow.getCell(9).numFmt = '#,##0.00';
    totalRow.getCell(9).font = { bold: true, color: { argb: '2E7D32' } };
    
    const expenseRow = detailSheet.addRow([
      '', '', '', '', '', '', 'TOTAL EXPENSE:', '', totalExpense
    ]);
    expenseRow.getCell(9).numFmt = '#,##0.00';
    expenseRow.getCell(9).font = { bold: true, color: { argb: 'C62828' } };
    
    const netRow = detailSheet.addRow([
      '', '', '', '', '', '', 'NET BALANCE:', '', totalIncome - totalExpense
    ]);
    netRow.getCell(9).numFmt = '#,##0.00';
    netRow.getCell(9).font = { bold: true };
    
    // Set column widths
    detailSheet.columns = [
      { width: 8 },   // SL
      { width: 12 },  // Date
      { width: 15 },  // Voucher
      { width: 10 },  // Type
      { width: 20 },  // Category
      { width: 25 },  // Name
      { width: 30 },  // Description
      { width: 15 },  // Payment Method
      { width: 15 }   // Amount
    ];
    
    // ========== SHEET 3: MONTHLY BREAKDOWN ==========
    const monthlySheet = workbook.addWorksheet('Monthly Summary');
    
    // Header
    monthlySheet.mergeCells('A1:E1');
    monthlySheet.getCell('A1').value = `MONTHLY BREAKDOWN - ${year}`;
    monthlySheet.getCell('A1').font = { bold: true, size: 14 };
    monthlySheet.getCell('A1').alignment = { horizontal: 'center' };
    
    // Table Headers
    monthlySheet.addRow(['Month', 'Income', 'Expense', 'Net Balance', 'Transactions']);
    
    const headerRow2 = monthlySheet.getRow(2);
    headerRow2.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow2.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2196F3' }
    };
    headerRow2.alignment = { horizontal: 'center' };
    
    // Add monthly data
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    let rowNum = 3;
    months.forEach((month, index) => {
      const monthData = yearlySummary.monthlySummary?.[index] || { 
        income: 0, expense: 0, net: 0 
      };
      
      // Count transactions for this month
      const monthTransactions = transactions.filter(t => 
        new Date(t.date).getMonth() === index
      );
      
      monthlySheet.addRow([
        month,
        monthData.income || 0,
        monthData.expense || 0,
        monthData.net || 0,
        monthTransactions.length
      ]);
      
      // Format numbers
      ['B', 'C', 'D'].forEach(col => {
        monthlySheet.getCell(`${col}${rowNum}`).numFmt = '#,##0.00';
        monthlySheet.getCell(`${col}${rowNum}`).alignment = { horizontal: 'right' };
      });
      
      rowNum++;
    });
    
    // Add totals
    monthlySheet.addRow([
      'TOTAL',
      totalIncome,
      totalExpense,
      totalIncome - totalExpense,
      transactions.length
    ]);
    
    // Format total row
    const totalRow2 = monthlySheet.getRow(rowNum);
    totalRow2.font = { bold: true };
    ['B', 'C', 'D', 'E'].forEach(col => {
      totalRow2.getCell(col).numFmt = '#,##0.00';
      totalRow2.getCell(col).alignment = { horizontal: 'right' };
    });
    
    // Set column widths
    monthlySheet.columns = [
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 }
    ];
    
    // ========== SHEET 4: CATEGORY ANALYSIS ==========
    const categorySheet = workbook.addWorksheet('Category Analysis');
    
    // Income Categories
    categorySheet.mergeCells('A1:B1');
    categorySheet.getCell('A1').value = 'INCOME CATEGORIES';
    categorySheet.getCell('A1').font = { bold: true, size: 12 };
    
    categorySheet.addRow(['Category', 'Amount']);
    
    let catRow = 3;
    Object.entries(yearlySummary.incomeByCategory || {}).forEach(([category, amount]) => {
      categorySheet.addRow([category, amount]);
      categorySheet.getCell(`B${catRow}`).numFmt = '#,##0.00';
      catRow++;
    });
    
    // Expense Categories
    categorySheet.getCell('D1').value = 'EXPENSE CATEGORIES';
    categorySheet.getCell('D1').font = { bold: true, size: 12 };
    
    categorySheet.getCell('D2').value = 'Category';
    categorySheet.getCell('E2').value = 'Amount';
    
    catRow = 3;
    Object.entries(yearlySummary.expenseByCategory || {}).forEach(([category, amount]) => {
      categorySheet.getCell(`D${catRow}`).value = category;
      categorySheet.getCell(`E${catRow}`).value = amount;
      categorySheet.getCell(`E${catRow}`).numFmt = '#,##0.00';
      catRow++;
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