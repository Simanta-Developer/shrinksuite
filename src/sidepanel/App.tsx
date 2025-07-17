import React, { useState } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { compressFileByTypes } from '../utils/compressFileTypes';

import FileInput from '../components/FileInput';
import FileTargetSizeInput from '../components/FileTargetSizeInput';
import CompressControls from '../components/CompressControls';
import ErrorBanner from '../components/ErrorBanner';

const ffmpeg = createFFmpeg({ log: false });

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [targetSize, setTargetSize] = useState<number>(100);
  const [targetUnit, setTargetUnit] = useState<'KB' | 'MB' | 'GB'>('KB');

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setError(null); // Clear previous errors
  };

  const getVideoDuration = async (file: File): Promise<number | undefined> => {
    if (!ffmpeg.isLoaded()) await ffmpeg.load();

    const inputName = 'input.mp4';
    ffmpeg.FS('writeFile', inputName, await fetchFile(file));

    let stderrLogs = '';
    ffmpeg.setLogger(({ type, message }) => {
      if (type === 'fferr') stderrLogs += message + '\n';
    });

    try {
      await ffmpeg.run('-i', inputName);
    } catch {
      // Expected failure, just capturing logs
    }

    const match = stderrLogs.match(/Duration:\s(\d+):(\d+):([\d.]+)/);
    if (match) {
      const [, hh, mm, ss] = match;
      return +hh * 3600 + +mm * 60 + +ss;
    }

    return undefined;
  };

  const handleCompress = async () => {
    if (!file || !targetSize || isNaN(targetSize)) {
      setError('Please select a file and enter a valid target size.');
      return;
    }

    setError(null);
    setLoading(true);
    setDownloadUrl(null);

    const multiplier =
      targetUnit === 'KB' ? 1024 :
      targetUnit === 'MB' ? 1024 * 1024 :
      1024 * 1024 * 1024;

    const targetSizeBytes = targetSize * multiplier;

    try {
      let durationInSec: number | undefined = undefined;

      if (file.type.startsWith('video/')) {
        durationInSec = await getVideoDuration(file);
        if (!durationInSec) {
          console.warn('Could not extract video duration');
        }
      }

      const compressedFile = await compressFileByTypes(file, targetSizeBytes, durationInSec);
      const blobUrl = URL.createObjectURL(compressedFile);
      setDownloadUrl(blobUrl);
    } catch (err: unknown) {
      console.error('Compression error:', err);
      setError(err instanceof Error ? err.message : 'Compression failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem', width: '300px', fontFamily: 'Arial' }}>
      <h2>ShrinkSuite</h2>

      <FileInput onFileSelect={handleFileChange} />
      <ErrorBanner message={error || ''} />

      {file && <p><strong>Selected:</strong> {file.name}</p>}

      <FileTargetSizeInput
        targetSize={targetSize}
        setTargetSize={setTargetSize}
        targetUnit={targetUnit}
        setTargetUnit={setTargetUnit}
      />

      <CompressControls
        file={file}
        loading={loading}
        handleCompress={handleCompress}
      />

      {downloadUrl && (
        <div style={{ marginTop: '1rem' }}>
          <a href={downloadUrl} download={`compressed_${file?.name ?? 'file'}`}>
            Download Compressed File
          </a>
        </div>
      )}
    </div>
  );
};

export default App;




