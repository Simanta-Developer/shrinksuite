import React, { useRef } from 'react';

export default function Dropzone({ setFile, onReset }: { setFile: (f: File) => void; onReset: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div
      onClick={() => {
        inputRef.current?.click();
        onReset();
      }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-500 rounded-lg h-[35vh] flex items-center justify-center text-center cursor-pointer text-gray-600 mb-6"
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,application/pdf"
      />
      Drag and drop your file here, or click to browse
    </div>
  );
}