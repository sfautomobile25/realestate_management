const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Use a font that supports Bengali characters
const registerFonts = (doc) => {
  try {
    // Try to register Noto Sans Bengali if available
    const fontPath = path.join(__dirname, '../fonts/NotoSansBengali-Regular.ttf');
    if (fs.existsSync(fontPath)) {
      doc.registerFont('NotoSansBengali', fontPath);
      return 'NotoSansBengali';
    }
  } catch (error) {
    console.log('Custom font not found, using default');
  }
  return 'Helvetica';
};

const generateTransactionPDF = async (transactions, type, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        autoFirstPage: false
      });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      // Helper function to format numbers
      const formatNumber = (num) => {
        return parseFloat(num || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      };
      
      // Add first page
      doc.addPage();
      
      // Header with orange background
      doc.rect(0, 0, doc.page.width, 100)
         .fill('#FF5722');
      
      // Company Name
      doc.fillColor('white')
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('SHAHFARID REAL ESTATE COMPANY', 50, 30, {
           align: 'center',
           width: doc.page.width - 100
         });
      
      // Address
      doc.fontSize(10)
         .font('Helvetica')
         .text('Ambika Sarak, Jhiltuli, Faridpur', 50, 60, {
           align: 'center',
           width: doc.page.width - 100
         });
      
      // Report Title
      doc.fillColor('black')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(`${type.toUpperCase()} TRANSACTIONS REPORT`, 50, 100, {
           align: 'center',
           width: doc.page.width - 100
         });
      
      // Date Range
      const startStr = new Date(startDate).toLocaleDateString('en-GB');
      const endStr = new Date(endDate).toLocaleDateString('en-GB');
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Period: ${startStr} to ${endStr}`, 50, 130, {
           align: 'center',
           width: doc.page.width - 100
         });
      
      // Check if there are transactions
      if (!transactions || transactions.length === 0) {
        doc.fontSize(12)
           .text('No transactions found for the selected period.', 50, 180, {
             align: 'center',
             width: doc.page.width - 100
           });
        doc.end();
        return;
      }
      
      // Table Header
      const tableTop = 180;
      const colPositions = {
        sl: 50,
        voucher: 80,
        date: 160,
        name: 220,
        desc: 320,
        amount: 500
      };
      
      const colWidths = {
        sl: 30,
        voucher: 80,
        date: 60,
        name: 100,
        desc: 180,
        amount: 60
      };
      
      // Draw header background
      doc.rect(colPositions.sl, tableTop - 5, doc.page.width - 100, 20)
         .fill('#f5f5f5');
      
      // Header text
      doc.fillColor('black')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('SL', colPositions.sl, tableTop)
         .text('Voucher', colPositions.voucher, tableTop)
         .text('Date', colPositions.date, tableTop)
         .text('Name', colPositions.name, tableTop)
         .text('Description', colPositions.desc, tableTop)
         .text('Amount', colPositions.amount, tableTop, { align: 'right' });
      
      // Table data
      let y = tableTop + 25;
      let total = 0;
      
      doc.fontSize(9)
         .font('Helvetica');
      
      transactions.forEach((transaction, index) => {
        // Check for page break
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = 50;
          
          // Header on new page
          doc.fillColor('black')
             .fontSize(10)
             .font('Helvetica-Bold')
             .text(`${type.toUpperCase()} TRANSACTIONS - Continued`, 50, y, {
               align: 'center',
               width: doc.page.width - 100
             });
          
          y += 30;
          
          // Draw header background on new page
          doc.rect(colPositions.sl, y - 5, doc.page.width - 100, 20)
             .fill('#f5f5f5');
          
          // Header text on new page
          doc.fillColor('black')
             .fontSize(10)
             .font('Helvetica-Bold')
             .text('SL', colPositions.sl, y)
             .text('Voucher', colPositions.voucher, y)
             .text('Date', colPositions.date, y)
             .text('Name', colPositions.name, y)
             .text('Description', colPositions.desc, y)
             .text('Amount', colPositions.amount, y, { align: 'right' });
          
          y += 25;
        }
        
        // Serial Number
        doc.text((index + 1).toString(), colPositions.sl, y);
        
        // Voucher Number
        doc.text(transaction.voucher_number || '-', colPositions.voucher, y);
        
        // Date
        const date = new Date(transaction.date);
        const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        doc.text(dateStr, colPositions.date, y);
        
        // Name
        const name = transaction.name || '-';
        const shortName = name.length > 15 ? name.substring(0, 15) + '...' : name;
        doc.text(shortName, colPositions.name, y, { width: colWidths.name });
        
        // Description
        const description = transaction.description || '-';
        const shortDesc = description.length > 25 ? description.substring(0, 25) + '...' : description;
        doc.text(shortDesc, colPositions.desc, y, { width: colWidths.desc });
        
        // Amount - FIXED FORMATTING
        const amount = parseFloat(transaction.amount || 0);
        const amountText = `৳ ${formatNumber(amount)}`;
        doc.text(amountText, colPositions.amount, y, { align: 'right' });
        
        total += amount;
        y += 15;
      });
      
      // Total line
      doc.moveTo(colPositions.sl, y + 5)
         .lineTo(doc.page.width - 50, y + 5)
         .lineWidth(1)
         .stroke();
      
      y += 10;
      
      // Total amount
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('TOTAL:', colPositions.desc, y)
         .text(`৳ ${formatNumber(total)}`, colPositions.amount, y, { align: 'right' });
      
      // Footer
      const footerY = doc.page.height - 50;
      doc.fontSize(8)
         .fillColor('gray')
         .font('Helvetica')
         .text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 
               50, footerY, { align: 'center', width: doc.page.width - 100 });
      
      doc.text(`Total Transactions: ${transactions.length} | Total Amount: ৳ ${formatNumber(total)}`, 
               50, footerY + 15, { align: 'center', width: doc.page.width - 100 });
      
      doc.end();
      
    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
};

const generateYearlyPDF = async (yearlySummary, year) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        font: 'Helvetica'
      });
      
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      // Header with orange background
      doc.fillColor('#FF5722')
         .rect(0, 0, doc.page.width, 100)
         .fill();
      
      // Company Name
      doc.fillColor('white')
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('SHAHFARID REAL ESTATE COMPANY', 50, 30, {
           align: 'center',
           width: doc.page.width - 100
         });
      
      // Address
      doc.fontSize(10)
         .text('Ambika Sarak, Jhiltuli, Faridpur', 50, 60, {
           align: 'center',
           width: doc.page.width - 100
         });
      
      // Report Title
      doc.fillColor('black')
         .fontSize(16)
         .text(`YEARLY FINANCIAL REPORT - ${year}`, 50, 100, {
           align: 'center',
           width: doc.page.width - 100
         });
      
      // Generated Date
      doc.fontSize(10)
         .text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 50, 130, {
           align: 'center',
           width: doc.page.width - 100
         });
      
      let y = 160;
      
      // Summary Statistics
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('SUMMARY STATISTICS', 50, y);
      
      y += 20;
      
      const summaryData = [
        { label: 'Total Income', value: yearlySummary.totalIncome || 0, color: '#4caf50' },
        { label: 'Total Expense', value: yearlySummary.totalExpense || 0, color: '#f44336' },
        { label: 'Yearly Balance', value: yearlySummary.yearlyBalance || 0, color: '#2196f3' },
        { label: 'Total Transactions', value: yearlySummary.totalTransactions || 0, color: '#ff9800' }
      ];
      
      summaryData.forEach(item => {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('black')
           .text(item.label + ':', 70, y);
        
        doc.font('Helvetica-Bold')
           .fillColor(item.color)
           .text(item.value.toLocaleString('en-IN'), doc.page.width - 150, y, { align: 'right' });
        
        y += 20;
      });
      
      y += 10;
      
      // Monthly Breakdown
      doc.addPage();
      y = 50;
      
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('black')
         .text(`MONTHLY BREAKDOWN - ${year}`, 50, y, {
           align: 'center',
           width: doc.page.width - 100
         });
      
      y += 30;
      
      // Table Header
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('white')
         .rect(50, y, doc.page.width - 100, 20)
         .fill('#FF5722');
      
      doc.text('Month', 60, y + 5);
      doc.text('Income', 200, y + 5);
      doc.text('Expense', 300, y + 5);
      doc.text('Net Balance', 400, y + 5);
      
      y += 25;
      
      // Monthly Data
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      months.forEach((month, index) => {
        const monthData = yearlySummary.monthlySummary?.[index] || { income: 0, expense: 0, net: 0 };
        
        // Check for new page
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = 50;
        }
        
        // Month name
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('black')
           .text(month, 60, y);
        
        // Income
        doc.fillColor('#4caf50')
           .text('৳' + (monthData.income || 0).toFixed(2), 200, y);
        
        // Expense
        doc.fillColor('#f44336')
           .text('৳' + (monthData.expense || 0).toFixed(2), 300, y);
        
        // Net Balance
        const netColor = monthData.net >= 0 ? '#4caf50' : '#f44336';
        doc.fillColor(netColor)
           .font('Helvetica-Bold')
           .text('৳' + (monthData.net || 0).toFixed(2), 400, y);
        
        y += 20;
      });
      
      // Category Breakdown
      doc.addPage();
      y = 50;
      
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('black')
         .text('CATEGORY BREAKDOWN', 50, y, {
           align: 'center',
           width: doc.page.width - 100
         });
      
      y += 30;
      
      // Income Categories
      doc.fontSize(12)
         .text('INCOME CATEGORIES', 50, y);
      
      y += 20;
      
      Object.entries(yearlySummary.incomeByCategory || {}).forEach(([category, amount]) => {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('black')
           .text(category, 70, y);
        
        doc.fillColor('#4caf50')
           .text('৳' + amount.toFixed(2), doc.page.width - 150, y, { align: 'right' });
        
        y += 15;
      });
      
      y += 20;
      
      // Expense Categories
      doc.fontSize(12)
         .text('EXPENSE CATEGORIES', 50, y);
      
      y += 20;
      
      Object.entries(yearlySummary.expenseByCategory || {}).forEach(([category, amount]) => {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('black')
           .text(category, 70, y);
        
        doc.fillColor('#f44336')
           .text('৳' + amount.toFixed(2), doc.page.width - 150, y, { align: 'right' });
        
        y += 15;
      });
      
      // Footer
      const footerY = doc.page.height - 50;
      
      doc.fontSize(8)
         .fillColor('gray')
         .text('Generated by SHAHFARID REAL ESTATE COMPANY - Accounts Management System', 
               50, footerY, {
                 align: 'center',
                 width: doc.page.width - 100
               });
      
      doc.text('This report is confidential and for internal use only', 
               50, footerY + 15, {
                 align: 'center',
                 width: doc.page.width - 100
               });
      
      doc.end();
    } catch (error) {
      console.error('Yearly PDF Generation Error:', error);
      reject(error);
    }
  });
};

// Update exports
module.exports = { 
  generateTransactionPDF,
  generateYearlyPDF
};