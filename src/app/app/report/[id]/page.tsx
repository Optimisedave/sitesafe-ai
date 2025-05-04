
import { getServerSession } from "next-auth/next";
// Switched back to relative paths (Option B) - Corrected depth & re-verified for v9
import { authOptions } from "../../../../lib/auth"; 
import { redirect } from "next/navigation";
import prisma from "../../../../lib/prisma";
import ReportDisplay from "./report-display"; // Removed .tsx extension as it's often optional

async function getReportData(reportId: string, userId: string) {
  const report = await prisma.report.findUnique({
    where: {
      id: reportId,
      // Ensure user can only access their own reports
      userId: userId,
    },
    select: {
      id: true,
      title: true,
      summary: true,
      fullReportMarkdown: true,
      riskFlags: true,
      createdAt: true,
      sourceUploadIds: true, // Include source uploads if needed
    },
  });
  return report;
}

// Reverted to the standard Next.js App Router signature for page props
export default async function ReportPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  // Use optional chaining
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const userId = session.user.id;
  const reportId = params.id;

  const report = await getReportData(reportId, userId);

  if (!report) {
    // Handle report not found or not authorized
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <p className="text-red-600">Report not found or you do not have permission to view it.</p>
      </div>
    );
  }

  // Pass data to a client component for rendering Markdown and handling PDF export
  // Ensure the ReportDisplay component expects the correct report type
  return <ReportDisplay report={report} />;
}

