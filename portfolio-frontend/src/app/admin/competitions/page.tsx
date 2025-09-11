'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import FileUpload from '../../../components/common/FileUpload';
import { Competition } from '../../../types/admin';
import { adminApi } from '../../../lib/adminApi';

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
  '冠軍',
  '亞軍',
  '季軍',
  '優選',
  '佳作',
  '入圍',
  '參賽',
  '特別獎'
];

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition>({
    id: '',
    title: '',
    description: '',
    organizer: '',
    category: '技術創新',
    date: '',
    location: '',
    result: '參賽',
    award: '',
    teamSize: 1,
    role: '',
    technologies: [],
    certificateUrl: '',
    certificateFile: undefined,
    projectUrl: '',
    featured: false,
    createdAt: new Date().toISOString()
  });
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      const competitionData = await adminApi.getCompetitions();
      setCompetitions(competitionData || []);
    } catch {
      console.error('Failed to load competitions:');
    }
  };

  const handleSave = async () => {
    try {
      if (!editingCompetition.title || !editingCompetition.date) {
        alert('請填寫競賽名稱和日期！');
        return;
      }

      const success = editingCompetition.id 
        ? await adminApi.updateCompetition(editingCompetition)
        : await adminApi.createCompetition(editingCompetition);

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

  const startEdit = (competition?: Competition) => {
    if (competition) {
      setEditingCompetition(competition);
      setTechInput(competition.technologies?.join(', ') || '');
    } else {
      setEditingCompetition({
        id: '',
        title: '',
        description: '',
        organizer: '',
        category: '技術創新',
        date: '',
        location: '',
        result: '參賽',
        award: '',
        teamSize: 1,
        role: '',
        technologies: [],
        certificateUrl: '',
        certificateFile: undefined,
        projectUrl: '',
        featured: false,
        createdAt: new Date().toISOString()
      });
      setTechInput('');
    }
    setIsEditing(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingCompetition({
      id: '',
      title: '',
      description: '',
      organizer: '',
      category: '技術創新',
      date: '',
      location: '',
      result: '參賽',
      award: '',
      teamSize: 1,
      role: '',
      technologies: [],
      certificateUrl: '',
      certificateFile: undefined,
      projectUrl: '',
      featured: false,
      createdAt: new Date().toISOString()
    });
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

  const getResultColor = (result: string) => {
    switch (result) {
      case '冠軍': return 'bg-yellow-100 text-yellow-800';
      case '亞軍': return 'bg-gray-100 text-gray-800';
      case '季軍': return 'bg-orange-100 text-orange-800';
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
                    value={editingCompetition.title}
                    onChange={(e) => setEditingCompetition({...editingCompetition, title: e.target.value})}
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
                    value={editingCompetition.organizer}
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
                    value={editingCompetition.category}
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
                    value={editingCompetition.date}
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
                    value={editingCompetition.result}
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
                    獎項名稱
                  </label>
                  <input
                    type="text"
                    value={editingCompetition.award || ''}
                    onChange={(e) => setEditingCompetition({...editingCompetition, award: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：最佳技術獎、創新獎"
                  />
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
                    value={editingCompetition.description}
                    onChange={(e) => setEditingCompetition({...editingCompetition, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="請描述競賽內容、參賽作品或獲獎感想..."
                  />
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
                        {competition.title}
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
                  
                  {competition.award && (
                    <p className="text-sm font-medium text-gray-900 mb-2">🏆 {competition.award}</p>
                  )}
                  
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