'use client';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#0A0A0A', color: '#fff' },
  header: { fontSize: 24, marginBottom: 20, color: '#6366F1' },
  section: { marginBottom: 15 },
  text: { fontSize: 12, marginBottom: 5 },
});

const PDFDoc = ({ report }: { report: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <Text style={styles.header}>MarketMuse PRO Report</Text>
        <Text style={styles.text}>Niche: {report.niche}</Text>
        <Text style={styles.text}>Country: {report.country}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.text}>{report.markdown}</Text>
      </View>
      <Text style={{ position: 'absolute', bottom: 30, left: 40, fontSize: 10, color: '#888' }}>
        MarketMuse PRO – $99 Report
      </Text>
    </Page>
  </Document>
);

export const ExportPDFButton = ({ report }: { report: any }) => {
  if (!report) return null;
  return (
    <PDFDownloadLink
      document={<PDFDoc report={report} />}
      fileName={`marketmuse_${report._id || 'report'}.pdf`}
    >
      {/* ✅ Fix: Cast the render function to ReactNode */}
      {(({ loading }: { loading: boolean }) => (
        <Button variant="outline" size="sm" className="gap-2" disabled={loading}>
          <FileDown size={14} /> {loading ? 'Generating...' : 'Export PDF'}
        </Button>
      )) as unknown as React.ReactNode}
    </PDFDownloadLink>
  );
};
