// FileTargetSizeInput.tsx
import React from 'react';

interface FileTargetSizeInputProps {
  targetSize: number;
  targetUnit: 'KB' | 'MB' | 'GB';
  setTargetSize: (size: number) => void;
  setTargetUnit: (unit: 'KB' | 'MB' | 'GB') => void;
}

const FileTargetSizeInput: React.FC<FileTargetSizeInputProps> = ({
  targetSize,
  targetUnit,
  setTargetSize,
  setTargetUnit,
}) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <input
        type="number"
        min={0.1}
        step={0.1}
        value={targetSize}
        onChange={(e) => setTargetSize(Number(e.target.value))}
        placeholder="Target size"
        className="flex-1 p-2 border rounded"
      />
      <select
        value={targetUnit}
        onChange={(e) => setTargetUnit(e.target.value as 'KB' | 'MB' | 'GB')}
        className="p-2 border rounded"
      >
        <option value="KB">KB</option>
        <option value="MB">MB</option>
        <option value="GB">GB</option>
      </select>
    </div>
  );
};

export default FileTargetSizeInput;