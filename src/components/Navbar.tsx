'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

// Placeholder for a Menu icon (e.g., from lucide-react)
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

// Placeholder for a Close icon (e.g., from lucide-react)
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              SiteSafe AI
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Add other nav links here if needed later */}
            {/* <Link href="#features" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Features</Link> */}
            {/* <Link href="#pricing" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Pricing</Link> */}
            
            {status === 'authenticated' ? (
              <button 
                onClick={() => signOut()} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              >
                Logout
              </button>
            ) : (
              <Link 
                href="/api/auth/signin" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              >
                Login / Sign Up
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Add other nav links here if needed later */}
            {/* <Link href="#features" className="text-gray-600 hover:bg-gray-50 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium">Features</Link> */}
            {/* <Link href="#pricing" className="text-gray-600 hover:bg-gray-50 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium">Pricing</Link> */}
            
            {status === 'authenticated' ? (
              <button 
                onClick={() => { signOut(); toggleMobileMenu(); }} 
                className="w-full text-left bg-red-500 hover:bg-red-600 text-white block px-3 py-2 rounded-md text-base font-medium transition duration-150 ease-in-out"
              >
                Logout
              </button>
            ) : (
              <Link 
                href="/api/auth/signin" 
                onClick={toggleMobileMenu} // Close menu on navigation
                className="bg-indigo-600 hover:bg-indigo-700 text-white block px-3 py-2 rounded-md text-base font-medium transition duration-150 ease-in-out"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

