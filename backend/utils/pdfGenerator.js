const PDFDocument = require('pdfkit');

const generateTransactionPDF = async (transactions, type, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        font: 'Helvetica' // Explicitly set font
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
      
      // Company Name (using simple text)
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
         .text(`${type.toUpperCase()} TRANSACTIONS REPORT`, 50, 100, {
           align: 'center',
           width: doc.page.width - 100
         });
      
      // Date Range
      doc.fontSize(10)
         .text(`From: ${new Date(startDate).toLocaleDateString('en-GB')} To: ${new Date(endDate).toLocaleDateString('en-GB')}`, 50, 130, {
           align: 'center',
           width: doc.page.width - 100
         });
      
      // Check if there are transactions
      if (transactions.length === 0) {
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
      const colWidth = {
        sl: 30,
        voucher: 80,
        date: 70,
        name: 100,
        desc: 150,
        amount: 80
      };
      
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('SL', 50, tableTop)
         .text('Voucher', 50 + colWidth.sl, tableTop)
         .text('Date', 50 + colWidth.sl + colWidth.voucher, tableTop)
         .text('Name', 50 + colWidth.sl + colWidth.voucher + colWidth.date, tableTop, { width: colWidth.name })
         .text('Description', 50 + colWidth.sl + colWidth.voucher + colWidth.date + colWidth.name, tableTop, { width: colWidth.desc })
         .text('Amount', doc.page.width - 50 - colWidth.amount, tableTop, { align: 'right' });
      
      // Line under header
      doc.moveTo(50, tableTop + 15)
         .lineTo(doc.page.width - 50, tableTop + 15)
         .lineWidth(0.5)
         .stroke();
      
      // Table Rows
      let y = tableTop + 25;
      let total = 0;
      let pageNumber = 1;
      
      transactions.forEach((transaction, index) => {
        // Check if we need a new page
        if (y > doc.page.height - 100) {
          doc.addPage();
          pageNumber++;
          y = 50;
          
          // Add header on new page
          doc.fontSize(10)
             .font('Helvetica')
             .text(`Page ${pageNumber} - ${type.toUpperCase()} Transactions`, 50, y, {
               align: 'center',
               width: doc.page.width - 100
             });
          
          y += 30;
          
          // Table header on new page
          doc.fontSize(9)
             .font('Helvetica-Bold')
             .text('SL', 50, y)
             .text('Voucher', 50 + colWidth.sl, y)
             .text('Date', 50 + colWidth.sl + colWidth.voucher, y)
             .text('Name', 50 + colWidth.sl + colWidth.voucher + colWidth.date, y, { width: colWidth.name })
             .text('Description', 50 + colWidth.sl + colWidth.voucher + colWidth.date + colWidth.name, y, { width: colWidth.desc })
             .text('Amount', doc.page.width - 50 - colWidth.amount, y, { align: 'right' });
          
          y += 20;
          
          // Line under header
          doc.moveTo(50, y - 5)
             .lineTo(doc.page.width - 50, y - 5)
             .lineWidth(0.5)
             .stroke();
          
          y += 10;
        }
        
        // Serial Number
        doc.fontSize(9)
           .font('Helvetica')
           .text((index + 1).toString(), 50, y);
        
        // Voucher Number
        doc.text(transaction.voucher_number || '-', 50 + colWidth.sl, y);
        
        // Date
        doc.text(new Date(transaction.date).toLocaleDateString('en-GB'), 50 + colWidth.sl + colWidth.voucher, y);
        
        // Name
        const name = transaction.name || '-';
        const shortName = name.length > 15 ? name.substring(0, 15) + '...' : name;
        doc.text(shortName, 50 + colWidth.sl + colWidth.voucher + colWidth.date, y, { 
          width: colWidth.name,
          ellipsis: true 
        });
        
        // Description
        const description = transaction.description || '-';
        const shortDesc = description.length > 25 ? description.substring(0, 25) + '...' : description;
        doc.text(shortDesc, 50 + colWidth.sl + colWidth.voucher + colWidth.date + colWidth.name, y, { 
          width: colWidth.desc,
          ellipsis: true 
        });
        
        // Amount - Fixed number formatting
        const amount = parseFloat(transaction.amount || 0);
        const amountText = '৳ ' + amount.toFixed(2);
        doc.text(amountText, doc.page.width - 50 - colWidth.amount, y, { 
          align: 'right'
        });
        
        total += amount;
        y += 15;
      });
      
      // Total Line
      doc.moveTo(50, y + 5)
         .lineTo(doc.page.width - 50, y + 5)
         .lineWidth(0.5)
         .stroke();
      
      // Total Amount
      y += 10;
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('TOTAL:', doc.page.width - 150, y)
         .text('৳ ' + total.toFixed(2), doc.page.width - 50, y, { align: 'right' });
      
      // Footer
      y = doc.page.height - 50;
      doc.fontSize(8)
         .fillColor('gray')
         .text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 50, y, {
           align: 'center',
           width: doc.page.width - 100
         });
      
      doc.text(`Total Transactions: ${transactions.length} | Total Amount: ৳ ${total.toFixed(2)}`, 
               50, y + 15, {
                 align: 'center',
                 width: doc.page.width - 100
               });
      
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