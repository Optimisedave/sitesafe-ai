
'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import FeatureCard from '@/components/FeatureCard'; // Assuming alias is set up
import Navbar from '@/components/Navbar'; // Import Navbar
import Footer from '@/components/Footer'; // Import Footer

// Placeholder Icons (Replace with actual icons later, e.g., from lucide-react)
const PlaceholderIcon = () => (
  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export default function LandingPage() {
  const { data: session, status } = useSession();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar /> {/* Add Navbar at the top */} 
      <main className="flex-grow"> {/* Use flex-grow to push footer down */}
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center px-4 py-20 min-h-screen bg-gradient-to-b from-white to-gray-50">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 max-w-3xl">
            Turn site notes into audit-ready H&S reports in minutes.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
            SiteSafe AI analyses your diaries & photos, flags risks, and emails you a PDF – before you’ve finished your brew.
          </p>
          {/* Conditional CTA based on session status */}
          {status !== 'authenticated' && (
            <Link 
              href="/api/auth/signin" // Link to sign-in page
              className="px-8 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-md shadow-md hover:bg-indigo-700 hover:shadow-lg transition duration-300 ease-in-out"
            >
              Get Started
            </Link>
          )}
          {status === 'authenticated' && (
            <Link 
              href="/upload" // Link to upload page if logged in
              className="px-8 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-md shadow-md hover:bg-indigo-700 hover:shadow-lg transition duration-300 ease-in-out"
            >
              Go to Dashboard
            </Link>
          )}
        </section>

        {/* Features Grid Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How SiteSafe AI Helps You</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<PlaceholderIcon />} 
                title="Automated Reporting"
                description="Generate comprehensive H&S reports automatically from your site notes and photos."
              />
              <FeatureCard 
                icon={<PlaceholderIcon />} 
                title="AI Risk Flagging"
                description="Our AI identifies potential hazards and compliance issues, helping you stay ahead."
              />
              <FeatureCard 
                icon={<PlaceholderIcon />} 
                title="Save Time & Reduce Fines"
                description="Streamline your compliance process, reduce paperwork, and avoid costly HSE fines."
              />
            </div>
          </div>
        </section>
      </main>
      <Footer /> {/* Add Footer at the bottom */} 
    </div>
  );
}

