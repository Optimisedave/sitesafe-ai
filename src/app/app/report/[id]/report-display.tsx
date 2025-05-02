
'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Removed unused Font, Report, SubscriptionStatus imports
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'; 
import { Prisma } from '@prisma/client'; // Import Prisma namespace for JsonValue

// Define a more specific type for the report prop, including riskFlags as JsonValue
interface ReportDisplayProps {
  report: {
    id: string;
    title: string;
    summary: string;
    fullReportMarkdown: string;
    riskFlags: Prisma.JsonValue; // Use Prisma.JsonValue
    createdAt: Date;
    sourceUploadIds: string[];
  };
}

// Define the structure for RiskFlag based on how it's stored/used
interface RiskFlag {
  description: string;
  severity: 'Low' | 'Medium' | 'High';
}

// Register fonts (ensure these paths are correct in the environment)
// Font.register({
//   family: 'NotoSansCJK',
//   src: '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
// });
// Font.register({
//   family: 'WenQuanYiZenHei',
//   src: '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
// });

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    // fontFamily: 'NotoSansCJK', // Apply font if registered
    fontFamily: 'Helvetica', // Default fallback
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1E40AF', // Blue-700
  },
  subheading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1D4ED8', // Blue-600
  },
  paragraph: {
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 1.4,
    color: '#374151', // Gray-700
  },
  listItem: {
    fontSize: 11,
    marginBottom: 4,
    marginLeft: 10,
  },
  riskItem: {
    fontSize: 11,
    marginBottom: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Gray-200
    borderRadius: 4,
  },
  riskDescription: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  riskSeverityHigh: {
    color: '#DC2626', // Red-600
  },
  riskSeverityMedium: {
    color: '#F59E0B', // Amber-500
  },
  riskSeverityLow: {
    color: '#6B7280', // Gray-500
  },
});

// Component to render the PDF document
const ReportPDF = ({ report }: ReportDisplayProps) => {
  // Safely parse riskFlags, assuming it's an array of RiskFlag objects
  const riskFlags = (Array.isArray(report.riskFlags) ? report.riskFlags : []) as RiskFlag[];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.heading}>{report.title}</Text>
          <Text style={[styles.paragraph, { fontSize: 9, color: '#6B7280' }]}>
            Generated: {new Date(report.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheading}>Summary</Text>
          <Text style={styles.paragraph}>{report.summary}</Text>
        </View>

        {riskFlags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subheading}>Identified Risks</Text>
            {riskFlags.map((risk, index) => (
              <View key={index} style={styles.riskItem}>
                <Text style={styles.riskDescription}>{risk.description}</Text>
                <Text
                  style={[
                    risk.severity === 'High' ? styles.riskSeverityHigh :
                    risk.severity === 'Medium' ? styles.riskSeverityMedium :
                    styles.riskSeverityLow,
                    { fontSize: 10 }
                  ]}
                >
                  Severity: {risk.severity}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.subheading}>Full Report Details</Text>
          {/* Basic rendering of Markdown - consider a more robust parser if needed */}
          {report.fullReportMarkdown.split('\n').map((line, index) => (
            <Text key={index} style={styles.paragraph}>{line}</Text>
          ))}
        </View>
      </Page>
    </Document>
  );
};

// Main display component
const ReportDisplay = ({ report }: ReportDisplayProps) => {
  const [isClient, setIsClient] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Safely parse riskFlags for display
  const riskFlags = (Array.isArray(report.riskFlags) ? report.riskFlags : []) as RiskFlag[];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{report.title}</h1>
        {isClient && (
          <PDFDownloadLink
            document={<ReportPDF report={report} />}
            fileName={`${report.title.replace(/\s+/g, '_')}_${new Date(report.createdAt).toISOString().split('T')[0]}.pdf`}
          >
            {({ loading }) => (
              <button
                className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Generating PDF...' : 'Download PDF'}
              </button>
            )}
          </PDFDownloadLink>
        )}
      </header>

      {/* Summary Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-3">Summary</h2>
        <p className="text-gray-700">{report.summary}</p>
      </div>

      {/* Risk Flags Section */}
      {riskFlags.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Identified Risks</h2>
          <ul className="space-y-3">
            {riskFlags.map((risk, index) => (
              <li key={index} className="border border-gray-200 p-3 rounded-md">
                <p className="font-medium text-gray-800 mb-1">{risk.description}</p>
                <span
                  className={`text-sm font-semibold px-2 py-0.5 rounded ${risk.severity === 'High' ? 'bg-red-100 text-red-700' : risk.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}
                >
                  {risk.severity}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Full Report Markdown Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Full Report Details</h2>
        <article className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {report.fullReportMarkdown}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
};

export default ReportDisplay;

