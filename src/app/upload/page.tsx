
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
// useRouter is no longer needed for the client-side redirect

// Simple Spinner component (can be moved to a separate file later)
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

// Alert component for messages/errors (can be moved later)
interface AlertProps {
  type: 'success' | 'error';
  message: string;
}
const Alert = ({ type, message }: AlertProps) => {
  const baseClasses = "px-4 py-3 rounded relative mb-4";
  const typeClasses = type === 'success'
    ? "bg-green-100 border border-green-400 text-green-700"
    : "bg-red-100 border border-red-400 text-red-700";
  return (
    <div className={`${baseClasses} ${typeClasses}`} role="alert">
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default function UploadPage() {
  const { data: session, status } = useSession();
  const [diaryText, setDiaryText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Middleware now handles unauthenticated access, so no client-side redirect needed here.

  // Improved loading state
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner />
        <p className="ml-2 text-gray-600">Loading session...</p>
      </div>
    );
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    if (!diaryText && !file) {
      setError('Please provide either diary text or a file.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('diaryText', diaryText);
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload entry.');
      }

      setDiaryText('');
      setFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setMessage('Entry queued successfully! Check My Reports page for status.'); // Slightly improved message

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during upload.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Upload New Site Entry</h1>
      
      {/* Display messages/errors using Alert component */} 
      {message && <Alert type="success" message={message} />}
      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="diaryText" className="block text-sm font-medium text-gray-700 mb-1">
            Diary Text / Notes
          </label>
          <textarea
            id="diaryText"
            name="diaryText"
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={diaryText}
            onChange={(e) => setDiaryText(e.target.value)}
            placeholder="Enter your site notes, observations, or diary entry here..."
            aria-label="Diary Text / Notes"
          />
        </div>

        <div>
          <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-1">
            Optional: Upload Photo/Document
          </label>
          <input
            type="file"
            id="file-input"
            name="file"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            onChange={handleFileChange}
            accept=".txt,.md,.pdf,.jpg,.jpeg,.png"
            aria-label="Upload Photo/Document"
          />
           {file && <p className="text-sm text-gray-500 mt-2">Selected file: {file.name}</p>}
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting || status !== 'authenticated'}
            className={`inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting && <Spinner />} 
            <span className={isSubmitting ? 'ml-2' : ''}>
              {isSubmitting ? 'Submitting...' : 'Submit Entry'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}

