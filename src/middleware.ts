
// src/middleware.ts
import { withAuth } from "next-auth/middleware";

// More information: https://next-auth.js.org/configuration/nextjs#middleware

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    // console.log("Middleware running for:", req.nextUrl.pathname);
    // console.log("Token:", req.nextauth.token);
    // You can add additional logic here if needed, e.g., role-based access
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // If there is a token, the user is authorized
    },
    // If authorized callback returns false (no token), redirect to login page
    // The default login page is /api/auth/signin
    // The middleware automatically handles the callbackUrl
  }
);

// Define the routes that the middleware should apply to
export const config = {
  matcher: [
    "/upload", // Protect the upload page
    "/reports", // Protect the reports list page
    "/reports/:path*", // Protect all report detail pages
    // Add any other routes that require authentication
  ],
};

