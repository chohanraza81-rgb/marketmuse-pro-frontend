'use client';
import html2pdf from 'html2pdf.js';

// Advanced Markdown to HTML parser for PDF
const renderMarkdown = (md: string, primary: string, text: string, subText: string) => {
  if (!md) return '';
  const lines = md.split('\n');
  let html = '';
  let inTable = false;
  let inList = false;
  let inOrderedList = false;

  const closeList = () => {
    if (inList) { html += '</ul>'; inList = false; }
    if (inOrderedList) { html += '</ol>'; inOrderedList = false; }
  };

  lines.forEach(line => {
    const trimmed = line.trim();

    // Headings
    if (trimmed.startsWith('### ')) html += `<h3 style="color:${primary}; margin-top:20px;">${trimmed.substring(4)}</h3>`;
    else if (trimmed.startsWith('## ')) html += `<h2 style="color:${primary}; margin-top:30px; border-bottom:1px solid ${primary}; padding-bottom:5px;">${trimmed.substring(3)}</h2>`;
    else if (trimmed.startsWith('# ')) html += `<h1 style="color:${primary}; margin-top:40px;">${trimmed.substring(2)}</h1>`;
    
    // Table
    else if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      closeList();
      if (trimmed.includes('---')) { inTable = false; html += '</tbody></table>'; return; }
      if (!inTable) {
        inTable = true;
        html += `<table style="width:100%; border-collapse:collapse; margin:20px 0; font-family: Arial; font-size:12px; color:${text};">
                  <tbody>`;
      }
      const cols = trimmed.split('|').filter(c => c.trim() !== '');
      html += `<tr style="border-bottom:1px solid ${primary};">
                ${cols.map(c => `<td style="padding:8px; border-bottom:1px solid #ccc;">${c.trim()}</td>`).join('')}
              </tr>`;
    }
    
    // Lists
    else if (trimmed.startsWith('- ')) {
      if (inOrderedList) { closeList(); }
      if (!inList) { html += '<ul style="color:' + text + '; margin:10px 0; padding-left:20px;">'; inList = true; }
      html += `<li>${trimmed.substring(2)}</li>`;
    }
    else if (/^\d+\.\s/.test(trimmed)) {
      if (inList) { closeList(); }
      if (!inOrderedList) { html += '<ol style="color:' + text + '; margin:10px 0; padding-left:20px;">'; inOrderedList = true; }
      html += `<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`;
    }
    
    // Paragraphs
    else if (trimmed !== '') {
      closeList();
      html += `<p style="margin:10px 0; font-family: Arial; font-size:14px; color:${text};">${trimmed}</p>`;
    }
  });

  closeList();
  return html;
};

export const generateBrandedPDF = async (report: any, settings: any) => {
  const isLight = settings.pdfTheme === 'light';
  const bgColor = isLight ? '#FFFFFF' : '#0F0F14';
  const textColor = isLight ? '#111111' : '#FFFFFF';
  const subText = isLight ? '#666666' : '#AAAAAA';
  const primary = settings.primaryColor;
  const secondary = settings.secondaryColor;

  const contentHTML = renderMarkdown(report.markdown, primary, textColor, subText);

  const htmlContent = `
  <div id="pdf-content" style="font-family: ${settings.fontFamily}; background: ${bgColor}; color: ${textColor}; padding: 40px;">
    
    <!-- Beautiful Cover Page -->
    <div style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: linear-gradient(135deg, ${bgColor} 0%, ${primary}20 100%);">
      ${settings.logoUrl ? `<img src="${settings.logoUrl}" style="width: 120px; margin-bottom: 40px;" />` : ''}
      <h1 style="font-size: 48px; font-weight: 900; margin-bottom: 20px; color: ${primary};">${report.niche}</h1>
      <p style="font-size: 18px; letter-spacing: 2px; color: ${subText}; text-transform: uppercase;">${report.type === 'seo' ? 'SEO RESEARCH REPORT' : 'PRODUCT INTELLIGENCE REPORT'}</p>
      <div style="margin-top: 60px; font-size: 14px; color: ${subText};">
        <p>Prepared For: ${report.clientName || 'Client'}</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
      </div>
    </div>

    <!-- Content with Colors & Professional Styling -->
    <div style="page-break-before: always;">
      ${contentHTML}
    </div>

    <!-- Footer on every page (approximate) -->
    <div style="position: fixed; bottom: 20px; left: 40px; right: 40px; border-top: 1px solid ${primary}; padding-top: 10px; font-size: 10px; color: ${subText}; text-align: center;">
      ${settings.footerText}
    </div>
  </div>
  `;

  const opt = {
    margin: [0, 0, 0, 0],
    filename: `${(settings.agencyName || 'Report').replace(/\s/g, '_')}_${report.niche}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
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
