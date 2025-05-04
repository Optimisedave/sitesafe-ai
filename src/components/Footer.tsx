
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} SiteSafe AI. All rights reserved.
        </p>
        {/* Add other footer links or elements here if needed later */}
        {/* Example: 
        <div className="mt-4 flex justify-center space-x-6">
          <a href="#" className="text-sm text-gray-500 hover:text-gray-600">Privacy Policy</a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-600">Terms of Service</a>
        </div>
        */}
      </div>
    </footer>
  );
};

export default Footer;

