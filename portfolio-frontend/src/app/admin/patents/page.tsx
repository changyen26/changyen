'use client';

import { useState, useEffect } from 'react';
import { logger } from '../../../lib/logger';
import { motion } from 'framer-motion';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { Patent } from '../../../types/admin';
import { adminApi } from '../../../lib/adminApi';
import AdminProtection from '../../../components/common/AdminProtection';

const PATENT_CATEGORIES = [
  '發明專利',
  '新型專利',
  '外觀設計專利',
  '商標專利',
  '軟體專利',
  '其他'
];

const PATENT_STATUS = [
  '審查中',
  '已核准',
  '已公開',
  '已駁回',
  '已撤回',
  '已放棄'
];

const PATENT_COUNTRIES = [
  '台灣',
  '美國',
  '中國大陸',
  '日本',
  '韓國',
  '歐盟',
  '其他'
];

export default function PatentsPage() {
  const [patents, setPatents] = useState<Patent[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPatent, setEditingPatent] = useState<Patent>({
    id: '',
    title: '',
    patentNumber: '',
    description: '',
    category: '發明專利',
    status: '審查中',
    filingDate: '',
    grantDate: '',
    publicationDate: '',
    inventors: [],
    assignee: '',
    country: '台灣',
    patentUrl: '',
    priorityDate: '',
    classification: '',
    featured: false
  });
  const [inventorInput, setInventorInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatents();
  }, []);

  const fetchPatents = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPatents();
      setPatents(data);
    } catch (error) {
      logger.error('獲取專利失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let result;
      if (editingPatent.id && editingPatent.id !== '') {
        result = await adminApi.updatePatent(editingPatent.id, editingPatent);
      } else {
        result = await adminApi.createPatent(editingPatent);
      }

      if (result) {
        await fetchPatents();
        resetForm();
        setIsEditing(false);
      }
    } catch (error) {
      logger.error('保存專利失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patent: Patent) => {
    setEditingPatent(patent);
    setIsEditing(true);
    
    // 滾動到表單位置
    const formSection = document.getElementById('patent-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此專利嗎？')) return;
    
    setLoading(true);
    try {
      const success = await adminApi.deletePatent(id);
      if (success) {
        await fetchPatents();
      }
    } catch (error) {
      logger.error('刪除專利失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingPatent({
      id: '',
      title: '',
      patentNumber: '',
      description: '',
      category: '發明專利',
      status: '審查中',
      filingDate: '',
      grantDate: '',
      publicationDate: '',
      inventors: [],
      assignee: '',
      country: '台灣',
      patentUrl: '',
      priorityDate: '',
      classification: '',
      featured: false
    });
    setInventorInput('');
  };

  const addInventor = () => {
    if (inventorInput.trim()) {
      const newInventors = [...(editingPatent.inventors || []), inventorInput.trim()];
      setEditingPatent({ ...editingPatent, inventors: newInventors });
      setInventorInput('');
    }
  };

  const removeInventor = (index: number) => {
    const newInventors = editingPatent.inventors?.filter((_, i) => i !== index) || [];
    setEditingPatent({ ...editingPatent, inventors: newInventors });
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
          <h1 className="text-3xl font-bold text-gray-900">專利管理</h1>
          <Button
            onClick={() => {
              setIsEditing(true);
              resetForm();
              const formSection = document.getElementById('patent-form');
              if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            新增專利
          </Button>
        </div>

        {/* 專利表單 */}
        {isEditing && (
          <motion.div
            id="patent-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <h2 className="text-xl font-bold mb-6">
                {editingPatent.id ? '編輯專利' : '新增專利'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* 基本資訊 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      專利標題 *
                    </label>
                    <input
                      type="text"
                      value={editingPatent.title}
                      onChange={(e) => setEditingPatent({...editingPatent, title: e.target.value})}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="請輸入專利標題"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      專利號碼
                    </label>
                    <input
                      type="text"
                      value={editingPatent.patentNumber || ''}
                      onChange={(e) => setEditingPatent({...editingPatent, patentNumber: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="如：TW123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      專利類別
                    </label>
                    <select
                      value={editingPatent.category}
                      onChange={(e) => setEditingPatent({...editingPatent, category: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PATENT_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      申請狀態
                    </label>
                    <select
                      value={editingPatent.status}
                      onChange={(e) => setEditingPatent({...editingPatent, status: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PATENT_STATUS.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      申請國家
                    </label>
                    <select
                      value={editingPatent.country}
                      onChange={(e) => setEditingPatent({...editingPatent, country: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PATENT_COUNTRIES.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      專利權人
                    </label>
                    <input
                      type="text"
                      value={editingPatent.assignee || ''}
                      onChange={(e) => setEditingPatent({...editingPatent, assignee: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="專利權人姓名或公司"
                    />
                  </div>
                  
                </div>

                {/* 日期區塊 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      申請日期
                    </label>
                    <input
                      type="date"
                      value={editingPatent.filingDate || ''}
                      onChange={(e) => setEditingPatent({...editingPatent, filingDate: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      核准日期
                    </label>
                    <input
                      type="date"
                      value={editingPatent.grantDate || ''}
                      onChange={(e) => setEditingPatent({...editingPatent, grantDate: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      公開日期
                    </label>
                    <input
                      type="date"
                      value={editingPatent.publicationDate || ''}
                      onChange={(e) => setEditingPatent({...editingPatent, publicationDate: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      優先權日期
                    </label>
                    <input
                      type="date"
                      value={editingPatent.priorityDate || ''}
                      onChange={(e) => setEditingPatent({...editingPatent, priorityDate: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* 發明人管理 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    發明人
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={inventorInput}
                      onChange={(e) => setInventorInput(e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="輸入發明人姓名"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInventor())}
                    />
                    <Button type="button" onClick={addInventor} className="bg-green-600 hover:bg-green-700">
                      添加
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editingPatent.inventors?.map((inventor, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {inventor}
                        <button
                          type="button"
                          onClick={() => removeInventor(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 其他欄位 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      國際分類號
                    </label>
                    <input
                      type="text"
                      value={editingPatent.classification || ''}
                      onChange={(e) => setEditingPatent({...editingPatent, classification: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="如：G06F 17/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      專利文件連結
                    </label>
                    <input
                      type="url"
                      value={editingPatent.patentUrl || ''}
                      onChange={(e) => setEditingPatent({...editingPatent, patentUrl: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://"
                    />
                  </div>
                </div>

                {/* 描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    專利描述
                  </label>
                  <textarea
                    value={editingPatent.description || ''}
                    onChange={(e) => setEditingPatent({...editingPatent, description: e.target.value})}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="專利的技術內容、創新點等描述"
                  />
                </div>

                {/* 精選專利 */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={editingPatent.featured}
                    onChange={(e) => setEditingPatent({...editingPatent, featured: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                    標記為精選專利
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

        {/* 專利列表 */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">專利列表</h2>
            <span className="text-gray-600">共 {patents.length} 件專利</span>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">載入中...</p>
            </div>
          ) : patents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">尚無專利資料</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3">專利標題</th>
                    <th className="text-left p-3">專利號碼</th>
                    <th className="text-left p-3">類別</th>
                    <th className="text-left p-3">狀態</th>
                    <th className="text-left p-3">申請日期</th>
                    <th className="text-left p-3">精選</th>
                    <th className="text-center p-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {patents.map((patent) => (
                    <tr key={patent.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{patent.title}</p>
                          {patent.inventors && patent.inventors.length > 0 && (
                            <p className="text-sm text-gray-600">
                              發明人: {patent.inventors.join(', ')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm font-mono">
                          {patent.patentNumber || '-'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {patent.category}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          patent.status === '已核准' ? 'bg-green-100 text-green-800' :
                          patent.status === '審查中' ? 'bg-yellow-100 text-yellow-800' :
                          patent.status === '已駁回' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {patent.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">{formatDate(patent.filingDate)}</span>
                      </td>
                      <td className="p-3">
                        {patent.featured && (
                          <span className="text-yellow-500">★</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center space-x-2">
                          {patent.patentUrl && (
                            <a
                              href={patent.patentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 text-sm"
                              title="查看原始專利文件"
                            >
                              查看文件
                            </a>
                          )}
                          <button
                            onClick={() => handleEdit(patent)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            編輯
                          </button>
                          <button
                            onClick={() => handleDelete(patent.id)}
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