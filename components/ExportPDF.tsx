'use client';

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Button } from '@/components/ui/Button';
import { FileDown } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// PDF STYLES (Dark Premium Theme)
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#0A0A0A',
    color: '#E6EDF3',
    fontFamily: 'Helvetica',
  },
  brand: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 30,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  header: {
    fontSize: 24,
    marginBottom: 8,
    color: '#533AFD',
    fontWeight: 700,
  },
  reportType: {
    fontSize: 11,
    color: '#9DA7B3',
    marginBottom: 24,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#232326',
  },
  metaLabel: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metaValue: {
    fontSize: 10,
    color: '#E6EDF3',
  },
  section: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#232326',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 700,
    marginBottom: 10,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#C9D1D9',
    marginBottom: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#232326',
    paddingTop: 10,
  },
});

// ═══════════════════════════════════════════════════════════════
// PDF DOCUMENT COMPONENT
// ═══════════════════════════════════════════════════════════════
interface PDFDocProps {
  report: {
    niche: string;
    country: string;
    type?: string;
    markdown?: string;
    clientName?: string;
    _id?: string;
    createdAt?: string;
  };
  agencyName?: string;
}

const getReportLabel = (type?: string): string => {
  switch (type) {
    case 'product':
      return 'PRODUCT INTELLIGENCE REPORT';
    case 'technical_seo':
    case 'technical-seo':
      return 'TECHNICAL SEO AUDIT';
    case 'brand_protection':
    case 'brand-protection':
      return 'COUNTERFEIT INTELLIGENCE REPORT';
    case 'seo':
    default:
      return 'SEO RESEARCH REPORT';
  }
};

const PDFDoc = ({ report, agencyName = 'MusePRO' }: PDFDocProps) => {
  // Split markdown into manageable lines (limit for PDF size)
  const markdownLines = (report.markdown || '')
    .split('\n')
    .filter((line) => line.trim())
    .slice(0, 80);

  const createdDate = report.createdAt
    ? new Date(report.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  return (
    <Document
      title={`${agencyName} — ${report.niche}`}
      author={agencyName}
      subject={getReportLabel(report.type)}
    >
      <Page size="A4" style={styles.page}>
        {/* ── Brand Header ── */}
        <Text style={styles.brand}>{agencyName}</Text>

        {/* ── Report Title ── */}
        <Text style={styles.header}>{report.niche}</Text>
        <Text style={styles.reportType}>{getReportLabel(report.type)}</Text>

        {/* ── Meta Info ── */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Country</Text>
          <Text style={styles.metaValue}>{report.country?.toUpperCase() || 'N/A'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Date</Text>
          <Text style={styles.metaValue}>{createdDate}</Text>
        </View>
        {report.clientName && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Prepared For</Text>
            <Text style={styles.metaValue}>{report.clientName}</Text>
          </View>
        )}
        {report._id && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Reference</Text>
            <Text style={styles.metaValue}>{report._id.slice(-8).toUpperCase()}</Text>
          </View>
        )}

        {/* ── Content Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Content</Text>
          {markdownLines.map((line, i) => (
            <Text key={i} style={styles.text}>
              {line.replace(/[#*_`]/g, '').trim()}
            </Text>
          ))}
        </View>

        {/* ── Footer ── */}
        <Text style={styles.footer}>
          {agencyName} • Confidential • {createdDate}
        </Text>
      </Page>
    </Document>
  );
};

// ═══════════════════════════════════════════════════════════════
// EXPORT BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════
interface ExportPDFButtonProps {
  report: any;
  agencyName?: string;
}

export const ExportPDFButton = ({ report, agencyName }: ExportPDFButtonProps) => {
  if (!report) return null;

  const filename = `${(agencyName || 'MusePRO').replace(/\s+/g, '_')}_${report.niche?.replace(/\s+/g, '_') || 'Report'}.pdf`;

  return (
    <PDFDownloadLink
      document={<PDFDoc report={report} agencyName={agencyName} />}
      fileName={filename}
    >
      {(({ loading }: { loading: boolean }) => (
        <Button variant="outline" size="sm" className="gap-2" disabled={loading}>
          <FileDown size={14} />
          {loading ? 'Generating...' : 'Export PDF'}
        </Button>
      )) as unknown as React.ReactNode}
    </PDFDownloadLink>
  );
};
