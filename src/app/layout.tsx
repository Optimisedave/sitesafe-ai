import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import AuthProvider from "./providers"; // Import the AuthProvider

export const metadata: Metadata = {
  title: "SiteSafe AI - Automated H&S Reporting", // Updated title
  description: "Turn site notes into audit-ready H&S reports in minutes.", // Updated description from brief
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <AuthProvider> {/* Wrap children with AuthProvider */} 
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

