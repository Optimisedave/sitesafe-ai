import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth"; // Import DefaultSession
// Removed User and Session type imports as they cause errors
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
// Removed import of shared prisma instance
import { AdapterUser } from "next-auth/adapters"; // Import AdapterUser
// Removed problematic PrismaClient import
// Use require for PrismaClient as a workaround for type issues
const { PrismaClient } = require("@prisma/client");

// --- Inlined Prisma Client Instantiation ---
// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prismaAuthInstance: any | undefined; // Use any to bypass type checking
}

const prismaAuth =
  global.prismaAuthInstance ||
  new PrismaClient({
    // log: ["query"], // Optional: enable logs if needed for debugging
  });

if (process.env.NODE_ENV !== "production") global.prismaAuthInstance = prismaAuth;
// --- End of Inlined Prisma Client Instantiation ---


// --- Inlined authOptions from src/lib/auth.ts --- 

// Removed CustomSession interface

// Define authOptions directly in this file, using NextAuthOptions type
const authOptions: NextAuthOptions = {
  // Use the locally instantiated prismaAuth client, cast to any if needed
  adapter: PrismaAdapter(prismaAuth as any), 
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT), // Ensure port is a number
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      // maxAge: 24 * 60 * 60, // How long email links are valid for (default 24h)
    }),
    // Potentially add other providers like Google, GitHub etc. later
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database", // Use database sessions to persist user sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    // signIn: 
    // verifyRequest: 
    // error: 
    // newUser: 
  },
  callbacks: {
    // Updated session callback signature and logic as per user suggestion (Option 2)
    async session({ session, user }: { 
      session: DefaultSession; 
      user: AdapterUser; 
    }): Promise<DefaultSession> { 
      // Add user id to the session object
      // Note: DefaultSession['user'] might not have 'id'. We add it dynamically.
      if (session?.user) {
        (session.user as any).id = user.id;
        // Role cannot be added directly to DefaultSession.user without extending the type
      }
      return session;
    },
  },
  // Enable debug messages in development environment
  debug: process.env.NODE_ENV === "development",
};

// --- End of Inlined authOptions --- 

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

