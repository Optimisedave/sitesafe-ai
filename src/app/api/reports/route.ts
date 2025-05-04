
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
// Assuming authOptions is correctly configured and exported from your auth setup
// Adjust the import path as necessary based on your project structure
import { authOptions } from "@/lib/auth"; 
import { PrismaClient } from '@prisma/client';

// --- Inlined prisma.ts logic --- 
declare global {
  // eslint-disable-next-line no-var
  var prisma_inline_reports_api: PrismaClient | undefined;
}
let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma_inline_reports_api) {
    global.prisma_inline_reports_api = new PrismaClient();
  }
  prisma = global.prisma_inline_reports_api;
}
// --- End Inlined prisma.ts logic ---

export async function GET() {
  const session = await getServerSession(authOptions);

  // Use type assertion for user ID as session structure might vary
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const reports = await prisma.report.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        createdAt: true, // Use createdAt as the 'queued' date
        title: true, // Include title for context
        // Assuming you might want to derive status based on related uploads or add a status field later
        // For now, we'll just return the basic info
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Simple mapping to add a placeholder status (can be refined later)
    const reportsWithStatus = reports.map(report => ({
      ...report,
      status: 'Complete', // Placeholder status - needs logic based on your model
    }));

    return NextResponse.json(reportsWithStatus);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

