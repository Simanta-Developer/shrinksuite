// FileInput.tsx
import React from 'react';

interface FileInputProps {
  onFileSelect: (file: File | null) => void;
}

const FileInput: React.FC<FileInputProps> = ({ onFileSelect }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileSelect(selectedFile);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Choose File</label>
      <input
        type="file"
        onChange={handleFileChange}
        className="block w-full text-sm file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
      />
    </div>
  );
};

export default FileInput;