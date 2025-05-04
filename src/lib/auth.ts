import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
// import prisma from "@/lib/prisma"; // Removed import to break potential circular dependency
import { PrismaClient } from "@prisma/client"; // Import PrismaClient directly
import { AuthOptions, User, Session } from "next-auth"; // Import AuthOptions, User, Session types
import { AdapterUser } from "next-auth/adapters"; // Import AdapterUser

// Instantiate PrismaClient directly for the adapter
const prismaAuth = new PrismaClient();

// Define a custom Session type if needed to include id and role
interface CustomSession extends Session {
  user?: {
    id?: string | null;
    role?: string | null; // Assuming role is a string, adjust if needed
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// Define authOptions here
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prismaAuth), // Use the locally instantiated client
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
    // Explicitly type the session and user parameters
    async session({ session, user }: { session: CustomSession; user: User | AdapterUser }): Promise<CustomSession> { 
      // Add user id and role to the session object
      if (session?.user) {
        session.user.id = user.id;
        // Cast user to access potential custom properties like role
        // Ensure your Prisma User model actually has a 'role' field
        session.user.role = (user as { role?: string | null })?.role ?? null; 
      }
      return session;
    },
  },
  // Enable debug messages in development environment
  debug: process.env.NODE_ENV === "development",
};

