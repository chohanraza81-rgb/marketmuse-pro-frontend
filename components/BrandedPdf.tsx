'use client';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';

export const generateBrandedPDF = async (report: any, settings: any) => {
  const isLight = settings.pdfTheme === 'light';
  const bgColor = isLight ? '#FFFFFF' : '#0F0F14';
  const textColor = isLight ? '#111111' : '#FFFFFF';
  const subText = isLight ? '#666666' : '#AAAAAA';
  const primary = settings.primaryColor;

  // Simple, continuous HTML (No cover page, no 100vh, no page breaks)
  const htmlContent = `
  <div id="pdf-content" style="font-family: ${settings.fontFamily}; background: ${bgColor}; color: ${textColor}; padding: 20px;">
    
    <!-- Compact Header -->
    <div style="border-bottom: 2px solid ${primary}; padding-bottom: 10px; margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 18px; font-weight: bold; color: ${primary};">${settings.agencyName || 'Agency'}</div>
        <div style="font-size: 10px; color: ${subText};">${report.type === 'seo' ? 'SEO RESEARCH REPORT' : 'PRODUCT INTELLIGENCE REPORT'}</div>
      </div>
    </div>

    <!-- Report Title -->
    <h1 style="font-size: 20px; font-weight: 900; margin-bottom: 5px; color: ${textColor}; border-bottom: 1px solid ${subText}; padding-bottom: 5px;">
      ${report.niche}
    </h1>
    <p style="font-size: 11px; color: ${subText}; margin-bottom: 15px;">Prepared for: ${report.clientName || 'Client'} | Date: ${new Date().toLocaleDateString()}</p>

    <!-- Full Content (No hidden lines, No blank spaces) -->
    <div style="white-space: pre-wrap; line-height: 1.4; font-size: 11px;">
      ${report.markdown}
    </div>

  </div>
  `;

  // ⚡ SINGLE PAGE FORCE: A4 (210mm) width, but extreme 3000mm height. This makes it a single continuous page.
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `${(settings.agencyName || 'Report').replace(/\s/g, '_')}_${report.niche}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: [210, 3000], orientation: 'portrait' }, // Tall format to fit everything
    pagebreak: { mode: ['css'] } // Disable automatic page breaks
  };

  toast.loading('Generating Single-Page Premium PDF...');
  try {
    await html2pdf().set(opt).from(htmlContent).save();
    toast.dismiss();
    toast.success('Premium PDF downloaded!');
  } catch (err) {
    toast.dismiss();
    toast.error('Failed to generate PDF');
  }
};
