'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { Project } from '../../../types/admin';
import { adminApi } from '../../../lib/adminApi';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProject, setEditingProject] = useState<Project>({
    id: '',
    title: '',
    description: '',
    technologies: [],
    imageUrl: '',
    githubUrl: '',
    liveUrl: '',
    featured: false,
    createdAt: new Date().toISOString()
  });
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projectData = await adminApi.getProjects();
      setProjects(projectData || []);
    } catch {
      console.error('Failed to load projects:');
    }
  };

  const handleSave = async () => {
    try {
      if (!editingProject.title || !editingProject.description) {
        alert('請填寫專案標題和描述！');
        return;
      }

      const success = editingProject.id 
        ? await adminApi.updateProject(editingProject)
        : await adminApi.createProject(editingProject);

      if (success) {
        await loadProjects();
        resetForm();
        alert('專案已保存！');
      } else {
        alert('保存失敗，請重試！');
      }
    } catch {
      alert('保存失敗，請重試！');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這個專案嗎？')) return;
    
    try {
      const success = await adminApi.deleteProject(id);
      if (success) {
        await loadProjects();
        alert('專案已刪除！');
      } else {
        alert('刪除失敗，請重試！');
      }
    } catch {
      alert('刪除失敗，請重試！');
    }
  };

  const startEdit = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setTechInput(project.technologies.join(', '));
    } else {
      setEditingProject({
        id: '',
        title: '',
        description: '',
        technologies: [],
        imageUrl: '',
        githubUrl: '',
        liveUrl: '',
        featured: false,
        createdAt: new Date().toISOString()
      });
      setTechInput('');
    }
    setIsEditing(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingProject({
      id: '',
      title: '',
      description: '',
      technologies: [],
      imageUrl: '',
      githubUrl: '',
      liveUrl: '',
      featured: false,
      createdAt: new Date().toISOString()
    });
    setTechInput('');
  };

  const handleTechChange = (value: string) => {
    setTechInput(value);
    setEditingProject({
      ...editingProject,
      technologies: value.split(',').map(tech => tech.trim()).filter(tech => tech)
    });
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
            <h1 className="text-3xl font-bold text-gray-900">專案管理</h1>
            <p className="text-gray-600 mt-2">管理作品集和專案展示</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
            >
              返回
            </Button>
            <Button onClick={() => startEdit()}>
              新增專案
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
                  {editingProject.id ? '編輯專案' : '新增專案'}
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
                    專案標題 *
                  </label>
                  <input
                    type="text"
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="請輸入專案標題"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    專案圖片 URL
                  </label>
                  <input
                    type="url"
                    value={editingProject.imageUrl}
                    onChange={(e) => setEditingProject({...editingProject, imageUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub 連結
                  </label>
                  <input
                    type="url"
                    value={editingProject.githubUrl}
                    onChange={(e) => setEditingProject({...editingProject, githubUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/username/project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    線上展示連結
                  </label>
                  <input
                    type="url"
                    value={editingProject.liveUrl}
                    onChange={(e) => setEditingProject({...editingProject, liveUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://your-project.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    技術棧（用逗號分隔）
                  </label>
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => handleTechChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="React, TypeScript, Node.js, MongoDB"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    專案描述 *
                  </label>
                  <textarea
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="請輸入專案詳細描述..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingProject.featured}
                      onChange={(e) => setEditingProject({...editingProject, featured: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">精選專案</span>
                  </label>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 專案列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full flex flex-col">
                  {project.imageUrl && (
                    <img 
                      src={project.imageUrl} 
                      alt={project.title}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {project.title}
                      {project.featured && (
                        <span className="ml-2 inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          精選
                        </span>
                      )}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 flex-1">
                    {project.description}
                  </p>
                  
                  {project.technologies.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-auto">
                    {project.githubUrl && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(project.githubUrl, '_blank')}
                      >
                        GitHub
                      </Button>
                    )}
                    {project.liveUrl && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(project.liveUrl, '_blank')}
                      >
                        展示
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => startEdit(project)}
                    >
                      編輯
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                    >
                      刪除
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">還沒有任何專案</p>
              <Button onClick={() => startEdit()}>
                新增第一個專案
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}