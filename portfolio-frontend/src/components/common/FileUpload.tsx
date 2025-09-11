'use client';

import { useState, useRef } from 'react';
import { logger } from '../../lib/logger';
import { motion } from 'framer-motion';
import { FileData } from '../../types/admin';
import { adminApi } from '../../lib/adminApi';

interface FileUploadProps {
  onFileUpload: (file: FileData) => void;
  acceptedTypes?: string[];
  maxSize?: number; // bytes
  currentFile?: FileData | null;
  onFileRemove?: () => void;
  className?: string;
  label?: string;
}

export default function FileUpload({
  onFileUpload,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  maxSize = 5 * 1024 * 1024, // 5MB
  currentFile,
  onFileRemove,
  className = '',
  label = '上傳文件'
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    try {
      setIsUploading(true);
      
      // 驗證文件類型
      if (!acceptedTypes.includes(file.type)) {
        throw new Error(`不支援的文件類型。支援的類型：${acceptedTypes.join(', ')}`);
      }

      // 驗證文件大小
      if (file.size > maxSize) {
        throw new Error(`文件大小超過限制 (${Math.round(maxSize / 1024 / 1024)}MB)`);
      }

      const uploadedFile = await adminApi.uploadFile(file);
      if (uploadedFile) {
        onFileUpload(uploadedFile);
      } else {
        throw new Error('上傳失敗');
      }
    } catch (error) {
      logger.error('File upload error:', error);
      alert(error instanceof Error ? error.message : '文件上傳失敗');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / 1024 / 1024)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (type === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {currentFile ? (
        // 顯示已上傳的文件
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(currentFile.type)}
              <div>
                <p className="font-medium text-gray-900">{currentFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(currentFile.size)} • 
                  上傳於 {new Date(currentFile.uploadedAt).toLocaleDateString('zh-TW')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {currentFile.type.startsWith('image/') && (
                <button
                  onClick={() => {
                    const url = adminApi.getFileDataUrl(currentFile);
                    window.open(url, '_blank');
                  }}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                >
                  預覽
                </button>
              )}
              
              {currentFile.type === 'application/pdf' && (
                <button
                  onClick={() => {
                    const url = adminApi.getFileDataUrl(currentFile);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = currentFile.name;
                    link.click();
                  }}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                >
                  下載
                </button>
              )}
              
              {onFileRemove && (
                <button
                  onClick={onFileRemove}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                >
                  移除
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        // 文件上傳區域
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-gray-600">上傳中...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <svg 
                className="w-12 h-12 text-gray-400 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              
              <p className="text-lg font-medium text-gray-900 mb-2">
                點擊上傳或拖拽文件到此處
              </p>
              
              <p className="text-sm text-gray-500 mb-2">
                支援 JPG, PNG, GIF, PDF 格式
              </p>
              
              <p className="text-xs text-gray-400">
                最大文件大小: {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}