import React from 'react';
import { Box, Typography, Button, Divider, Paper } from '@mui/material';
import { Print } from '@mui/icons-material';

const Receipt = ({ payment, onClose }) => {
  const handlePrint = () => {
    const receiptContent = document.getElementById('receipt-content');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${payment.receipt_number}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
            }
            .receipt-container { 
              max-width: 500px; 
              margin: 0 auto; 
              border: 2px solid #000; 
              padding: 20px; 
            }
            .header { 
              text-align: center; 
              background: #ff5722; 
              color: white; 
              padding: 15px; 
              margin: -20px -20px 20px -20px;
            }
            .company-name { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 5px;
            }
            .receipt-title { 
              font-size: 18px; 
              margin-bottom: 10px;
            }
            .details { 
              margin: 20px 0; 
            }
            .detail-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 8px 0; 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              color: #666; 
            }
            .signature { 
              margin-top: 50px; 
              border-top: 1px solid #000; 
              padding-top: 10px; 
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="company-name">SHAHFARID REAL ESTATE COMPANY</div>
              <div class="receipt-title">PAYMENT RECEIPT</div>
            </div>
            
            <div class="details">
              <div class="detail-row">
                <strong>Receipt No:</strong> ${payment.receipt_number}
              </div>
              <div class="detail-row">
                <strong>Date:</strong> ${new Date(payment.payment_date).toLocaleDateString()}
              </div>
              <div class="detail-row">
                <strong>Time:</strong> ${new Date(payment.payment_date).toLocaleTimeString()}
              </div>
              <br>
              <div class="detail-row">
                <strong>Customer:</strong> ${payment.Customer?.first_name} ${payment.Customer?.last_name}
              </div>
              ${payment.Rental ? `
              <div class="detail-row">
                <strong>Unit:</strong> ${payment.Rental.Unit?.unit_number} - ${payment.Rental.Unit?.Building?.name}
              </div>
              ` : ''}
              <br>
              <div class="detail-row">
                <strong>Amount:</strong> $${payment.amount}
              </div>
              <div class="detail-row">
                <strong>Payment Method:</strong> ${payment.payment_method}
              </div>
              ${payment.reference_number ? `
              <div class="detail-row">
                <strong>Reference:</strong> ${payment.reference_number}
              </div>
              ` : ''}
              ${payment.notes ? `
              <div class="detail-row">
                <strong>Notes:</strong> ${payment.notes}
              </div>
              ` : ''}
            </div>

            <Divider style={{margin: '20px 0'}} />
            
            <div class="footer">
              <div class="signature">
                <p>Authorized Signature</p>
              </div>
              <p>Thank you for your payment!</p>
              <p>SHAHFARID REAL ESTATE COMPANY</p>
              <p>Contact: [Your Company Phone] | Email: [Your Company Email]</p>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={!!payment} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Payment Receipt</DialogTitle>
      <DialogContent>
        <Paper id="receipt-content" sx={{ p: 3, border: '2px solid #000' }}>
          {/* Receipt Header */}
          <Box sx={{ 
            textAlign: 'center', 
            bgcolor: '#ff5722', 
            color: 'white', 
            py: 2, 
            mx: -3, 
            mt: -3,
            mb: 3
          }}>
            <Typography variant="h5" fontWeight="bold">
              SHAHFARID REAL ESTATE COMPANY
            </Typography>
            <Typography variant="h6">
              PAYMENT RECEIPT
            </Typography>
          </Box>

          {/* Receipt Details */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography fontWeight="bold">Receipt No:</Typography>
              <Typography>{payment?.receipt_number}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography fontWeight="bold">Date:</Typography>
              <Typography>{new Date(payment?.payment_date).toLocaleDateString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography fontWeight="bold">Time:</Typography>
              <Typography>{new Date(payment?.payment_date).toLocaleTimeString()}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography fontWeight="bold">Customer:</Typography>
              <Typography>{payment?.Customer?.first_name} {payment?.Customer?.last_name}</Typography>
            </Box>
            
            {payment?.Rental && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography fontWeight="bold">Unit:</Typography>
                <Typography>
                  {payment.Rental.Unit?.unit_number} - {payment.Rental.Unit?.Building?.name}
                </Typography>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography fontWeight="bold">Amount:</Typography>
              <Typography variant="h6" color="primary">
                $${payment?.amount}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography fontWeight="bold">Payment Method:</Typography>
              <Typography>{payment?.payment_method}</Typography>
            </Box>
            {payment?.reference_number && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography fontWeight="bold">Reference:</Typography>
                <Typography>{payment.reference_number}</Typography>
              </Box>
            )}
            {payment?.notes && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography fontWeight="bold">Notes:</Typography>
                <Typography>{payment.notes}</Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />
          
          {/* Footer */}
          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            <Box sx={{ mt: 6, borderTop: '1px solid', pt: 1 }}>
              <Typography>Authorized Signature</Typography>
            </Box>
            <Typography sx={{ mt: 2 }}>Thank you for your payment!</Typography>
            <Typography fontWeight="bold">SHAHFARID REAL ESTATE COMPANY</Typography>
            <Typography variant="body2">Contact: [Your Company Phone] | Email: [Your Company Email]</Typography>
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button 
          variant="contained" 
          startIcon={<Print />}
          onClick={handlePrint}
        >
          Print Receipt
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Receipt;