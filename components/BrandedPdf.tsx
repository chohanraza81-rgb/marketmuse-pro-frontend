'use client';
import { toast } from 'sonner';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Fix PDF fonts for Next.js
(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

export const generateBrandedPDF = async (report: any, settings: any) => {
  const isLight = settings.pdfTheme === 'light';
  const textColor = isLight ? '#111111' : '#FFFFFF';
  const subText = isLight ? '#666666' : '#AAAAAA';
  const primary = settings.primaryColor;
  
  // Functions to parse Markdown into PDFMake content objects
  const markdownToPdfContent = (md: string) => {
    const lines = md.split('\n');
    const content: any[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Headings
      if (trimmed.startsWith('### ')) content.push({ text: trimmed.substring(4), fontSize: 14, bold: true, color: primary, margin: [0, 10, 0, 5] });
      else if (trimmed.startsWith('## ')) content.push({ text: trimmed.substring(3), fontSize: 16, bold: true, color: primary, margin: [0, 15, 0, 5] });
      else if (trimmed.startsWith('# ')) content.push({ text: trimmed.substring(2), fontSize: 20, bold: true, color: primary, margin: [0, 20, 0, 10] });
      
      // Tables
      else if (trimmed.startsWith('|') && trimmed.endsWith('|') && !trimmed.includes('---')) {
        const cols = trimmed.split('|').filter(c => c.trim() !== '');
        content.push({
          table: {
            widths: Array(cols.length).fill('auto'),
            body: [cols.map(c => ({ text: c.trim(), style: 'tableHeader' }))]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 5, 0, 10]
        });
      }
      // Lists
      else if (trimmed.startsWith('- ')) {
        content.push({ text: trimmed.substring(2), margin: [10, 2, 0, 2], color: textColor });
      }
      // Paragraphs
      else {
        content.push({ text: trimmed, margin: [0, 2, 0, 2], color: textColor });
      }
    });
    return content;
  };

  // Colors for Header and Footer
  const header = () => {
    return {
      margin: [40, 20, 40, 0],
      columns: [
        { text: settings.agencyName || 'Agency', bold: true, fontSize: 12, color: primary },
        { text: report.type === 'seo' ? 'SEO RESEARCH REPORT' : 'PRODUCT INTELLIGENCE REPORT', alignment: 'right', fontSize: 10, color: subText }
      ]
    };
  };

  const footer = (currentPage: number, pageCount: number) => {
    return {
      margin: [40, 20, 40, 0],
      columns: [
        { text: settings.footerText || 'Confidential', fontSize: 10, color: subText },
        { text: `${currentPage} / ${pageCount}`, alignment: 'right', fontSize: 10, color: subText }
      ]
    };
  };

  // 1. Cover Content (No huge blank space, just clean text at the top)
  const cover = [
    { text: report.niche, fontSize: 28, bold: true, color: primary, margin: [0, 100, 0, 20] },
    { text: report.type === 'seo' ? 'SEO RESEARCH REPORT' : 'PRODUCT INTELLIGENCE REPORT', fontSize: 14, color: subText, margin: [0, 0, 0, 40] },
    { text: `Prepared For: ${report.clientName || 'Client'}`, fontSize: 12, margin: [0, 0, 0, 5], color: textColor },
    { text: `Date: ${new Date().toLocaleDateString()}`, fontSize: 12, margin: [0, 0, 0, 5], color: textColor }
  ];

  // 2. Main Report Content
  const reportContent = markdownToPdfContent(report.markdown);

  // Construct PDF Document Definition
  const dd = {
    pageSize: 'A4',
    pageMargins: [40, 70, 40, 60],
    header: header,
    footer: footer,
    content: [
      ...cover,
      { text: '', pageBreak: 'after' }, // Force clean page break after cover (no blank pages)
      ...reportContent
    ],
    defaultStyle: {
      fontSize: 11,
      lineHeight: 1.4
    },
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: textColor,
        fillColor: isLight ? '#eeeeee' : '#222222'
      }
    }
  };

  toast.loading('Generating Premium PDF...');
  try {
    pdfMake.createPdf(dd).download(`${(settings.agencyName || 'Report').replace(/\s/g, '_')}_${report.niche}.pdf`);
    toast.dismiss();
    toast.success('Premium PDF downloaded!');
  } catch (err) {
    toast.dismiss();
    toast.error('Failed to generate PDF');
  }
};
