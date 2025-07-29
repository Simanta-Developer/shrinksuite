interface CompressButtonProps {
  onCompress: () => Promise<void>;
  isCompressed: boolean;
  disabled?: boolean;
}

export default function CompressButton({
  onCompress,
  isCompressed,
  disabled = false,
}: CompressButtonProps) {
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