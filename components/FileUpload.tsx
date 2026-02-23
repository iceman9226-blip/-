import React, { useRef, useState, useEffect } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (base64: string, preview: string, sourceUrl: string | undefined, mimeType: string) => void;
  isAnalyzing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle Paste Event (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isAnalyzing) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) processFile(blob);
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isAnalyzing]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("请上传图片文件 (PNG, JPG)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1];
      // Pass undefined for sourceUrl as the input is removed
      onFileSelect(base64, result, undefined, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`relative w-full border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out cursor-pointer ${
          dragActive ? 'border-[#F6483B] bg-[#F6483B]/5' : 'border-slate-300 bg-white hover:border-slate-400'
        } ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={isAnalyzing}
        />

        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-slate-100 rounded-full">
            <Upload className="w-8 h-8 text-slate-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">点击上传或直接粘贴 (Ctrl+V)</h3>
            <p className="text-xs text-slate-400 mt-2">支持 PNG, JPG (高保真原型或截图)</p>
          </div>
          <button
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            选择文件
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;