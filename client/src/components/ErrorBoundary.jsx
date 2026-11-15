import { useState } from 'react';

export default function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  const handleError = (error, errorInfo) => {
    console.error('Error caught by boundary:', error, errorInfo);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#FDFCF7] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-serif text-6xl font-bold text-gray-900 mb-4">500</h1>
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="font-sans text-gray-600 mb-6">An unexpected error occurred. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 text-xs font-bold text-white bg-gray-900 rounded hover:bg-gray-800 transition-colors tracking-tighter uppercase"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return children;
}
