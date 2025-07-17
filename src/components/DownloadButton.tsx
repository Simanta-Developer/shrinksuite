interface DownloadButtonProps {
  fileUrl: string;
  fileName?: string;
}

export default function DownloadButton({ fileUrl, fileName = 'compressed_file' }: DownloadButtonProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={handleDownload}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded text-lg font-semibold"
      >
        Download Compressed File
      </button>
    </div>
  );
}
