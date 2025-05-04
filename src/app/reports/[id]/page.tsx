
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation'; // useRouter no longer needed
import { Prisma } from '@prisma/client'; // Import Prisma namespace for types

// --- Reusable Components (Consider moving to separate files) ---
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

interface AlertProps {
  type: 'success' | 'error';
  message: string;
}
const Alert = ({ type, message }: AlertProps) => {
  const baseClasses = "px-4 py-3 rounded relative mb-6"; // Added mb-6
  const typeClasses = type === 'success'
    ? "bg-green-100 border border-green-400 text-green-700"
    : "bg-red-100 border border-red-400 text-red-700";
  return (
    <div className={`${baseClasses} ${typeClasses}`} role="alert">
      <span className="block sm:inline">{message}</span>
    </div>
  );
};
// --- End Reusable Components ---

// Define the expected structure for a full report
interface FullReport {
  id: string;
  userId: string;
  title: string;
  summary: string;
  fullReportMarkdown: string;
  riskFlags: Prisma.JsonValue; // Use Prisma.JsonValue for flexibility
  sourceUploadIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Define the structure for parsed risk flags
interface RiskFlag {
  description: string;
  severity: 'Low' | 'Medium' | 'High';
}

export default function ReportDetailPage() {
  const { data: session, status: authStatus } = useSession();
  // const router = useRouter(); // No longer needed
  const params = useParams();
  const reportId = params?.id as string; // Get report ID from URL

  const [report, setReport] = useState<FullReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Middleware now handles unauthenticated access, so no client-side redirect needed here.
  // useEffect(() => {
  //   if (authStatus === 'unauthenticated') {
  //     router.push(`/api/auth/signin?callbackUrl=/reports/${reportId}`); 
  //   }
  // }, [authStatus, router, reportId]);

  // Fetch report details when authenticated and reportId is available
  useEffect(() => {
    // Only fetch if authenticated and we have an ID
    if (authStatus === 'authenticated' && reportId) {
      const fetchReportDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/reports/${reportId}`);
          if (!response.ok) {
            const errorData = await response.json();
            // Provide more specific error messages
            if (response.status === 404) {
                throw new Error(errorData.error || 'Report not found or you do not have access.');
            } else if (response.status === 400) {
                throw new Error(errorData.error || 'Invalid report ID format.');
            } else {
                throw new Error(errorData.error || 'Failed to fetch report details.');
            }
          }
          const data: FullReport = await response.json();
          setReport(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching the report.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchReportDetails();
    } else if (authStatus === 'unauthenticated') {
        // If user logs out while viewing, stop loading
        setIsLoading(false);
    }
  }, [authStatus, reportId]);

  // Improved loading state
  if (authStatus === 'loading' || (authStatus === 'authenticated' && isLoading)) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner />
        <p className="ml-2 text-gray-600">Loading report details...</p>
      </div>
    );
  }

  // Don't render the main content if middleware hasn't kicked in yet or during initial load
  if (authStatus !== 'authenticated') {
     // Middleware handles the redirect, but we can show a message or spinner briefly
     return (
        <div className="flex justify-center items-center min-h-[300px]">
            <p className="text-gray-600">Loading session...</p>
        </div>
     );
  }

  // Handle error state using Alert component
  if (error) {
    return <Alert type="error" message={error} />;
  }

  // Handle report not found (after loading and no error)
  if (!report) {
    return <p className="mt-8 text-center text-gray-600">Report not found.</p>;
  }

  // Safely parse riskFlags
  let parsedRiskFlags: RiskFlag[] = [];
  try {
    if (Array.isArray(report.riskFlags)) {
      parsedRiskFlags = report.riskFlags as unknown as RiskFlag[];
    } else if (typeof report.riskFlags === 'string') {
      parsedRiskFlags = JSON.parse(report.riskFlags);
      if (!Array.isArray(parsedRiskFlags)) parsedRiskFlags = [];
    } 
  } catch (parseError) {
    console.error("Error parsing risk flags:", parseError);
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-gray-800">{report.title || `Report ${report.id.substring(0,8)}...`}</h1>
        <p className="text-sm text-gray-500">Generated on: {new Date(report.createdAt).toLocaleString()}</p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">Summary</h2>
        <p className="text-gray-800 whitespace-pre-wrap">{report.summary || 'No summary available.'}</p>
      </div>

      {parsedRiskFlags.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Identified Risks</h2>
          <ul className="space-y-4">
            {parsedRiskFlags.map((flag, index) => (
              <li key={index} className="border-l-4 p-4 rounded-r-md bg-gray-50 
                ${flag.severity === 'High' ? 'border-red-500' : flag.severity === 'Medium' ? 'border-yellow-500' : 'border-green-500'}">
                <p className="font-medium text-gray-800">{flag.description}</p>
                <p className="text-sm text-gray-600 mt-1">Severity: 
                  <span className={`font-semibold ${flag.severity === 'High' ? 'text-red-600' : flag.severity === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {flag.severity}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">Full Report Text</h2>
        <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none text-gray-800 whitespace-pre-wrap">
          {report.fullReportMarkdown || 'No detailed report text available.'}
        </div>
      </div>

      {/* Placeholder for PDF display */}
      {/* ... */}
    </div>
  );
}

