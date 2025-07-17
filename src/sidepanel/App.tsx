import { useState } from 'react';
import Dropzone from '../components/Dropzone';
import CompressControls from '../components/CompressControls';
import DownloadButton from '../components/DownloadButton';
import FileTargetSizeInput from '../components/FileTargetSizeInput';
import { compressFileByTypes } from '../utils/compressFileTypes';
import ErrorBanner from '../components/ErrorBanner';



export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [compressedFileUrl, setCompressedFileUrl] = useState<string | null>(null);
  const [isCompressed, setIsCompressed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [targetSize, setTargetSize] = useState<number | null>(null);
  const [targetUnit, setTargetUnit] = useState<'KB' | 'MB' | 'GB'>('KB');

  const isDisabled = !file;

  const handleFileReset = () => {
    setFile(null);
    setCompressedFileUrl(null);
    setIsCompressed(false);
    setTargetSize(0);
    setTargetUnit('KB');
    setError(null);
  };

  const handleCompress = async () => {
    if (!file || !targetSize || isNaN(targetSize)) {
      setError('Please select a file and enter a valid target size.');
      return;
    }

    const targetSizeBytes = targetSize * 1024;

    try {
      const compressed = await compressFileByTypes(file, targetSizeBytes);
      setCompressedFileUrl(URL.createObjectURL(compressed));
      setIsCompressed(true);
    } catch (err) {
      console.error('Compression failed:', err);
    }
};

  return (
    <div className="p-4 font-sans text-base flex flex-col items-center gap-y-6">
      <h1 className="text-3xl font-bold">ShrinkSuite</h1>

      <Dropzone setFile={setFile} onReset={handleFileReset} />

      <ErrorBanner message={error || ''} />

      {file && <p><strong>Selected:</strong> {file.name}</p>}

      <div className="mt-2 space-y-8">
        <FileTargetSizeInput
          targetSize={targetSize}
          targetUnit={targetUnit}
          setTargetSize={setTargetSize}
          setTargetUnit={setTargetUnit}
          disabled={isDisabled}
        />
      </div>

      <div className="mt-2 space-y-8">
        <CompressControls
          onCompress={handleCompress}
          isCompressed={isCompressed}
          disabled={isDisabled}
        />
      </div>

      {compressedFileUrl && file && (
      <DownloadButton fileUrl={compressedFileUrl} fileName={`compressed_${file.name}`} />
)}
    </div>
  );
}








