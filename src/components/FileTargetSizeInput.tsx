interface FileTargetSizeInputProps {
  targetSize: number | null;
  targetUnit: 'KB' | 'MB' | 'GB';
  setTargetSize: (size: number | null) => void;
  setTargetUnit: (unit: 'KB' | 'MB' | 'GB') => void;
  disabled?: boolean;
}

export default function FileTargetSizeInput({
  targetSize,
  targetUnit,
  setTargetSize,
  setTargetUnit,
  disabled = false,
}: FileTargetSizeInputProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0.1}
        step={0.1}
        value={targetSize ?? ''}
        onChange={(e) => setTargetSize(Number(e.target.value))}
        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
        placeholder="Target size"
        disabled={disabled}
      />
      
      <select
        value={targetUnit}
        onChange={(e) => setTargetUnit(e.target.value as 'KB' | 'MB' | 'GB')}
        className="px-3 py-2 border rounded-md bg-white disabled:bg-gray-100"
        disabled={disabled}
      >
        <option value="KB">KB</option>
        <option value="MB">MB</option>
        <option value="GB">GB</option>
      </select>
    </div>
  );
}

