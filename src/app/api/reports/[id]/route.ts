
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; 
import { PrismaClient } from '@prisma/client';

// --- Inlined prisma.ts logic --- 
declare global {
  // eslint-disable-next-line no-var
  var prisma_inline_report_id_api: PrismaClient | undefined;
}
let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma_inline_report_id_api) {
    global.prisma_inline_report_id_api = new PrismaClient();
  }
  prisma = global.prisma_inline_report_id_api;
}
// --- End Inlined prisma.ts logic ---

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { id: reportId } = params;

  if (!reportId) {
    return new NextResponse(JSON.stringify({ error: 'Report ID is required' }), { status: 400 });
  }

  try {
    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
    });

    // Check if report exists and belongs to the user
    if (!report || report.userId !== userId) {
      return new NextResponse(JSON.stringify({ error: 'Report not found or access denied' }), { status: 404 });
    }

    // Return the full report data
    return NextResponse.json(report);

  } catch (error) {
    console.error(`Error fetching report ${reportId}:`, error);
    // Handle potential Prisma errors (e.g., invalid ID format)
    if (error instanceof Error && error.message.includes('Invalid report ID')) { // Example check
        return new NextResponse(JSON.stringify({ error: 'Invalid Report ID format' }), { status: 400 });
    }
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

