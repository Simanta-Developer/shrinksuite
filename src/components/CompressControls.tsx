// CompressControls.tsx
import React from 'react';

interface CompressControlsProps {
  file: File | null;
  loading: boolean;
  handleCompress: () => void | Promise<void>;
}

const CompressControls: React.FC<CompressControlsProps> = ({ handleCompress, loading, file }) => {
  return (
    <button
      onClick={handleCompress}
      disabled={loading || !file}
      className={`w-full mt-2 p-2 rounded text-white font-semibold transition-colors duration-200
        ${loading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
    >
      {loading ? 'Compressing...' : 'Compress'}
    </button>
  );
};

export default CompressControls;