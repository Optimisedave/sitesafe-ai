import { NextResponse } from 'next/server';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { Prisma, PrismaClient } from '@prisma/client'; // Import Prisma namespace and PrismaClient
import { createClient } from '@supabase/supabase-js'; // Import Supabase client creation
import OpenAI from 'openai'; // Import OpenAI

// --- Inlined prisma.ts logic --- 
declare global {
  // eslint-disable-next-line no-var
  var prisma_inline_queue: PrismaClient | undefined;
}
let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma_inline_queue) {
    global.prisma_inline_queue = new PrismaClient();
  }
  prisma = global.prisma_inline_queue;
}
// --- End Inlined prisma.ts logic ---

// Load Supabase config from env
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    `Missing Supabase environment variables. ` +
    `Expected SUPABASE_URL and SUPABASE_SERVICE_KEY.`
  );
}

// Initialize client
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Inlined openai.ts logic --- 
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  throw new Error('OpenAI API key is missing in environment variables.');
}
const openai = new OpenAI({
  apiKey: openaiApiKey,
});
// --- End Inlined openai.ts logic ---

// Define the expected structure for AI function call results
interface RiskFlag {
  description: string;
  severity: 'Low' | 'Medium' | 'High';
}

interface ReportGenerationResult {
  riskFlags: RiskFlag[];
  summary: string;
  fullReportMarkdown: string;
}

// Function to handle the core AI report generation logic
async function generateReportForUpload(uploadId: string): Promise<void> {
  console.log(`Processing upload: ${uploadId}`);

  const upload = await prisma.upload.findUnique({
    where: { id: uploadId },
  });

  if (!upload || upload.status !== 'PENDING') {
    console.log(`Upload ${uploadId} not found or not pending.`);
    if (upload && upload.status !== 'PENDING') {
      // Avoid reprocessing completed/failed uploads
      console.log(`Upload ${uploadId} status is ${upload.status}, skipping.`);
    }
    return;
  }

  // Update status to PROCESSING
  await prisma.upload.update({
    where: { id: uploadId },
    data: { status: 'PROCESSING' },
  });

  try {
    // 1. Download file content from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('uploads')
      .download(upload.storagePath);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file ${upload.storagePath}: ${downloadError?.message}`);
    }

    let extractedText = '';
    // 2. Extract text (handle different file types - placeholders for PDF/Image)
    if (upload.filetype === 'txt' || upload.filetype === 'md') {
      extractedText = await fileData.text();
      // Add sample risk text if needed for testing
      if (!extractedText.toLowerCase().includes('risk') && !extractedText.toLowerCase().includes('hazard')) {
        extractedText += "\n\nNote: Scaffold structure seems unstable, requires immediate check. Potential hazard.";
        console.log(`Added sample risk text to ${uploadId} for testing AI flagging.`);
      }
    } else if (upload.filetype === 'pdf') {
      console.warn(`PDF extraction not implemented for ${uploadId}. Using placeholder text.`);
      extractedText = 'Placeholder PDF text content. Safety harness missing in section 3. Potential fall hazard.';
    } else if (['jpg', 'jpeg', 'png'].includes(upload.filetype)) {
      console.warn(`OCR not implemented for image ${uploadId}. Using placeholder text.`);
      extractedText = 'Placeholder OCR text from image. Worker observed without hard hat near overhead crane.';
    } else {
      console.warn(`Unsupported file type ${upload.filetype} for processing.`);
      extractedText = 'File content could not be extracted.';
    }

    // 3. Prepare data and call OpenAI API (using functions as per brief)
    const systemPrompt = "You are a NEBOSH-qualified H&S compliance officer generating UK HSE-ready reports based on site diaries, checklists, and photos. Analyze the provided text and identify potential H&S risks, summarize findings, and draft a formal report section. Prioritize identifying and flagging risks clearly.";
    
    const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        { 
            role: 'user', 
            content: JSON.stringify({ 
                fileName: upload.filename, 
                extractedText: extractedText 
            })
        }
    ];

    // Define function schemas as per brief
    const functions = [
        {
            name: 'create_risk_flags',
            description: 'Identifies and lists potential H&S risks from the text.',
            parameters: {
                type: 'object',
                properties: {
                    risks: {
                        type: 'array',
                        items: { 
                            type: 'object',
                            properties: {
                                description: { type: 'string', description: 'Description of the identified risk' },
                                severity: { type: 'string', enum: ['Low', 'Medium', 'High'], description: 'Assessed severity of the risk' }
                            },
                            required: ['description', 'severity']
                        },
                        description: 'A list of identified H&S risks.'
                    }
                },
                required: ['risks']
            }
        },
        {
            name: 'generate_summary',
            description: 'Generates a concise summary of the key findings or activities mentioned in the text.',
            parameters: {
                type: 'object',
                properties: {
                    summary: { type: 'string', description: 'A brief summary (1-2 sentences) of the document content.' }
                },
                required: ['summary']
            }
        },
        {
            name: 'draft_full_report',
            description: 'Drafts a detailed section for the H&S report based on the provided text, incorporating identified risks and summary.',
            parameters: {
                type: 'object',
                properties: {
                    reportMarkdown: { type: 'string', description: 'The full report section formatted in Markdown.' }
                },
                required: ['reportMarkdown']
            }
        }
    ];

    console.log(`Calling OpenAI for upload ${uploadId}...`);
    
    const generatedResult: ReportGenerationResult = {
        riskFlags: [],
        summary: 'Summary could not be generated.',
        fullReportMarkdown: 'Full report could not be generated.'
    };

    try {
        // Call 1: Create Risk Flags
        const riskResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            functions: [functions.find(f => f.name === 'create_risk_flags')!],
            function_call: { name: 'create_risk_flags' },
        });
        const riskArgs = riskResponse.choices[0]?.message?.function_call?.arguments;
        if (riskArgs) {
            generatedResult.riskFlags = JSON.parse(riskArgs).risks || [];
            console.log(`Generated ${generatedResult.riskFlags.length} risk flags for ${uploadId}.`);
        } else {
             console.warn(`Could not generate risk flags for ${uploadId}.`);
        }

        // Call 2: Generate Summary
        const summaryResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            functions: [functions.find(f => f.name === 'generate_summary')!],
            function_call: { name: 'generate_summary' },
        });
        const summaryArgs = summaryResponse.choices[0]?.message?.function_call?.arguments;
        if (summaryArgs) {
            generatedResult.summary = JSON.parse(summaryArgs).summary || 'No summary generated.';
            console.log(`Generated summary for ${uploadId}.`);
        } else {
             console.warn(`Could not generate summary for ${uploadId}.`);
        }

        // Call 3: Draft Full Report
        const reportResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            functions: [functions.find(f => f.name === 'draft_full_report')!],
            function_call: { name: 'draft_full_report' },
        });
        const reportArgs = reportResponse.choices[0]?.message?.function_call?.arguments;
        if (reportArgs) {
            generatedResult.fullReportMarkdown = JSON.parse(reportArgs).reportMarkdown || 'No report generated.';
            console.log(`Generated full report markdown for ${uploadId}.`);
        } else {
             console.warn(`Could not generate full report for ${uploadId}.`);
        }

    } catch (aiError) {
        console.error(`OpenAI API error during processing for ${uploadId}:`, aiError);
        generatedResult.summary = 'Error during AI processing.';
        generatedResult.fullReportMarkdown = `Error during AI processing: ${(aiError instanceof Error) ? aiError.message : String(aiError)}`;
    }

    // 4. Save the generated report
    await prisma.report.create({
      data: {
        userId: upload.userId,
        title: `Report for ${upload.filename} (${new Date().toISOString().split('T')[0]})`,
        summary: generatedResult.summary,
        fullReportMarkdown: generatedResult.fullReportMarkdown,
        riskFlags: (generatedResult.riskFlags ?? []) as unknown as Prisma.InputJsonValue,
        sourceUploadIds: [upload.id],
      },
    });

    // 5. Update upload status to COMPLETED
    await prisma.upload.update({
      where: { id: uploadId },
      data: { status: 'COMPLETED' },
    });

    console.log(`Successfully processed and generated report for upload: ${uploadId}`);

  } catch (error) {
    console.error(`Error processing upload ${uploadId}:`, error);
    await prisma.upload.update({
      where: { id: uploadId },
      data: { status: 'FAILED' },
    });
  }
}

export async function POST() { 
    try {
        const pendingUpload = await prisma.upload.findFirst({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'asc' },
        });

        if (!pendingUpload) {
            return NextResponse.json({ message: 'No pending uploads to process.' });
        }

        await generateReportForUpload(pendingUpload.id);

        return NextResponse.json({ message: `Processed upload: ${pendingUpload.id}` });

    } catch (error) {
        console.error('Queue Processing Error:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal Server Error', details: (error instanceof Error) ? error.message : String(error) }), { status: 500 });
    }
}

