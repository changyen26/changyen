'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { Skill } from '../../../types/admin';
import { adminApi } from '../../../lib/adminApi';

const SKILL_CATEGORIES = [
  'Frontend',
  'Backend', 
  'Database',
  'DevOps',
  'Mobile',
  'Design',
  'Tools',
  'Other'
];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill>({
    id: '',
    name: '',
    level: 50,
    category: 'Frontend',
    icon: ''
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const skillData = await adminApi.getSkills();
      setSkills(skillData || []);
    } catch {
      console.error('Failed to load skills:');
    }
  };

  const handleSave = async () => {
    try {
      if (!editingSkill.name) {
        alert('請填寫技能名稱！');
        return;
      }

      const success = editingSkill.id 
        ? await adminApi.updateSkill(editingSkill)
        : await adminApi.createSkill(editingSkill);

      if (success) {
        await loadSkills();
        resetForm();
        alert('技能已保存！');
      } else {
        alert('保存失敗，請重試！');
      }
    } catch {
      alert('保存失敗，請重試！');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這個技能嗎？')) return;
    
    try {
      const success = await adminApi.deleteSkill(id);
      if (success) {
        await loadSkills();
        alert('技能已刪除！');
      } else {
        alert('刪除失敗，請重試！');
      }
    } catch {
      alert('刪除失敗，請重試！');
    }
  };

  const startEdit = (skill?: Skill) => {
    if (skill) {
      setEditingSkill(skill);
    } else {
      setEditingSkill({
        id: '',
        name: '',
        level: 50,
        category: 'Frontend',
        icon: ''
      });
    }
    setIsEditing(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingSkill({
      id: '',
      name: '',
      level: 50,
      category: 'Frontend',
      icon: ''
    });
  };

  const getSkillsByCategory = () => {
    const groupedSkills: Record<string, Skill[]> = {};
    
    SKILL_CATEGORIES.forEach(category => {
      groupedSkills[category] = skills.filter(skill => skill.category === category);
    });
    
    return groupedSkills;
  };

  const getLevelText = (level: number) => {
    if (level >= 90) return '專家';
    if (level >= 75) return '熟練';
    if (level >= 50) return '中等';
    if (level >= 25) return '初級';
    return '入門';
  };

  const getLevelColor = (level: number) => {
    if (level >= 90) return 'bg-green-500';
    if (level >= 75) return 'bg-blue-500';
    if (level >= 50) return 'bg-yellow-500';
    if (level >= 25) return 'bg-orange-500';
    return 'bg-gray-400';
  };

  const groupedSkills = getSkillsByCategory();

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
            <h1 className="text-3xl font-bold text-gray-900">技能管理</h1>
            <p className="text-gray-600 mt-2">管理專業技能和能力等級</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
            >
              返回
            </Button>
            <Button onClick={() => startEdit()}>
              新增技能
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
                  {editingSkill.id ? '編輯技能' : '新增技能'}
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
                    技能名稱 *
                  </label>
                  <input
                    type="text"
                    value={editingSkill.name}
                    onChange={(e) => setEditingSkill({...editingSkill, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：React、Node.js、Python"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    技能分類
                  </label>
                  <select
                    value={editingSkill.category}
                    onChange={(e) => setEditingSkill({...editingSkill, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SKILL_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    圖示 URL（可選）
                  </label>
                  <input
                    type="url"
                    value={editingSkill.icon}
                    onChange={(e) => setEditingSkill({...editingSkill, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/icon.svg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    熟練度: {editingSkill.level}% - {getLevelText(editingSkill.level)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editingSkill.level}
                    onChange={(e) => setEditingSkill({...editingSkill, level: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>入門</span>
                    <span>初級</span>
                    <span>中等</span>
                    <span>熟練</span>
                    <span>專家</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 技能列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            categorySkills.length > 0 && (
              <div key={category} className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{category}</h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorySkills.map((skill, index) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            {skill.icon && (
                              <img 
                                src={skill.icon} 
                                alt={skill.name}
                                className="w-6 h-6 mr-2"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => startEdit(skill)}
                            >
                              編輯
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleDelete(skill.id)}
                            >
                              刪除
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>{getLevelText(skill.level)}</span>
                            <span>{skill.level}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getLevelColor(skill.level)}`}
                              style={{ width: `${skill.level}%` }}
                            />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          ))}

          {skills.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">還沒有任何技能</p>
              <Button onClick={() => startEdit()}>
                新增第一個技能
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}