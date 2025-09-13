'use client';

import { useState, useEffect } from 'react';
import { logger } from '../../../lib/logger';
import { motion } from 'framer-motion';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { MediaCoverage } from '../../../types/admin';
import { adminApi } from '../../../lib/adminApi';
import AdminProtection from '../../../components/common/AdminProtection';

const MEDIA_CATEGORIES = [
  '媒體報導',
  '專題報導',
  '新聞訪談',
  '技術分享',
  '產業評論',
  '其他'
];

const MEDIA_STATUS = [
  '已發布',
  '草稿',
  '審核中',
  '已下架'
];

export default function MediaCoveragePage() {
  const [mediaList, setMediaList] = useState<MediaCoverage[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaCoverage>({
    id: '',
    title: '',
    mediaName: '',
    summary: '',
    articleUrl: '',
    imageUrl: '',
    category: '媒體報導',
    status: '已發布',
    publicationDate: '',
    featured: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMediaCoverage();
  }, []);

  const fetchMediaCoverage = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getMediaCoverage();
      setMediaList(data);
    } catch (error) {
      logger.error('獲取媒體報導失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let result;
      if (editingMedia.id && editingMedia.id !== '') {
        result = await adminApi.updateMediaCoverage(editingMedia.id, editingMedia);
      } else {
        result = await adminApi.createMediaCoverage(editingMedia);
      }

      if (result) {
        await fetchMediaCoverage();
        resetForm();
        setIsEditing(false);
      }
    } catch (error) {
      logger.error('保存媒體報導失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (media: MediaCoverage) => {
    setEditingMedia(media);
    setIsEditing(true);
    
    // 滾動到表單位置
    const formSection = document.getElementById('media-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此媒體報導嗎？')) return;
    
    setLoading(true);
    try {
      const success = await adminApi.deleteMediaCoverage(id);
      if (success) {
        await fetchMediaCoverage();
      }
    } catch (error) {
      logger.error('刪除媒體報導失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingMedia({
      id: '',
      title: '',
      mediaName: '',
      summary: '',
      articleUrl: '',
      imageUrl: '',
      category: '媒體報導',
      status: '已發布',
      publicationDate: '',
      featured: false
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('zh-TW');
    } catch {
      return dateStr;
    }
  };

  return (
    <AdminProtection>
      <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 標題區 */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">媒體報導管理</h1>
          <Button
            onClick={() => {
              setIsEditing(true);
              resetForm();
              const formSection = document.getElementById('media-form');
              if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            新增媒體報導
          </Button>
        </div>

        {/* 媒體報導表單 */}
        {isEditing && (
          <motion.div
            id="media-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <h2 className="text-xl font-bold mb-6">
                {editingMedia.id ? '編輯媒體報導' : '新增媒體報導'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* 基本資訊 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      報導標題 *
                    </label>
                    <input
                      type="text"
                      value={editingMedia.title}
                      onChange={(e) => setEditingMedia({...editingMedia, title: e.target.value})}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="請輸入報導標題"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      媒體名稱 *
                    </label>
                    <input
                      type="text"
                      value={editingMedia.mediaName}
                      onChange={(e) => setEditingMedia({...editingMedia, mediaName: e.target.value})}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="如：聯合報、天下雜誌"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      報導類別
                    </label>
                    <select
                      value={editingMedia.category}
                      onChange={(e) => setEditingMedia({...editingMedia, category: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {MEDIA_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      發布狀態
                    </label>
                    <select
                      value={editingMedia.status}
                      onChange={(e) => setEditingMedia({...editingMedia, status: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {MEDIA_STATUS.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      發布日期
                    </label>
                    <input
                      type="date"
                      value={editingMedia.publicationDate || ''}
                      onChange={(e) => setEditingMedia({...editingMedia, publicationDate: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      報導連結
                    </label>
                    <input
                      type="url"
                      value={editingMedia.articleUrl || ''}
                      onChange={(e) => setEditingMedia({...editingMedia, articleUrl: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://"
                    />
                  </div>

                </div>

                {/* 圖片網址 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    報導圖片網址
                  </label>
                  <input
                    type="url"
                    value={editingMedia.imageUrl || ''}
                    onChange={(e) => setEditingMedia({...editingMedia, imageUrl: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://"
                  />
                </div>

                {/* 摘要 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    報導摘要
                  </label>
                  <textarea
                    value={editingMedia.summary || ''}
                    onChange={(e) => setEditingMedia({...editingMedia, summary: e.target.value})}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="報導內容摘要或重點"
                  />
                </div>

                {/* 精選報導 */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={editingMedia.featured}
                    onChange={(e) => setEditingMedia({...editingMedia, featured: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                    標記為精選報導
                  </label>
                </div>

                {/* 按鈕 */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      resetForm();
                    }}
                    className="bg-gray-500 hover:bg-gray-600"
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? '保存中...' : '保存'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {/* 媒體報導列表 */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">媒體報導列表</h2>
            <span className="text-gray-600">共 {mediaList.length} 則報導</span>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">載入中...</p>
            </div>
          ) : mediaList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">尚無媒體報導資料</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3">報導標題</th>
                    <th className="text-left p-3">媒體名稱</th>
                    <th className="text-left p-3">類別</th>
                    <th className="text-left p-3">狀態</th>
                    <th className="text-left p-3">發布日期</th>
                    <th className="text-left p-3">精選</th>
                    <th className="text-center p-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {mediaList.map((media) => (
                    <tr key={media.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{media.title}</p>
                          {media.summary && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {media.summary}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm font-medium">
                          {media.mediaName}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {media.category}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          media.status === '已發布' ? 'bg-green-100 text-green-800' :
                          media.status === '草稿' ? 'bg-yellow-100 text-yellow-800' :
                          media.status === '審核中' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {media.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">{formatDate(media.publicationDate)}</span>
                      </td>
                      <td className="p-3">
                        {media.featured && (
                          <span className="text-yellow-500">★</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(media)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            編輯
                          </button>
                          {media.articleUrl && (
                            <a
                              href={media.articleUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              檢視
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(media.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
      </div>
    </AdminProtection>
  );
}