// generateBrandedPDF.ts
'use client';
import { toast } from 'sonner';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Fix PDF fonts for Next.js
(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

// Helper: Convert markdown inline formatting (bold, italic, code) to pdfmake text runs
function parseInline(text: string, baseStyle: any = {}): any[] {
  // Very basic inline parser for **bold**, *italic*, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  const result: any[] = [];
  parts.forEach(part => {
    if (!part) return;
    if (part.startsWith('**') && part.endsWith('**')) {
      result.push({ text: part.slice(2, -2), ...baseStyle, bold: true });
    } else if (part.startsWith('*') && part.endsWith('*')) {
      result.push({ text: part.slice(1, -1), ...baseStyle, italics: true });
    } else if (part.startsWith('`') && part.endsWith('`')) {
      result.push({ text: part.slice(1, -1), ...baseStyle, font: 'Courier', background: '#f0f0f0' });
    } else {
      result.push({ text: part, ...baseStyle });
    }
  });
  return result;
}

// Improved markdown parser that builds pdfmake document definition
function markdownToPdfContent(md: string, colors: any): any[] {
  const lines = md.split('\n');
  const content: any[] = [];
  let currentTable: any[] = [];
  let tableHeader: any[] | null = null;

  const flushTable = () => {
    if (currentTable.length > 0) {
      const body = tableHeader ? [tableHeader, ...currentTable] : currentTable;
      const widths = body[0].map(() => '*'); // flexible columns
      content.push({
        table: { widths, body },
        layout: 'lightHorizontalLines',
        margin: [0, 5, 0, 10],
      });
      currentTable = [];
      tableHeader = null;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushTable();
      content.push({ text: '' }); // line break
      return;
    }

    // Table detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').filter(c => c.trim() !== '');
      const isSeparator = cells.every(c => /^:?-{3,}:?$/.test(c.trim()));
      if (isSeparator) {
        // ignore separator, header already captured
      } else if (!tableHeader && cells.length > 0) {
        tableHeader = cells.map(c => ({ text: parseInline(c.trim(), { bold: true, color: colors.text }), style: 'tableHeader' }));
      } else {
        currentTable.push(cells.map(c => ({ text: parseInline(c.trim(), { color: colors.text }) })));
      }
      return;
    }

    // If not table, flush any ongoing table
    flushTable();

    // Headings
    if (trimmed.startsWith('### ')) {
      content.push({ text: parseInline(trimmed.substring(4), { color: colors.primary }), fontSize: 14, bold: true, margin: [0, 10, 0, 5] });
    } else if (trimmed.startsWith('## ')) {
      content.push({ text: parseInline(trimmed.substring(3), { color: colors.primary }), fontSize: 16, bold: true, margin: [0, 15, 0, 5] });
    } else if (trimmed.startsWith('# ')) {
      content.push({ text: parseInline(trimmed.substring(2), { color: colors.primary }), fontSize: 20, bold: true, margin: [0, 20, 0, 10] });
    }
    // Blockquote
    else if (trimmed.startsWith('> ')) {
      content.push({
        text: parseInline(trimmed.substring(2), { color: colors.subText, italics: true }),
        margin: [10, 2, 0, 2],
        background: '#f9f9f9',
        padding: [5, 5, 5, 5],
      });
    }
    // Unordered list
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      content.push({
        ul: [{ text: parseInline(trimmed.substring(2), { color: colors.text }) }],
        margin: [5, 2, 0, 2],
      });
    }
    // Ordered list (simple pattern)
    else if (/^\d+\.\s+/.test(trimmed)) {
      content.push({
        ol: [{ text: parseInline(trimmed.replace(/^\d+\.\s+/, ''), { color: colors.text }) }],
        margin: [5, 2, 0, 2],
      });
    }
    // Code block (triple backticks)
    else if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      let nextIndex = index + 1;
      while (nextIndex < lines.length && !lines[nextIndex].trim().startsWith('```')) {
        codeLines.push(lines[nextIndex]);
        nextIndex++;
      }
      content.push({
        text: codeLines.join('\n'),
        font: 'Courier',
        fontSize: 10,
        background: '#f5f5f5',
        margin: [0, 5, 0, 10],
        padding: [10, 10, 10, 10],
      });
      // Skip lines consumed
      for (let i = index + 1; i < nextIndex; i++) lines[i] = '';
    }
    // Horizontal rule
    else if (/^-{3,}$/.test(trimmed)) {
      content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 550, y2: 0, lineWidth: 1, lineColor: '#cccccc' }], margin: [0, 10, 0, 10] });
    }
    // Regular paragraph
    else {
      content.push({ text: parseInline(trimmed, { color: colors.text }), margin: [0, 2, 0, 2] });
    }
  });

  // Flush any remaining table
  flushTable();

  return content;
}

export const generateBrandedPDF = async (report: any, settings: any) => {
  const isLight = settings.pdfTheme === 'light';
  const colors = {
    text: isLight ? '#111111' : '#FFFFFF',
    subText: isLight ? '#555555' : '#AAAAAA',
    primary: settings.primaryColor,
    tableHeaderFill: isLight ? '#eeeeee' : '#222222',
    codeBackground: isLight ? '#f5f5f5' : '#1a1a1a',
  };

  // Header
  const header = () => {
    return {
      margin: [40, 20, 40, 0],
      columns: [
        { text: settings.agencyName || 'Agency', bold: true, fontSize: 12, color: colors.primary },
        { text: report.type === 'seo' ? 'SEO RESEARCH REPORT' : 'PRODUCT INTELLIGENCE REPORT', alignment: 'right', fontSize: 10, color: colors.subText }
      ]
    };
  };

  // Footer
  const footer = (currentPage: number, pageCount: number) => {
    return {
      margin: [40, 20, 40, 0],
      columns: [
        { text: settings.footerText || 'Confidential', fontSize: 10, color: colors.subText },
        { text: `${currentPage} / ${pageCount}`, alignment: 'right', fontSize: 10, color: colors.subText }
      ]
    };
  };

  // Cover page with clean layout
  const cover = [
    { text: report.niche, fontSize: 28, bold: true, color: colors.primary, margin: [0, 120, 0, 20] },
    { text: report.type === 'seo' ? 'SEO RESEARCH REPORT' : 'PRODUCT INTELLIGENCE REPORT', fontSize: 14, color: colors.subText, margin: [0, 0, 0, 40] },
    { text: `Prepared For: ${report.clientName || 'Client'}`, fontSize: 12, margin: [0, 0, 0, 5], color: colors.text },
    { text: `Date: ${new Date().toLocaleDateString()}`, fontSize: 12, margin: [0, 0, 0, 5], color: colors.text }
  ];

  // Main report content
  const reportContent = markdownToPdfContent(report.markdown, colors);

  const dd = {
    pageSize: 'A4',
    pageMargins: [40, 70, 40, 60],
    header: header,
    footer: footer,
    content: [
      ...cover,
      { text: '', pageBreak: 'after' },
      ...reportContent
    ],
    defaultStyle: {
      fontSize: 11,
      lineHeight: 1.4,
      color: colors.text,
    },
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 10,
        fillColor: colors.tableHeaderFill,
        color: colors.text,
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
