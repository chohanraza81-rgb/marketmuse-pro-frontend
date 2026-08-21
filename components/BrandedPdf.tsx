'use client';
import html2pdf from 'html2pdf.js';
import ReactMarkdown from 'react-markdown';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production.up.railway.app/api';

export const generateBrandedPDF = async (report: any, settings: any) => {
  const isLight = settings.pdfTheme === 'light';
  const bgColor = isLight ? '#FFFFFF' : '#111111';
  const textColor = isLight ? '#111111' : '#FFFFFF';
  const subText = isLight ? '#666666' : '#AAAAAA';
  const primary = settings.primaryColor;
  const secondary = settings.secondaryColor;

  // Advanced HTML Template (Cover, TOC, Content)
  const htmlContent = `
  <div id="pdf-content" style="font-family: ${settings.fontFamily}; background: ${bgColor}; color: ${textColor}; padding: 40px;">
    <!-- Cover Page -->
    <div style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
      ${settings.logoUrl ? `<img src="${settings.logoUrl}" style="width: 120px; margin-bottom: 40px;" />` : ''}
      <h1 style="font-size: 42px; font-weight: 900; margin-bottom: 10px; color: ${primary};">${report.niche}</h1>
      <h2 style="font-size: 18px; font-weight: 300; color: ${subText};">${report.type === 'seo' ? 'SEO RESEARCH REPORT' : 'PRODUCT INTELLIGENCE REPORT'}</h2>
      <p style="margin-top: 50px; font-size: 14px; color: ${subText};">Prepared for: ${report.clientName || 'Client'}</p>
      <p style="font-size: 14px; color: ${subText};">Date: ${new Date().toLocaleDateString()}</p>
      <div style="position: absolute; bottom: 40px; left: 40px; right: 40px; border-top: 1px solid ${primary}; padding-top: 20px; font-size: 12px; color: ${subText};">
        ${settings.footerText}
      </div>
    </div>

    <!-- TOC -->
    <div style="page-break-before: always; margin-bottom: 40px;">
      <h2 style="border-bottom: 2px solid ${primary}; padding-bottom: 10px; color: ${primary};">Table of Contents</h2>
      ${Array.from(new Set((report.markdown || '').match(/(^|\n)(\d+\.\s+[A-Z ]+)/g) || [])).map(section => `
        <p style="color: ${textColor}; margin-bottom: 8px;">${section.replace(/\n/g, '')}</p>
      `).join('')}
    </div>

    <!-- Content -->
    <div style="page-break-before: always; line-height: 1.6;">
      <article style="font-size: 16px;">
        ${renderMarkdown(report.markdown, primary, textColor, subText)}
      </article>
    </div>
  </div>
  `;

  // PDF Options
  const opt = {
    margin: [0, 0, 0, 0],
    filename: `${settings.agencyName.replace(/\s/g, '_')}_${report.niche}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(htmlContent).save();
};

// Helper to parse Markdown to styled HTML (Simple regex based for Word-like rendering)
const renderMarkdown = (md: string, primary: string, text: string, subText: string) => {
  if (!md) return '';
  let html = md
    .replace(/^### (.*$)/gim, '<h3 style="color: ' + primary + '; margin-top: 20px;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color: ' + primary + '; margin-top: 30px;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color: ' + primary + '; margin-top: 40px;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" style="color: ' + primary + ';">$1</a>')
    .replace(/^\s*\n\*\s(.*)/gim, '<ul style="color: ' + text + ';"><li>$1</li></ul>')
    .replace(/^\s*\n(\d+)\.\s(.*)/gim, '<ol style="color: ' + text + ';"><li>$2</li></ol>')
    .replace(/\n/gim, '<br />');
  return html;
};
