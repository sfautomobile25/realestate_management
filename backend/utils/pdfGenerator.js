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

module.exports = { 
  generateTransactionPDF
};