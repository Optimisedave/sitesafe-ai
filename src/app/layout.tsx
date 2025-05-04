import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import AuthProvider from "./providers"; // Import the AuthProvider
import Header from "@/components/Header"; // Import the Header component

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
          <Header /> {/* Add the Header component */} 
          <main className="container mx-auto p-4"> {/* Add a main tag for content */} 
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

