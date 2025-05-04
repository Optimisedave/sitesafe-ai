// Basic Landing Page
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Turn site notes into audit-ready H&S reports in minutes.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          SiteSafe AI analyses your diaries & photos, flags risks, and emails you a PDF – before you’ve finished your brew.
        </p>
      </header>

      <main className="w-full max-w-4xl mb-12">
        {/* Placeholder for 3 benefits section */}
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

        {/* Placeholder for Pricing Card */}
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 text-center">
          <h2 className="text-2xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-gray-700 text-4xl font-extrabold mb-2">£XX <span className="text-lg font-normal text-gray-500">/month</span></p>
          <p className="text-gray-600 mb-6">Includes unlimited reports and AI analysis. Yearly plan available (Save 15%).</p>
          <Link href="/api/auth/signin" legacyBehavior>
            <a className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200">
              Start free 7-day trial
            </a>
          </Link>
        </div>
      </main>

      <footer className="text-gray-500 text-sm">
        © {new Date().getFullYear()} SiteSafe AI. All rights reserved.
      </footer>
    </div>
  );
}

