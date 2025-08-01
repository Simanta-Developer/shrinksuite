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
  const [isCompressed, setIsCompressed] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState<boolean>(false);

  const [targetSize, setTargetSize] = useState<number | null>(null);
  const [targetUnit, setTargetUnit] = useState<'KB' | 'MB' | 'GB'>('KB');

  const isFileNotSelected = !file;

  const handleFileReset = () => {
    if(compressing) return;
    
    setFile(null);
    setCompressedFileUrl(null);
    setIsCompressed(false);
    setTargetSize(null);
    setTargetUnit('KB');
    setError(null);
    setCompressing(false);
  };

  const handleCompress = async () => {
    if (!file || !targetSize || isNaN(targetSize)) {
      setError('Please select a file and enter a valid target size.');
      return;
    }

    setError(null);
    setCompressing(true);

    const targetSizeBytes = toBytes(targetSize, targetUnit);
    let compressed: File | null | void;

    try {
      compressed = await compressFileByTypes(file, targetSizeBytes);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Compression failed unexpectedly.');
      } else {
        setError('Compression failed unexpectedly.');
      }
      setCompressing(false);
      return;
    }

    if (compressed === null) {
      setError('Compression not possible at this size—please select a larger target.');
      setCompressing(false);
      return;
    }

    setCompressedFileUrl(URL.createObjectURL(compressed));
    setIsCompressed(true);
    setError(null);
    setCompressing(false);
  };

  return (
    <div className="p-4 font-sans text-base flex flex-col items-center gap-y-6">
      <h1 className="text-3xl font-bold">ShrinkSuite</h1>

      <Dropzone 
        setFile={setFile} 
        onReset={handleFileReset}
        disabled ={compressing}
      />

      <ErrorBanner message={error} />

      {file && <p><strong>Selected:</strong> {file.name}</p>}

      <div className="mt-2 space-y-8">
        <FileTargetSizeInput
          targetSize={targetSize}
          targetUnit={targetUnit}
          setTargetSize={setTargetSize}
          setTargetUnit={setTargetUnit}
          disabled={isFileNotSelected || compressing}
        />
      </div>

      <div className="mt-2 space-y-8">
        <Suspense fallback={<div>Loading controls...</div>}>
          <CompressButton
            onCompress={handleCompress}
            isCompressed={isCompressed}
            isCompressing={compressing}
            disabled={isFileNotSelected || compressing}
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