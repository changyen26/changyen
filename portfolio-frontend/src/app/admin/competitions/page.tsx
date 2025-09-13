'use client';

import { useState, useEffect } from 'react';
import { logger } from '../../../lib/logger';
import { motion } from 'framer-motion';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import FileUpload from '../../../components/common/FileUpload';
import ImageUpload from '../../../components/common/ImageUpload';
import { adminApi } from '../../../lib/adminApi';

// 本地競賽類型定義 - 避免 Zeabur 部署環境的模塊解析衝突
interface LocalCompetition {
  id: string;
  name: string;
  description: string;
  detailedDescription?: string;
  organizer: string;
  category: string;
  date: string;
  location?: string;
  result: string;
  teamSize?: number;
  role?: string;
  technologies?: string[];
  certificateUrl?: string;
  certificateFile?: {
    id: string;
    name: string;
    type: string;
    size: number;
    data: string;
    uploadedAt: string;
  } | null;
  projectImages?: string[];  // 改為 URL 字符串數組
  projectUrl?: string;
  featured: boolean;
  createdAt: string;
}

const COMPETITION_CATEGORIES = [
  '技術創新',
  '商業競賽', 
  '學術競賽',
  'AI/機器學習',
  'IoT/物聯網',
  '區塊鏈',
  '創業競賽',
  '程式設計',
  'Hackathon',
  '其他'
];

const COMPETITION_RESULTS = [
  '金牌',
  '銀牌',
  '銅牌',
  '優選',
  '佳作',
  '入圍',
  '參賽',
  '特別獎'
];

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<LocalCompetition[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  // 明確定義初始競賽對象
  const createEmptyCompetition = (): LocalCompetition => ({
    id: '',
    name: '',
    description: '',
    detailedDescription: '',
    organizer: '',
    category: '技術創新',
    date: '',
    location: '',
    result: '金牌',
    teamSize: 1,
    role: '',
    technologies: [],
    certificateUrl: '',
    certificateFile: undefined,
    projectImages: [],
    projectUrl: '',
    featured: false,
    createdAt: new Date().toISOString()
  });

  const [editingCompetition, setEditingCompetition] = useState(createEmptyCompetition());
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    loadCompetitions();
  }, []);

  // 類型轉換函數 - 將任何外部數據轉換為本地類型
  const convertToLocalCompetition = (data: unknown): LocalCompetition => {
    const item = data as Record<string, unknown>;
    return {
      id: String(item.id || ''),
      name: String(item.name || ''),
      description: String(item.description || ''),
      detailedDescription: item.detailedDescription ? String(item.detailedDescription) : undefined,
      organizer: String(item.organizer || ''),
      category: String(item.category || '技術創新'),
      date: String(item.date || ''),
      location: item.location ? String(item.location) : undefined,
      result: String(item.result || '參賽'),
      teamSize: item.teamSize ? Number(item.teamSize) : undefined,
      role: item.role ? String(item.role) : undefined,
      technologies: Array.isArray(item.technologies) ? item.technologies as string[] : [],
      certificateUrl: item.certificateUrl ? String(item.certificateUrl) : undefined,
      certificateFile: item.certificateFile as LocalCompetition['certificateFile'],
      projectImages: Array.isArray(item.projectImages) ? item.projectImages as string[] : [],
      projectUrl: item.projectUrl ? String(item.projectUrl) : undefined,
      featured: Boolean(item.featured !== false),
      createdAt: String(item.createdAt || new Date().toISOString())
    };
  };

  // 將本地類型轉換為 API 期望的格式
  const convertToApiFormat = (local: LocalCompetition): unknown => ({
    id: local.id,
    name: local.name,
    description: local.description,
    detailedDescription: local.detailedDescription,
    organizer: local.organizer,
    category: local.category,
    date: local.date,
    location: local.location,
    result: local.result,
    teamSize: local.teamSize,
    role: local.role,
    technologies: local.technologies,
    certificateUrl: local.certificateUrl,
    certificateFile: local.certificateFile,
    projectImages: local.projectImages || [],  // 確保總是有值
    projectUrl: local.projectUrl,
    featured: local.featured,
    createdAt: local.createdAt
  });

  const loadCompetitions = async () => {
    try {
      const competitionData = await adminApi.getCompetitions();
      const localCompetitions = (competitionData || []).map(convertToLocalCompetition);
      setCompetitions(localCompetitions);
    } catch {
      logger.error('Failed to load competitions:');
      setCompetitions([]);
    }
  };

  const handleSave = async () => {
    try {
      if (!editingCompetition.name || !editingCompetition.date) {
        alert('請填寫競賽名稱和日期！');
        return;
      }

      // 轉換為 API 期望的格式
      const apiData = convertToApiFormat(editingCompetition) as Record<string, unknown>;

      // 調試：檢查要發送的數據
      console.log('💾 準備保存的競賽數據:', editingCompetition);
      console.log('💾 editingCompetition.projectImages:', editingCompetition.projectImages);
      console.log('💾 轉換後的 API 數據:', apiData);
      console.log('💾 API數據中的projectImages:', (apiData as any).projectImages);
      console.log('💾 作品圖片數量:', editingCompetition.projectImages?.length || 0);

      const success = editingCompetition.id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? await adminApi.updateCompetition(apiData as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        : await adminApi.createCompetition(apiData as any);

      if (success) {
        await loadCompetitions();
        resetForm();
        alert('競賽已保存！');
      } else {
        alert('保存失敗，請重試！');
      }
    } catch {
      alert('保存失敗，請重試！');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這個競賽紀錄嗎？')) return;
    
    try {
      const success = await adminApi.deleteCompetition(id);
      if (success) {
        await loadCompetitions();
        alert('競賽已刪除！');
      } else {
        alert('刪除失敗，請重試！');
      }
    } catch {
      alert('刪除失敗，請重試！');
    }
  };

  const startEdit = (competition?: LocalCompetition) => {
    if (competition) {
      console.log('編輯競賽:', competition);
      console.log('作品圖片:', competition.projectImages);
      setEditingCompetition(competition);
      setTechInput(competition.technologies?.join(', ') || '');
    } else {
      setEditingCompetition(createEmptyCompetition());
      setTechInput('');
    }
    setIsEditing(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingCompetition(createEmptyCompetition());
    setTechInput('');
  };

  const handleTechChange = (value: string) => {
    setTechInput(value);
    setEditingCompetition({
      ...editingCompetition,
      technologies: value.split(',').map(tech => tech.trim()).filter(tech => tech)
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  // 計算得獎統計資料
  const getAwardsStatistics = () => {
    const stats = {
      總計: 0,
      金牌: 0,
      銀牌: 0,
      銅牌: 0,
      優選: 0,
      佳作: 0,
      入圍: 0,
      特別獎: 0,
      其他: 0
    };

    competitions.forEach(competition => {
      stats.總計++;
      const result = competition.result;

      if (result === '金牌' || result === '冠軍') {
        stats.金牌++;
      } else if (result === '銀牌' || result === '亞軍') {
        stats.銀牌++;
      } else if (result === '銅牌' || result === '季軍') {
        stats.銅牌++;
      } else if (result === '優選') {
        stats.優選++;
      } else if (result === '佳作') {
        stats.佳作++;
      } else if (result === '入圍') {
        stats.入圍++;
      } else if (result === '特別獎') {
        stats.特別獎++;
      } else {
        stats.其他++;
      }
    });

    return stats;
  };

  const awardsStats = getAwardsStatistics();

  const getResultColor = (result: string) => {
    switch (result) {
      case '金牌': case '冠軍': return 'bg-yellow-100 text-yellow-800';
      case '銀牌': case '亞軍': return 'bg-gray-100 text-gray-800';
      case '銅牌': case '季軍': return 'bg-orange-100 text-orange-800';
      case '優選': case '佳作': return 'bg-blue-100 text-blue-800';
      case '入圍': return 'bg-green-100 text-green-800';
      case '特別獎': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">競賽管理</h1>
            <p className="text-gray-600 mt-2">管理競賽參與紀錄和獲獎成果</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
            >
              返回
            </Button>
            <Button onClick={() => startEdit()}>
              新增競賽
            </Button>
          </div>
        </motion.div>

        {/* 編輯表單 */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {editingCompetition.id ? '編輯競賽' : '新增競賽'}
                </h2>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetForm}>
                    取消
                  </Button>
                  <Button onClick={handleSave}>
                    保存
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    競賽名稱 *
                  </label>
                  <input
                    type="text"
                    value={editingCompetition.name || ''}
                    onChange={(e) => setEditingCompetition({...editingCompetition, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：全國大學生創新創業競賽"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    主辦單位 *
                  </label>
                  <input
                    type="text"
                    value={editingCompetition.organizer || ''}
                    onChange={(e) => setEditingCompetition({...editingCompetition, organizer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：教育部、科技部"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    競賽類別
                  </label>
                  <select
                    value={editingCompetition.category || ''}
                    onChange={(e) => setEditingCompetition({...editingCompetition, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {COMPETITION_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    競賽日期 *
                  </label>
                  <input
                    type="date"
                    value={editingCompetition.date || ''}
                    onChange={(e) => setEditingCompetition({...editingCompetition, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    舉辦地點
                  </label>
                  <input
                    type="text"
                    value={editingCompetition.location || ''}
                    onChange={(e) => setEditingCompetition({...editingCompetition, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：台北市、線上競賽"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    參賽結果
                  </label>
                  <select
                    value={editingCompetition.result || ''}
                    onChange={(e) => setEditingCompetition({...editingCompetition, result: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {COMPETITION_RESULTS.map(result => (
                      <option key={result} value={result}>
                        {result}
                      </option>
                    ))}
                  </select>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    團隊人數
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingCompetition.teamSize || 1}
                    onChange={(e) => setEditingCompetition({...editingCompetition, teamSize: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    團隊角色
                  </label>
                  <input
                    type="text"
                    value={editingCompetition.role || ''}
                    onChange={(e) => setEditingCompetition({...editingCompetition, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：隊長、技術負責人、UI設計師"
                  />
                </div>

                <div className="md:col-span-2">
                  <FileUpload
                    label="證書上傳"
                    acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'application/pdf']}
                    currentFile={editingCompetition.certificateFile}
                    onFileUpload={(file) => setEditingCompetition({...editingCompetition, certificateFile: file})}
                    onFileRemove={() => setEditingCompetition({...editingCompetition, certificateFile: undefined})}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    專案連結
                  </label>
                  <input
                    type="url"
                    value={editingCompetition.projectUrl || ''}
                    onChange={(e) => setEditingCompetition({...editingCompetition, projectUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/username/project"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    使用技術（用逗號分隔）
                  </label>
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => handleTechChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="React, Python, TensorFlow, Arduino"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    競賽描述
                  </label>
                  <textarea
                    value={editingCompetition.description || ''}
                    onChange={(e) => setEditingCompetition({...editingCompetition, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="請描述競賽內容、參賽作品或獲獎感想..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    詳細競賽過程介紹
                  </label>
                  <textarea
                    value={editingCompetition.detailedDescription || ''}
                    onChange={(e) => setEditingCompetition({...editingCompetition, detailedDescription: e.target.value})}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="詳細描述競賽過程、團隊合作經驗、技術挑戰、解決方案等..."
                  />
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">作品圖片管理</h3>

                  {/* 顯示已上傳的圖片 */}
                  {editingCompetition.projectImages && editingCompetition.projectImages.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        已上傳圖片 ({editingCompetition.projectImages.length})
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {editingCompetition.projectImages.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`作品圖片 ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                              onError={(e) => {
                                console.log('管理後台圖片載入失敗:', imageUrl);
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWclueBh+eEoeazleilv+WPqzwvdGV4dD48L3N2Zz4=';
                              }}
                              onLoad={(e) => {
                                console.log('管理後台圖片載入成功:', imageUrl);
                              }}
                            />
                            <button
                              onClick={() => {
                                const newImages = editingCompetition.projectImages?.filter((_, i) => i !== index) || [];
                                setEditingCompetition({...editingCompetition, projectImages: newImages});
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              type="button"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 上傳新圖片 */}
                  <ImageUpload
                    label="上傳作品圖片"
                    onImageUpload={(imageUrl) => {
                      console.log('📥 管理後台接收到圖片URL:', imageUrl);
                      const currentImages = editingCompetition.projectImages || [];
                      console.log('📥 當前圖片陣列:', currentImages);

                      const updatedCompetition = {
                        ...editingCompetition,
                        projectImages: [...currentImages, imageUrl]
                      };

                      console.log('📥 更新後的競賽數據:', updatedCompetition);
                      console.log('📥 更新後的圖片陣列:', updatedCompetition.projectImages);

                      setEditingCompetition(updatedCompetition);
                    }}
                    className="mb-4"
                  />

                  <p className="text-xs text-gray-500">
                    可以上傳多張圖片展示作品成果、獎狀、團隊合照等
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingCompetition.featured}
                      onChange={(e) => setEditingCompetition({...editingCompetition, featured: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">精選競賽</span>
                  </label>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 得獎統計資料 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">得獎統計</h2>
              <span className="text-sm text-gray-500">共 {awardsStats.總計} 項競賽</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.entries(awardsStats).filter(([key]) => key !== '總計').map(([award, count]) => {
                let colorClass = 'bg-gray-100 text-gray-800';
                let iconClass = '📊';

                switch (award) {
                  case '金牌':
                    colorClass = 'bg-yellow-100 text-yellow-800';
                    iconClass = '🥇';
                    break;
                  case '銀牌':
                    colorClass = 'bg-gray-100 text-gray-800';
                    iconClass = '🥈';
                    break;
                  case '銅牌':
                    colorClass = 'bg-orange-100 text-orange-800';
                    iconClass = '🥉';
                    break;
                  case '優選':
                    colorClass = 'bg-blue-100 text-blue-800';
                    iconClass = '🏆';
                    break;
                  case '佳作':
                    colorClass = 'bg-green-100 text-green-800';
                    iconClass = '🎖️';
                    break;
                  case '入圍':
                    colorClass = 'bg-purple-100 text-purple-800';
                    iconClass = '🎯';
                    break;
                  case '特別獎':
                    colorClass = 'bg-pink-100 text-pink-800';
                    iconClass = '⭐';
                    break;
                  default:
                    iconClass = '🏅';
                }

                return (
                  <div key={award} className={`p-3 rounded-lg ${colorClass} text-center transition-all hover:scale-105`}>
                    <div className="text-2xl mb-1">{iconClass}</div>
                    <div className="font-semibold text-lg">{count}</div>
                    <div className="text-xs opacity-75">{award}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* 競賽列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((competition, index) => (
              <motion.div
                key={competition.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {competition.name}
                        {competition.featured && (
                          <span className="ml-2 inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            精選
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{competition.organizer}</p>
                      <p className="text-sm text-gray-500 mb-2">{formatDate(competition.date)}</p>
                      {competition.location && (
                        <p className="text-sm text-gray-500 mb-2">📍 {competition.location}</p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getResultColor(competition.result)}`}>
                        {competition.result}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {competition.category}
                      </span>
                    </div>
                  </div>
                  
                  {competition.description && (
                    <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">
                      {competition.description}
                    </p>
                  )}
                  
                  {competition.teamSize && competition.teamSize > 1 && (
                    <p className="text-sm text-gray-600 mb-2">
                      👥 團隊 {competition.teamSize} 人
                      {competition.role && ` · ${competition.role}`}
                    </p>
                  )}
                  
                  {competition.technologies && competition.technologies.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {competition.technologies.slice(0, 3).map((tech, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                        {competition.technologies.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{competition.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-auto">
                    {(competition.certificateFile || competition.certificateUrl) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (competition.certificateFile) {
                            // 如果是上傳的文件
                            const url = adminApi.getFileDataUrl(competition.certificateFile);
                            if (competition.certificateFile.type === 'application/pdf') {
                              // PDF文件下載
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = competition.certificateFile.name;
                              link.click();
                            } else {
                              // 圖片文件在新窗口打開
                              window.open(url, '_blank');
                            }
                          } else if (competition.certificateUrl) {
                            // 如果是URL連結
                            window.open(competition.certificateUrl, '_blank');
                          }
                        }}
                      >
                        證書
                      </Button>
                    )}
                    {competition.projectUrl && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(competition.projectUrl, '_blank')}
                      >
                        專案
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => startEdit(competition)}
                    >
                      編輯
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleDelete(competition.id)}
                    >
                      刪除
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {competitions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">還沒有任何競賽紀錄</p>
              <Button onClick={() => startEdit()}>
                新增第一個競賽
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}