import React from 'react';

interface ErrorMessageProps {
  message: string|null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="text-red-800 text-sm">
      <strong>Error:</strong> {message}
    </div>
  );
};

export default ErrorMessage;