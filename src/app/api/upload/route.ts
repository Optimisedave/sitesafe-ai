import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { PrismaClient } from '@prisma/client'; // Import PrismaClient
import { createClient } from '@supabase/supabase-js'; // Import Supabase client creation
import { randomUUID } from 'crypto';
import { PrismaAdapter } from "@next-auth/prisma-adapter"; // Needed for inlined authOptions
import EmailProvider from "next-auth/providers/email"; // Needed for inlined authOptions
import { AuthOptions, User, Session } from "next-auth"; // Needed for inlined authOptions
import { AdapterUser } from "next-auth/adapters"; // Needed for inlined authOptions

// --- Inlined prisma.ts logic --- 
declare global {
  // eslint-disable-next-line no-var
  var prisma_inline_upload: PrismaClient | undefined;
}
let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma_inline_upload) {
    global.prisma_inline_upload = new PrismaClient();
  }
  prisma = global.prisma_inline_upload;
}
// --- End Inlined prisma.ts logic ---

// --- Inlined supabase.ts logic --- 
const supabaseUrl = process.env.SUPABASE_URL;
// Use anon key for uploads, assuming RLS is set up
const supabaseKey = process.env.SUPABASE_ANON_KEY; 
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or anon key is missing in environment variables.');
}
const supabase = createClient(supabaseUrl, supabaseKey);
// --- End Inlined supabase.ts logic ---

// --- Inlined authOptions from src/lib/auth.ts --- 
// Instantiate PrismaClient directly for the adapter within this file
// Use a different global variable name to avoid conflicts if needed, though Prisma singleton pattern handles it.
const prismaAuthForUpload = new PrismaClient(); 

// Define a custom Session type if needed to include id and role
interface CustomSession extends Session {
  user?: {
    id?: string | null;
    role?: string | null; 
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// Define authOptions directly in this file
const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prismaAuthForUpload), // Use a local client instance
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {},
  callbacks: {
    async session({ session, user }: { session: CustomSession; user: User | AdapterUser }): Promise<CustomSession> { 
      if (session?.user) {
        session.user.id = user.id;
        session.user.role = (user as { role?: string | null })?.role ?? null; 
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};
// --- End of Inlined authOptions --- 

export async function POST(req: NextRequest) {
  // Use the inlined authOptions
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const userId = session.user.id;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new NextResponse(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return new NextResponse(JSON.stringify({ error: 'File size exceeds limit' }), { status: 400 });
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'txt', 'md'];
    if (!allowedTypes.includes(fileExtension)) {
        return new NextResponse(JSON.stringify({ error: 'Invalid file type' }), { status: 400 });
    }

    const uniqueFilename = `${randomUUID()}.${fileExtension}`;
    const storagePath = `${userId}/${uniqueFilename}`;

    // Upload file to Supabase Storage using inlined client
    const { error: uploadError } = await supabase.storage
      .from('uploads') 
      .upload(storagePath, file);

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      return new NextResponse(JSON.stringify({ error: 'Failed to upload file', details: uploadError.message }), { status: 500 });
    }

    // Create an entry in the Upload table using inlined prisma client
    const dbUpload = await prisma.upload.create({
      data: {
        userId: userId,
        filename: file.name,
        storagePath: storagePath,
        filetype: fileExtension,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, uploadId: dbUpload.id, storagePath: storagePath });

  } catch (error) {
    console.error('Upload API Error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error', details: (error instanceof Error) ? error.message : String(error) }), { status: 500 });
  }
}

