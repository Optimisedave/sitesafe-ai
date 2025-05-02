
'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

// Define the expected shape of the report prop
interface ReportData {
  id: string;
  title: string;
  summary: string;
  fullReportMarkdown: string;
  riskFlags: any; // Adjust type based on actual JSON structure
  createdAt: Date;
}

interface ReportDisplayProps {
  report: ReportData;
}

// Basic styles for PDF document
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  summary: {
    fontSize: 12,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  markdownContent: {
    fontSize: 11,
    lineHeight: 1.4,
  },
  riskSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
  },
  riskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  riskItem: {
    fontSize: 11,
    marginBottom: 3,
  },
});

// Component to generate the PDF document structure
const ReportPDF = ({ report }: { report: ReportData }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.title}>{report.title}</Text>
        <Text style={pdfStyles.summary}>Summary: {report.summary}</Text>
        <Text style={pdfStyles.summary}>Generated: {new Date(report.createdAt).toLocaleDateString()}</Text>
      </View>
      
      {/* Basic rendering of Markdown - @react-pdf/renderer doesn't support complex Markdown directly */}
      {/* For a real app, you'd need a Markdown-to-PDF conversion or simpler text rendering */}
      <View style={pdfStyles.section}>
         <Text style={pdfStyles.heading}>Full Report</Text>
         {/* Split markdown into paragraphs for basic rendering */} 
         {report.fullReportMarkdown.split('\n\n').map((paragraph, index) => (
            <Text key={index} style={pdfStyles.markdownContent}>{paragraph.replace(/\*\*/g, '')}</Text> // Basic bold removal
         ))}
      </View>

      {report.riskFlags && report.riskFlags.length > 0 && (
        <View style={pdfStyles.riskSection}>
          <Text style={pdfStyles.riskTitle}>Identified Risks:</Text>
          {report.riskFlags.map((risk: any, index: number) => (
            <Text key={index} style={pdfStyles.riskItem}>
              - {risk.description} (Severity: {risk.severity})
            </Text>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

export default function ReportDisplay({ report }: ReportDisplayProps) {
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 truncate">{report.title}</h1>
        {/* PDF Download Link - Renders client-side */}
        <PDFDownloadLink 
          document={<ReportPDF report={report} />} 
          fileName={`${report.title.replace(/\s+/g, '_')}.pdf`}
        >
          {({ blob, url, loading, error }) => 
            loading ? 'Loading document...' : 
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
              Download PDF
            </button>
          }
        </PDFDownloadLink>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Report Content */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Report Details</h2>
          <article className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {report.fullReportMarkdown}
            </ReactMarkdown>
          </article>
        </div>

        {/* Sidebar for Summary & Risks */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow h-fit sticky top-8">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <p className="text-gray-700 mb-6 text-sm">{report.summary}</p>
          
          <h2 className="text-xl font-semibold mb-4">Risk Flags</h2>
          {report.riskFlags && report.riskFlags.length > 0 ? (
            <ul className="space-y-2">
              {report.riskFlags.map((risk: any, index: number) => (
                <li key={index} className={`border-l-4 p-2 rounded-r-md ${risk.severity === 'High' ? 'border-red-500 bg-red-50' : risk.severity === 'Medium' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-400 bg-gray-50'}`}>
                  <p className="font-medium text-sm">{risk.description}</p>
                  <p className="text-xs text-gray-600">Severity: {risk.severity}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-sm">No specific risks flagged in this report.</p>
          )}
        </div>
      </div>
    </div>
  );
}

