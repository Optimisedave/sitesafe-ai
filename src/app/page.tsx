
'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Use 'next/navigation' for App Router

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleGetStartedClick = () => {
    if (status === 'authenticated') {
      router.push('/upload'); // Route to upload page if logged in
    } else if (status === 'unauthenticated') {
      signIn(); // Trigger NextAuth sign-in flow if not logged in
    }
    // If status is 'loading', the button is disabled
  };

  return (
    // Removed the outer div and header, as the layout provides the main structure and header
    <>
      {/* Marketing Header Text */}
      <div className="text-center mb-12 pt-8"> {/* Added padding top */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Turn site notes into audit-ready H&S reports in minutes.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          SiteSafe AI analyses your diaries & photos, flags risks, and emails you a PDF – before you’ve finished your brew.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="grid md:grid-cols-3 gap-8 text-center mb-12">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="font-semibold text-xl mb-2">Automated Reporting</h3>
          <p className="text-gray-600">Generate HSE-ready reports instantly from daily logs, checklists, and photos.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="font-semibold text-xl mb-2">AI Risk Flagging</h3>
          <p className="text-gray-600">Proactively identify potential hazards mentioned in site notes or visible in images.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="font-semibold text-xl mb-2">Save Time & Reduce Fines</h3>
          <p className="text-gray-600">Slash admin time by 75% and minimize exposure to costly compliance breaches.</p>
        </div>
      </div>

      {/* Get Started Button Section (Replaces Pricing Card) */}
      <div className="text-center mb-12">
        <button
          onClick={handleGetStartedClick}
          disabled={status === 'loading'}
          className={`inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 ${status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {status === 'loading' ? 'Loading...' : 'Get Started'}
        </button>
      </div>

      {/* Footer - Can be kept or moved to layout if desired */}
      <footer className="text-center text-gray-500 text-sm mt-12">
        © {new Date().getFullYear()} SiteSafe AI. All rights reserved.
      </footer>
    </>
  );
}

