'use client';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';

export const generateBrandedPDF = async (report: any, settings: any) => {
  const isLight = settings.pdfTheme === 'light';
  const bgColor = isLight ? '#FFFFFF' : '#0F0F14';
  const textColor = isLight ? '#111111' : '#FFFFFF';
  const subText = isLight ? '#666666' : '#AAAAAA';
  const primary = settings.primaryColor;

  // Clean, continuous, professional layout (No huge gaps, No hidden lines)
  const htmlContent = `
  <div id="pdf-content" style="font-family: ${settings.fontFamily}; background: ${bgColor}; color: ${textColor}; padding: 40px;">
    
    <!-- Compact Professional Header -->
    <div style="border-bottom: 2px solid ${primary}; padding-bottom: 15px; margin-bottom: 25px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 24px; font-weight: bold; color: ${primary};">${settings.agencyName || 'Agency'}</div>
        <div style="font-size: 14px; color: ${subText};">${report.type === 'seo' ? 'SEO RESEARCH REPORT' : 'PRODUCT INTELLIGENCE REPORT'}</div>
      </div>
    </div>

    <!-- Report Title -->
    <h1 style="font-size: 28px; font-weight: 900; margin-bottom: 10px; color: ${textColor}; border-bottom: 1px solid ${subText}; padding-bottom: 10px;">
      ${report.niche}
    </h1>
    <p style="font-size: 14px; color: ${subText}; margin-bottom: 5px;">Prepared for: ${report.clientName || 'Client'}</p>
    <p style="font-size: 14px; color: ${subText}; margin-bottom: 20px;">Date: ${new Date().toLocaleDateString()}</p>

    <!-- Full Content (No hidden lines, No weird gaps) -->
    <div style="white-space: pre-wrap; line-height: 1.6; font-size: 13px;">
      ${report.markdown}
    </div>

    <!-- Compact Footer -->
    <div style="margin-top: 30px; border-top: 1px solid ${primary}; padding-top: 10px; font-size: 10px; color: ${subText}; text-align: center;">
      ${settings.footerText}
    </div>
  </div>
  `;

  const opt = {
    margin: [10, 10, 10, 10],
    filename: `${(settings.agencyName || 'Report').replace(/\s/g, '_')}_${report.niche}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  toast.loading('Generating Premium PDF...');
  try {
    await html2pdf().set(opt).from(htmlContent).save();
    toast.dismiss();
    toast.success('Branded PDF downloaded!');
  } catch (err) {
    toast.dismiss();
    toast.error('Failed to generate PDF');
  }
};
