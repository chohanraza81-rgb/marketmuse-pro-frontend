'use client';
import { toast } from 'sonner';

export const generateBrandedPDF = async (report: any, settings: any) => {
  const isLight = settings.pdfTheme === 'light';
  const bgColor = isLight ? '#FFFFFF' : '#0F0F14';
  const textColor = isLight ? '#111111' : '#FFFFFF';
  const subText = isLight ? '#666666' : '#AAAAAA';
  const primary = settings.primaryColor;

  // Clean, professional HTML layout (No 100vh, No massive gaps)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${report.niche} - Report</title>
      <style>
        @page { margin: 20px; }
        body { 
          font-family: ${settings.fontFamily || 'Inter'}, sans-serif; 
          background: ${bgColor}; 
          color: ${textColor}; 
          line-height: 1.6; 
          font-size: 14px; 
        }
        .header { border-bottom: 2px solid ${primary}; padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
        .agency-name { font-weight: bold; font-size: 20px; color: ${primary}; }
        .report-type { font-size: 11px; color: ${subText}; }
        h1 { font-size: 24px; color: ${primary}; border-bottom: 1px solid ${subText}; padding-bottom: 5px; }
        h2 { font-size: 18px; color: ${primary}; margin-top: 20px; }
        h3 { font-size: 16px; color: ${textColor}; margin-top: 15px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11px; }
        th, td { border: 1px solid ${subText}; padding: 6px; text-align: left; }
        th { background-color: ${primary}20; color: ${textColor}; }
        p, li { color: ${textColor}; margin: 5px 0; }
        .footer { margin-top: 30px; border-top: 1px solid ${primary}; padding-top: 10px; font-size: 10px; color: ${subText}; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="agency-name">${settings.agencyName || 'Agency'}</div>
        <div class="report-type">${report.type === 'seo' ? 'SEO RESEARCH REPORT' : 'PRODUCT INTELLIGENCE REPORT'}</div>
      </div>
      
      <h1>${report.niche}</h1>
      <p style="font-size: 12px; color: ${subText};">
        Prepared for: ${report.clientName || 'Client'} &nbsp; | &nbsp; Date: ${new Date().toLocaleDateString()}
      </p>

      <div>
        ${report.markdown
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
          .replace(/^\s*\n\*\s(.*)/gim, '<ul><li>$1</li></ul>')
          .replace(/^\s*\n(\d+)\.\s(.*)/gim, '<ol><li>$2</li></ol>')
          .replace(/\n/gim, '<br />')
        }
      </div>

      <div class="footer">
        ${settings.footerText}
      </div>
    </body>
    </html>
  `;

  // Open a hidden window with the content and trigger the native Print Dialog
  const w = window.open('', '_blank');
  if (!w) {
    toast.error('Please allow pop-ups to generate PDF');
    return;
  }

  w.document.write(htmlContent);
  w.document.close();
  w.focus();

  // Wait for content to load, then print
  setTimeout(() => {
    w.print();
    toast.success('Select "Save as PDF" in the print dialog');
  }, 500);
};
