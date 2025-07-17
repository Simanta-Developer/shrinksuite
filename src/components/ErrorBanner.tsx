// ErrorBanner.tsx
import React from 'react';

interface ErrorBannerProps {
  message: string|null;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="mt-4 p-3 rounded bg-red-100 border border-red-300 text-red-800 text-sm">
      <strong>Error:</strong> {message}
    </div>
  );
};

export default ErrorBanner;