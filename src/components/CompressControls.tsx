// components/CompressControls.tsx
interface CompressControlsProps {
  onCompress: () => Promise<void>;
  isCompressed: boolean;
  disabled?: boolean;
}

export default function CompressControls({
  onCompress,
  isCompressed,
  disabled = false,
}: CompressControlsProps) {
  return (
    <div className="flex justify-center">
      <button
        onClick={onCompress}
        disabled={disabled || isCompressed}
        className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold ${
          (disabled || isCompressed) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isCompressed ? 'Compressed!' : 'Compress File'}
      </button>
    </div>
  );
}







