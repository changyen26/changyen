'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImageUrl?: string | null;
  onImageRemove?: () => void;
  className?: string;
  label?: string;
}

export default function ImageUpload({
  onImageUpload,
  currentImageUrl,
  onImageRemove,
  className = '',
  label = '上傳圖片'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/v1/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '上傳失敗');
    }

    const result = await response.json();
    return `${apiUrl}${result.file_url}`;
  };

  const handleFileSelect = async (file: File) => {
    try {
      setIsUploading(true);

      // 檢查文件類型
      if (!file.type.startsWith('image/')) {
        throw new Error('請選擇圖片文件！');
      }

      // 檢查文件大小 (最大 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('圖片大小不能超過 5MB！');
      }

      // 上傳文件
      const imageUrl = await uploadFile(file);
      console.log('🖼️ 圖片上傳成功，調用回調:', imageUrl);
      onImageUpload(imageUrl);
      console.log('🖼️ 回調函數已調用');

    } catch (error) {
      console.error('Image upload error:', error);
      alert(error instanceof Error ? error.message : '圖片上傳失敗');
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

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {currentImageUrl ? (
        // 顯示已上傳的圖片
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50"
        >
          <div className="flex items-start justify-between">
            <div className="flex-shrink-0">
              <img
                src={currentImageUrl}
                alt="上傳的圖片"
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
              />
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => window.open(currentImageUrl, '_blank')}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                預覽
              </button>

              {onImageRemove && (
                <button
                  onClick={onImageRemove}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                >
                  移除
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        // 圖片上傳區域
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
                點擊上傳或拖拽圖片到此處
              </p>

              <p className="text-sm text-gray-500 mb-2">
                支援 JPG, PNG, GIF, WebP 格式
              </p>

              <p className="text-xs text-gray-400">
                最大文件大小: 5MB
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}