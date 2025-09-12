import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Printer, Copy, CheckCircle, AlertCircle, Users, Plus, Minus, Mail, Download, Eye, Info, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface VoucherGeneratorProps {
  institutionId: string;
  institutionName: string;
}

interface VoucherData {
  code: string;
  value: number;
  learnerCount: number;
  parentName: string;
  parentEmail: string;
  notes?: string;
  status: 'active' | 'redeemed' | 'expired' | 'cancelled';
  expiryDate: string;
  generatedAt: string;
  institutionName: string;
}

// Each learner subscribes with R5.00, so voucher amount = learnerCount × R5.00
const LEARNER_SUBSCRIPTION_AMOUNT = 5;

export function VoucherGenerator({ institutionId, institutionName }: VoucherGeneratorProps) {
  const [learnerCount, setLearnerCount] = useState<number>(1);
  const [parentName, setParentName] = useState<string>('');
  const [parentEmail, setParentEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState<VoucherData | null>(null);
  const [copied, setCopied] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showSalesReport, setShowSalesReport] = useState(false);

  // Calculate voucher amount based on learner count (R5.00 per learner)
  const voucherAmount = learnerCount * LEARNER_SUBSCRIPTION_AMOUNT;

  // Function to load and convert logo to base64
  const loadLogoAsBase64 = async (): Promise<string | null> => {
    try {
      // Try to load the logo from the public images folder
      const logoPath = '/images/psc%20tech.png';
      const response = await fetch(logoPath);
      if (!response.ok) throw new Error('Logo not found');
      
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Could not load logo:', error);
      return null;
    }
  };

  // Calculate monthly voucher sales statistics
  const getMonthlySalesStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // For now, we'll use mock data since we don't have access to all vouchers
    // In a real implementation, this would come from a database or store
    // Each learner subscribes with R5.00, so values should be multiples of 5
    const mockMonthlyVouchers = [
      { value: 10, createdAt: new Date().toISOString() }, // 2 learners × R5
      { value: 15, createdAt: new Date().toISOString() }, // 3 learners × R5
      { value: 10, createdAt: new Date().toISOString() }, // 2 learners × R5
      { value: 25, createdAt: new Date().toISOString() }, // 5 learners × R5
      { value: 20, createdAt: new Date().toISOString() }  // 4 learners × R5
    ];
    
    const monthlyVouchers = mockMonthlyVouchers.filter(voucher => {
      const voucherDate = new Date(voucher.createdAt);
      return voucherDate.getMonth() === currentMonth && voucherDate.getFullYear() === currentYear;
    });
    
    const totalVouchers = monthlyVouchers.length;
    const totalAmount = monthlyVouchers.reduce((sum, voucher) => sum + (voucher.value || 0), 0);
    
    // Group by denomination
    const denominationBreakdown = monthlyVouchers.reduce((acc, voucher) => {
      const value = voucher.value || 0;
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return {
      totalVouchers,
      totalAmount,
      denominationBreakdown,
      month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  };

  // Generate sales report PDF
  const generateSalesReportPDF = async () => {
    try {
      const stats = getMonthlySalesStats();
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add PSC Tech branding header
      pdf.setFillColor(31, 41, 55);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Add PSC Tech logo
      try {
        const logoBase64 = await loadLogoAsBase64();
        if (logoBase64) {
          pdf.addImage(logoBase64, 'PNG', 10, 10, 30, 30);
        } else {
          throw new Error('Logo not loaded');
        }
      } catch (logoError) {
        // Fallback to text if logo fails
        pdf.setFillColor(255, 255, 255);
        pdf.circle(25, 20, 15, 'F');
        pdf.setTextColor(31, 41, 55);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PSC', 25, 25, { align: 'center' });
      }
      
      // Add PSC Tech branding
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PSC Tech', 50, 25);
      pdf.setFontSize(14);
      pdf.text('Voucher Sales Report', 50, 35);
      
      // Add institution name
      pdf.setFontSize(16);
      pdf.text(institutionName, pageWidth - 20, 25, { align: 'right' });
      
      // Add report title
      pdf.setFillColor(245, 245, 245);
      pdf.rect(10, 50, pageWidth - 20, 20, 'F');
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`VOUCHER SALES REPORT - ${stats.month}`, pageWidth / 2, 65, { align: 'center' });
      
      // Add summary statistics
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Monthly Summary:', 20, 90);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.text(`Total Vouchers Sold: ${stats.totalVouchers}`, 20, 105);
      pdf.text(`Total Revenue: R${stats.totalAmount.toFixed(2)}`, 20, 115);
      pdf.text(`Report Period: ${stats.month}`, 20, 125);
      pdf.text(`Institution: ${institutionName}`, 20, 135);
      
      // Add denomination breakdown
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('Denomination Breakdown:', 20, 155);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      let yPos = 170;
      Object.entries(stats.denominationBreakdown)
        .sort(([a], [b]) => Number(a) - Number(b))
        .forEach(([denomination, count]) => {
          const amount = Number(denomination) * count;
          pdf.text(`R${denomination}: ${count} vouchers = R${amount.toFixed(2)}`, 20, yPos);
          yPos += 10;
        });
      
      // Add chart placeholder
      pdf.setFillColor(248, 250, 252);
      pdf.rect(20, 220, pageWidth - 40, 40, 'F');
      pdf.setTextColor(107, 114, 128);
      pdf.setFontSize(10);
      pdf.text('Sales Chart Visualization', pageWidth / 2, 240, { align: 'center' });
      pdf.text('(Chart would be generated in production)', pageWidth / 2, 250, { align: 'center' });
      
      // Add enhanced footer with Nkanyezi Tech Solutions branding
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F');
      
      // Add separator line
      pdf.setDrawColor(209, 213, 219);
      pdf.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);
      
      // Add footer content
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      
      // Left side - Generation info
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, pageHeight - 15);
      
      // Center - PSC Tech branding
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.text('PSC Tech', pageWidth / 2, pageHeight - 20, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(156, 163, 175);
      pdf.text('Powered by Nkanyezi Tech Solutions (Pty) Ltd', pageWidth / 2, pageHeight - 15, { align: 'center' });
      pdf.text('Reg: 2025/606307/07', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Right side - Contact info
      pdf.setTextColor(107, 114, 128);
      pdf.text('www.psctech.co.za', pageWidth - 20, pageHeight - 15, { align: 'right' });
      pdf.text('info@psctech.co.za', pageWidth - 20, pageHeight - 10, { align: 'right' });
      
      // Save the PDF
      pdf.save(`PSC_Tech_Sales_Report_${stats.month.replace(' ', '_')}.pdf`);
      toast.success('Sales report PDF downloaded successfully!');
      
    } catch (error) {
      console.error('Error generating sales report PDF:', error);
      toast.error('Failed to generate sales report PDF. Please try again.');
    }
  };

  const generateVoucher = async () => {
          if (!parentName.trim()) {
        toast.error('Please enter parent name');
        return;
      }

    if (learnerCount < 1 || learnerCount > 10) {
      toast.error('Learner count must be between 1 and 10');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock voucher code (replace with actual API response)
      const code = generateVoucherCode();
      
      const voucher: VoucherData = {
        code,
        value: voucherAmount,
        learnerCount,
        parentName: parentName.trim(),
        parentEmail: parentEmail.trim(),
        notes: notes.trim() || undefined,
        status: 'active',
        expiryDate: 'Pending Redemption', // Will be set to 30 days after redemption
        generatedAt: new Date().toISOString(),
        institutionName
      };
      
      setGeneratedVoucher(voucher);
      toast.success(`R${voucherAmount} voucher generated for ${learnerCount} learner(s)!`);
      
      // Reset form
      setParentName('');
      setParentEmail('');
      setNotes('');
      setLearnerCount(1);
    } catch (error) {
      toast.error('Failed to generate voucher. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVoucherCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 1, 0
    let result = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) result += '-';
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateVoucherPDF = async () => {
    if (!generatedVoucher) return;
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add PSC Tech branding header
      pdf.setFillColor(31, 41, 55);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Add PSC Tech logo
      try {
        const logoBase64 = await loadLogoAsBase64();
        if (logoBase64) {
          pdf.addImage(logoBase64, 'PNG', 10, 10, 30, 30);
        } else {
          throw new Error('Logo not loaded');
        }
      } catch (logoError) {
        // Fallback to text if logo fails
        pdf.setFillColor(255, 255, 255);
        pdf.circle(25, 20, 15, 'F');
        pdf.setTextColor(31, 41, 55);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PSC', 25, 25, { align: 'center' });
      }
      
      // Add PSC Tech branding
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PSC Tech', 50, 25);
      pdf.setFontSize(14);
      pdf.text('Digital Voucher System', 50, 35);
      
      // Add institution name
      pdf.setFontSize(16);
      pdf.text(institutionName, pageWidth - 20, 25, { align: 'right' });
      
      // Add voucher title
      pdf.setFillColor(245, 245, 245);
      pdf.rect(10, 50, pageWidth - 20, 20, 'F');
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VOUCHER CERTIFICATE', pageWidth / 2, 65, { align: 'center' });
      
      // Add voucher code (prominently displayed)
      pdf.setFillColor(59, 130, 246);
      pdf.rect(20, 80, pageWidth - 40, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(generatedVoucher.code, pageWidth / 2, 95, { align: 'center' });
      
      // Add voucher details
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      const detailsY = 120;
      pdf.text('Voucher Details:', 20, detailsY);
      
      pdf.text(`Value: R${generatedVoucher.value}`, 20, detailsY + 15);
      pdf.text(`Parent/Guardian: ${generatedVoucher.parentName}`, 20, detailsY + 25);
      pdf.text(`Email: ${generatedVoucher.parentEmail}`, 20, detailsY + 35);
      pdf.text(`Number of Learners: ${generatedVoucher.learnerCount}`, 20, detailsY + 45);
      pdf.text(`Generated: ${new Date(generatedVoucher.generatedAt).toLocaleDateString()}`, 20, detailsY + 55);
      pdf.text(`Expires: 30 days after redemption`, 20, detailsY + 65);
      
      if (generatedVoucher.notes) {
        pdf.text(`Notes: ${generatedVoucher.notes}`, 20, detailsY + 75);
      }
      
      // Add redemption instructions
      pdf.setFillColor(254, 243, 199);
      pdf.rect(20, 160, pageWidth - 40, 30, 'F');
      pdf.setTextColor(120, 53, 15);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Redemption Instructions:', 25, 175);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('1. Visit the voucher redemption page', 25, 185);
      pdf.text('2. Enter the voucher code above', 25, 195);
      pdf.text('3. Complete learner registration process', 25, 205);
      
      // Add terms and conditions
      pdf.setFillColor(243, 244, 246);
      pdf.rect(20, 200, pageWidth - 40, 40, 'F');
      pdf.setTextColor(107, 114, 128);
      pdf.setFontSize(8);
      pdf.text('Terms & Conditions:', 25, 215);
      pdf.text('• This voucher activates dashboard access for the specified number of learners', 25, 225);
      pdf.text('• Valid for 30 days after redemption', 25, 235);
      pdf.text('• Not exchangeable for cash or other services', 25, 245);
      pdf.text('• Subject to PSC Tech terms of service', 25, 255);
      
      // Add enhanced footer with Nkanyezi Tech Solutions branding
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F');
      
      // Add separator line
      pdf.setDrawColor(209, 213, 219);
      pdf.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);
      
      // Add footer content
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      
      // Left side - Generation info
      pdf.text(`Generated by PSC Tech System on ${new Date().toLocaleDateString()}`, 20, pageHeight - 15);
      
      // Center - PSC Tech branding
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.text('PSC Tech', pageWidth / 2, pageHeight - 20, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(156, 163, 175);
      pdf.text('Powered by Nkanyezi Tech Solutions', pageWidth / 2, pageHeight - 15, { align: 'center' });
      
      // Right side - Contact info
      pdf.setTextColor(107, 114, 128);
      pdf.text('www.psctech.co.za', pageWidth - 20, pageHeight - 15, { align: 'right' });
      pdf.text('info@psctech.co.za', pageWidth - 20, pageHeight - 10, { align: 'right' });
      
      // Save the PDF
      pdf.save(`PSC_Tech_Voucher_${generatedVoucher.code}.pdf`);
      toast.success('Voucher PDF downloaded successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const copyToClipboard = async () => {
    if (!generatedVoucher) return;
    
    try {
      await navigator.clipboard.writeText(generatedVoucher.code);
      setCopied(true);
      toast.success('Voucher code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy voucher code');
    }
  };

  const printVoucher = () => {
    if (!generatedVoucher) return;
    
    // Create a temporary iframe for printing to avoid navigation issues
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    
    document.body.appendChild(printFrame);
    
    const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>PSC Tech Voucher - R${generatedVoucher.value}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              background: white;
            }
            .voucher-card { 
              border: 2px solid #000; 
              border-radius: 12px; 
              padding: 20px; 
              max-width: 400px; 
              margin: 0 auto; 
              background: white;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .code { 
              font-size: 24px; 
              font-weight: bold; 
              letter-spacing: 2px; 
              text-align: center; 
              margin: 20px 0; 
              padding: 15px; 
              background: #f5f5f5; 
              border-radius: 8px; 
            }
            .details { margin: 20px 0; }
            .row { 
              display: flex; 
              justify-content: space-between; 
              margin: 10px 0; 
              padding: 5px 0;
            }
            .qr-placeholder { 
              width: 100px; 
              height: 100px; 
              background: #f0f0f0; 
              border: 1px solid #ccc; 
              margin: 20px auto; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
            }
            .terms { 
              font-size: 12px; 
              color: #666; 
              margin-top: 20px; 
              text-align: center; 
            }
            .logo-section { 
              text-align: center; 
              margin-bottom: 15px; 
            }
            .footer { margin-top: 20px; }
            @media print { 
              body { margin: 0; } 
              .voucher-card { border: none; } 
            }
          </style>
        </head>
        <body>
          <div class="voucher-card">
            <div class="header">
              <div class="logo-section">
                <img src="${window.location.origin}/images/psc%20tech.png" alt="PSC Tech Logo" style="width: 60px; height: 60px; object-fit: contain; margin-bottom: 10px; display: block; margin: 0 auto 10px auto;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div style="display: none; width: 60px; height: 60px; background: #1f2937; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; margin: 0 auto 10px auto;">PSC</div>
              </div>
              <h2>PSC Tech Voucher</h2>
              <p>${institutionName}</p>
            </div>
            <div class="code">${generatedVoucher.code}</div>
            <div class="details">
              <div class="row"><span>Value:</span><span>R${generatedVoucher.value}</span></div>
              <div class="row"><span>Parent:</span><span>${generatedVoucher.parentName}</span></div>
              <div class="row"><span>Learners:</span><span>${generatedVoucher.learnerCount}</span></div>
              <div class="row"><span>Expires:</span><span>30 days after redemption</span></div>
              ${generatedVoucher.notes ? `<div class="row"><span>Notes:</span><span>${generatedVoucher.notes}</span></div>` : ''}
            </div>
            <div class="qr-placeholder">QR Code</div>
            <div class="terms">
              Redeem at: ${window.location.origin}/vouchers<br/>
              This voucher activates dashboard access for ${generatedVoucher.learnerCount} learner(s).<br/>
              Valid for 30 days after redemption. Not exchangeable for cash.
            </div>
            <div class="footer">
              <p style="text-align: center; font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">
                <strong>Powered by Nkanyezi Tech Solutions</strong>
              </p>
            </div>
          </div>
        </body>
        </html>
      `);
      frameDoc.close();
      
      // Wait for content to load, then print
      printFrame.onload = () => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
          
          // Clean up the iframe after printing
          setTimeout(() => {
            document.body.removeChild(printFrame);
          }, 1000);
        } catch (error) {
          console.warn('Print failed:', error);
          // Fallback to window.open method
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(frameDoc.documentElement.outerHTML);
            printWindow.document.close();
            printWindow.print();
          }
          document.body.removeChild(printFrame);
        }
      };
    }
  };

  const adjustLearnerCount = (increment: boolean) => {
    const newCount = increment ? learnerCount + 1 : learnerCount - 1;
    if (newCount >= 1 && newCount <= 10) {
      setLearnerCount(newCount);
    }
  };

  return (
    <div className="space-y-6">
      {/* Voucher Generation Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span>Generate Voucher</span>
              <Badge variant="secondary">{institutionName}</Badge>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSalesReport(true)}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Sales Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Monthly Sales Statistics */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {getMonthlySalesStats().month} Sales Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{getMonthlySalesStats().totalVouchers}</div>
                <div className="text-sm text-blue-700">Total Vouchers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">R{getMonthlySalesStats().totalAmount.toFixed(2)}</div>
                <div className="text-sm text-green-700">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  R{(getMonthlySalesStats().totalAmount / getMonthlySalesStats().totalVouchers).toFixed(2)}
                </div>
                <div className="text-sm text-purple-700">Average Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Object.keys(getMonthlySalesStats().denominationBreakdown).length}
                </div>
                <div className="text-sm text-orange-700">Denominations</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="voucher-value">Voucher Value (R)</Label>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
                <span className="text-2xl font-bold text-blue-600">R{voucherAmount}</span>
                <span className="text-sm text-gray-600">({learnerCount} × R{LEARNER_SUBSCRIPTION_AMOUNT})</span>
              </div>
              <p className="text-xs text-gray-500">Amount automatically calculated based on number of learners</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parent-name">Parent/Guardian Name</Label>
              <Input
                id="parent-name"
                placeholder="Enter parent/guardian full name"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                maxLength={100}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="learner-count">Number of Learners</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustLearnerCount(false)}
                  disabled={learnerCount <= 1}
                  className="h-10 w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-700 min-w-[2rem] text-center">
                    {learnerCount}
                  </span>
                  <span className="text-sm text-gray-600">
                    learner{learnerCount !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustLearnerCount(true)}
                  disabled={learnerCount >= 10}
                  className="h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Select the number of learners this voucher will activate
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="e.g., Parent payment, Special discount, Multiple children"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={200}
                rows={3}
              />
            </div>
          </div>
          
          <Button 
            onClick={generateVoucher} 
            disabled={isGenerating || !parentName.trim()}
            className="w-full md:w-auto"
          >
            {isGenerating ? 'Generating...' : `Generate R${voucherAmount} Voucher for ${learnerCount} Learner${learnerCount !== 1 ? 's' : ''}`}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Voucher Display */}
      {generatedVoucher && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Voucher Generated Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Voucher Code</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={generatedVoucher.code}
                    readOnly
                    className="font-mono text-lg font-bold bg-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="min-w-[80px]"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Value</Label>
                <div className="text-2xl font-bold text-green-600">
                  R{generatedVoucher.value}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Parent/Guardian</Label>
                <div className="text-sm text-gray-700 font-medium">
                  {generatedVoucher.parentName}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Learners</Label>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {generatedVoucher.learnerCount} learner{generatedVoucher.learnerCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Expiry</Label>
                <div className="text-sm text-gray-700">
                  30 days after redemption
                </div>
              </div>
              
              {generatedVoucher.notes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Notes</Label>
                  <div className="text-sm text-gray-700">
                    {generatedVoucher.notes}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button onClick={printVoucher} variant="outline" className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Print Voucher
              </Button>
              <Button 
                onClick={() => setGeneratedVoucher(null)} 
                variant="secondary"
                className="flex-1"
              >
                Generate Another
              </Button>
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={() => window.history.back()} 
                variant="ghost" 
                className="w-full text-gray-600 hover:text-gray-800"
              >
                ← Back to Dashboard
              </Button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Share this voucher code with the parent/guardian.</p>
                  <p className="mt-1">This voucher will activate dashboard access for {generatedVoucher.learnerCount} learner{generatedVoucher.learnerCount !== 1 ? 's' : ''} and expires 30 days after redemption.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales Report Dialog */}
      <Dialog open={showSalesReport} onOpenChange={setShowSalesReport}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Voucher Sales Report - {getMonthlySalesStats().month}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center p-4">
                <div className="text-3xl font-bold text-blue-600">{getMonthlySalesStats().totalVouchers}</div>
                <div className="text-sm text-gray-600">Total Vouchers Sold</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-3xl font-bold text-green-600">R{getMonthlySalesStats().totalAmount.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-3xl font-bold text-purple-600">
                  R{(getMonthlySalesStats().totalAmount / getMonthlySalesStats().totalVouchers).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Average Voucher Value</div>
              </Card>
            </div>

            {/* Denomination Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Denomination Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(getMonthlySalesStats().denominationBreakdown)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([denomination, count]) => {
                      const amount = Number(denomination) * count;
                      const percentage = ((count / getMonthlySalesStats().totalVouchers) * 100).toFixed(1);
                      return (
                        <div key={denomination} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600">R{denomination}</span>
                            </div>
                            <div>
                              <div className="font-semibold">{count} vouchers</div>
                              <div className="text-sm text-gray-600">{percentage}% of total</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">R{amount.toFixed(2)}</div>
                            <div className="text-sm text-gray-600">Revenue</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Institution Info */}
            <Card>
              <CardHeader>
                <CardTitle>Report Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Institution:</span> {institutionName}
                  </div>
                  <div>
                    <span className="font-semibold">Report Period:</span> {getMonthlySalesStats().month}
                  </div>
                  <div>
                    <span className="font-semibold">Generated:</span> {new Date().toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-semibold">Generated By:</span> PSC Tech System
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowSalesReport(false)}>
                Close
              </Button>
              <Button onClick={() => generateSalesReportPDF()} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Download PDF Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
