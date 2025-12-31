'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Boards page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1260px] mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg p-8 text-center">
          {/* Error icon */}
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          {/* Error message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Failed to load boards
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't load your boards. Please try again.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 px-6 py-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-full transition-colors border border-gray-300"
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
