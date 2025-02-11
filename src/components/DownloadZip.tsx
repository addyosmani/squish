import React from 'react';
import { Download, FolderArchive ,} from 'lucide-react';

interface DownloadZipProps {
  onDownloadAll: () => void;
}

export function DownloadZip({ onDownloadAll }: DownloadZipProps) {
  return (
    <button
      onClick={onDownloadAll}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
    >
      <Download className="w-5 h-5" />
      Download Zip
      <FolderArchive className="w-5 h-5"/>
    </button>
  );
}