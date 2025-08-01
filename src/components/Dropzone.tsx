import React, { useRef } from 'react';

interface DropzoneProps {
  setFile: (f: File) => void;
  onReset: () => void;
  disabled?: boolean;
}

export default function Dropzone({ setFile, onReset, disabled = false }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Clear the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleClick = () => {
    // Clear the input value before opening file dialog
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    
    inputRef.current?.click();
    onReset();
  };

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`border-2 border-dashed border-gray-500 rounded-lg h-[50vh] w-[80vw] flex items-center justify-center text-center text-gray-600 mb-6 transition-opacity ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,application/pdf,video/*"
        disabled={disabled}
      />
      Drag and drop your file here, or click to browse
    </div>
  );
}