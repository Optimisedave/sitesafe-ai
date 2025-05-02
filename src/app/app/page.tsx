
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Updated import
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

// Helper function to fetch reports - could be moved to a service/lib file
async function getUserReports(userId: string) {
  const reports = await prisma.report.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      summary: true,
    },
  });
  return reports;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Use optional chaining for session user properties
  if (!session?.user?.id) {
    redirect("/api/auth/signin"); // Redirect to sign-in if not authenticated
  }

  const userId = session.user.id;
  const reports = await getUserReports(userId);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        {/* Placeholder for User menu/logout */}
        <Link href="/api/auth/signout" legacyBehavior>
          <a className="text-sm text-gray-600 hover:text-gray-900">Sign Out</a>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Your Reports</h2>
            {/* Placeholder for Upload Button/Component */}
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
              Upload New File
            </button>
          </div>

          {reports.length === 0 ? (
            // Fixed unescaped apostrophe
            <p className="text-gray-600">You haven&apos;t generated any reports yet. Upload a file to get started!</p>
          ) : (
            <ul className="space-y-4">
              {reports.map((report) => (
                <li key={report.id} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                  <Link href={`/app/report/${report.id}`} legacyBehavior>
                    <a className="block">
                      <h3 className="font-semibold text-lg text-blue-700 hover:underline mb-1">{report.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">Generated: {new Date(report.createdAt).toLocaleDateString()}</p>
                      <p className="text-gray-700 text-sm truncate">{report.summary}</p>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sidebar Area */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Onboarding Checklist</h2>
          {/* Placeholder for Onboarding Steps */}
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Create Account</li>
            <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Start Subscription</li>
            <li className="flex items-center"><span className="text-gray-400 mr-2">☐</span> Upload your first site diary/photo</li>
            <li className="flex items-center"><span className="text-gray-400 mr-2">☐</span> View your first AI-generated report</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

