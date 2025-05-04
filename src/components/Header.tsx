
'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          SiteSafe AI
        </Link>
        <div className="space-x-4 flex items-center">
          <Link href="/" className="hover:text-gray-300">
            Home
          </Link>
          {session && (
            <>
              <Link href="/upload" className="hover:text-gray-300">
                Upload Entry
              </Link>
              <Link href="/reports" className="hover:text-gray-300">
                My Reports
              </Link>
            </>
          )}
          {status === 'loading' ? (
            <span className="text-sm">Loading...</span>
          ) : session ? (
            <button
              onClick={() => signOut()}
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
            >
              Logout ({session.user?.email})
            </button>
          ) : (
            <button
              onClick={() => signIn()}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
            >
              Login
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

