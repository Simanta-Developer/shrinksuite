import { useState, Suspense, lazy } from 'react';
import Dropzone from '../components/Dropzone';
import FileTargetSizeInput from '../components/FileTargetSizeInput';
import { compressFileByTypes } from '../utils/compressFileTypes';
import ErrorBanner from '../components/ErrorMessage';

// Lazy load components to reduce initial bundle size
const CompressButton = lazy(() => import('../components/CompressButton'));
const DownloadButton = lazy(() => import('../components/DownloadButton'));

function toBytes(size: number, unit: 'KB' | 'MB' | 'GB'): number {
  switch(unit) {
    case 'KB': return size * 1024;
    case 'MB': return size * 1024 * 1024;
    case 'GB': return size * 1024 * 1024 * 1024;
    default: return size * 1024; // default fallback to KB
  }
}

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
    setTargetSize(null);
    setTargetUnit('KB');
    setError(null);
  };

  const handleCompress = async () => {
    if (!file || !targetSize || isNaN(targetSize)) {
      setError('Please select a file and enter a valid target size.');
      return;
    }

    const targetSizeBytes = toBytes(targetSize, targetUnit);
    const compressed = await compressFileByTypes(file, targetSizeBytes);
    if(!compressed) {
      setError('Compression failed. Please try a different file or target size.')
      return;
    }
    setCompressedFileUrl(URL.createObjectURL(compressed));
    setIsCompressed(true);
    setError(null);
  };

  return (
    <div className="p-4 font-sans text-base flex flex-col items-center gap-y-6">
      <h1 className="text-3xl font-bold">ShrinkSuite</h1>

      <Dropzone setFile={setFile} onReset={handleFileReset} />

      <ErrorBanner message={error} />

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
        <Suspense fallback={<div>Loading controls...</div>}>
          <CompressButton
            onCompress={handleCompress}
            isCompressed={isCompressed}
            disabled={isDisabled}
          />
        </Suspense>
      </div>

      {compressedFileUrl && file && (
        <Suspense fallback={<div>Loading download button...</div>}>
          <DownloadButton fileUrl={compressedFileUrl} fileName={`compressed_${file.name}`} />
        </Suspense>
      )}
    </div>
  );
}
