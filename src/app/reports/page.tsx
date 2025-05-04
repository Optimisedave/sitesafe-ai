
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
// useRouter is no longer needed for the client-side redirect
import Link from 'next/link';

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
  const baseClasses = "px-4 py-3 rounded relative mb-4";
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

// Define the expected structure for a report item
interface ReportItem {
  id: string;
  createdAt: string; // ISO date string
  title: string;
  status: string; // e.g., 'Pending', 'Complete', 'Failed'
}

export default function ReportsPage() {
  const { data: session, status: authStatus } = useSession();
  // const router = useRouter(); // No longer needed for redirect
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Middleware now handles unauthenticated access, so no client-side redirect needed here.
  // useEffect(() => {
  //   if (authStatus === 'unauthenticated') {
  //     router.push('/api/auth/signin?callbackUrl=/reports');
  //   }
  // }, [authStatus, router]);

  // Fetch reports when authenticated
  useEffect(() => {
    if (authStatus === 'authenticated') {
      const fetchReports = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch('/api/reports');
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch reports.');
          }
          const data: ReportItem[] = await response.json();
          setReports(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching reports.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchReports();
    }
    // If status becomes unauthenticated while viewing, middleware will handle it on next navigation
    // If status is loading, we show the loading indicator below
    if (authStatus === 'unauthenticated') {
        setIsLoading(false); // Stop loading if user logs out
    }

  }, [authStatus]); // Re-run if auth status changes

  // Improved loading state
  if (authStatus === 'loading' || (authStatus === 'authenticated' && isLoading)) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner />
        <p className="ml-2 text-gray-600">Loading reports...</p>
      </div>
    );
  }

  // Don't render the main content if middleware hasn't kicked in yet or during initial load
  if (authStatus !== 'authenticated') {
     // Middleware handles the redirect, but we can show a message or spinner briefly
     return (
        <div className="flex justify-center items-center min-h-[200px]">
            <p className="text-gray-600">Loading session...</p>
        </div>
     );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Reports</h1>

      {error && <Alert type="error" message={error} />}

      {!isLoading && reports.length === 0 && !error && (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600">You haven't generated any reports yet.</p>
            <Link href="/upload" className="mt-2 inline-block text-indigo-600 hover:underline">
                Upload an entry to get started
            </Link>
        </div>
      )}

      {!isLoading && reports.length > 0 && (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Queued
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.title || `Report ${report.id.substring(0, 8)}...`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* Example: Add styling based on status */}
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                        report.status === 'Complete' ? 'bg-green-100 text-green-800' : 
                        report.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800' 
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/reports/${report.id}`} className="text-indigo-600 hover:text-indigo-900">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

