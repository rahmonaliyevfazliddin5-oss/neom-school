import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Upload, File, CheckCircle2 } from 'lucide-react';

export interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSizeMb?: number;
  onFileSelect?: (file: File) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = 'image/*',
  maxSizeMb = 10,
  onFileSelect,
  className,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={cn('flex flex-col gap-2 w-full', className)}>
      {label && (
        <span className="text-[13px] font-medium text-[#0b2a5b] dark:text-[#d5e3ff]">
          {label}
        </span>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed border-[#f78b2d] rounded-[16px] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors duration-150 text-center min-h-[140px]',
          isDragOver ? 'bg-[#fdebd9]/40' : 'bg-white hover:bg-[#fdebd9]/20',
          'dark:bg-[#141d2e] dark:hover:bg-[#1f2b40]',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {selectedFile ? (
          <div className="flex items-center gap-3 text-left">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-semibold text-sm text-[#0b2a5b] dark:text-white line-clamp-1">
                {selectedFile.name}
              </p>
              <p className="text-xs text-[#4a5f82] dark:text-[#9db4dd]">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Boshqa fayl tanlash uchun bosing
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-[#fdebd9] flex items-center justify-center text-[#8a3d00]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0b2a5b] dark:text-white">
                Faylni bu yerga torting yoki <span className="text-[#f78b2d]">tanlang</span>
              </p>
              <p className="text-xs text-[#4a5f82] dark:text-[#9db4dd] mt-1">
                Maksimal hajm: {maxSizeMb} MB ({accept})
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
