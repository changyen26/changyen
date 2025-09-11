'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { UserInfo } from '../../types/admin';
import { adminApi } from '../../lib/adminApi';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    phone: '',
    title: '',
    description: '',
    github: '',
    linkedin: '',
    avatar: '',
    location: '',
    website: ''
  });
  
  const [editingInfo, setEditingInfo] = useState<UserInfo>({ ...userInfo });
  const [isEditing, setIsEditing] = useState(false);

  // 身份驗證
  const handleLogin = async () => {
    try {
      const isValid = await adminApi.validatePassword(password);
      if (isValid) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_authenticated', 'true');
        await loadUserInfo();
      } else {
        alert('密碼錯誤！');
      }
    } catch {
      alert('登入失敗，請重試！');
    }
  };

  // 加載用戶信息
  const loadUserInfo = async () => {
    try {
      const info = await adminApi.getUserInfo();
      setUserInfo(info);
      setEditingInfo(info);
    } catch {
      console.error('Failed to load user info:');
    }
  };

  // 檢查是否已登入
  useEffect(() => {
    const isAuth = localStorage.getItem('admin_authenticated');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
      loadUserInfo();
    }
  }, []);

  // 登出功能
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
  };

  // 保存用戶信息
  const handleSaveInfo = async () => {
    try {
      const success = await adminApi.updateUserInfo(editingInfo);
      if (success) {
        setUserInfo({ ...editingInfo });
        setIsEditing(false);
        alert('用戶信息已更新！');
      } else {
        alert('更新失敗，請重試！');
      }
    } catch {
      alert('更新失敗，請重試！');
    }
  };

  // 取消編輯
  const handleCancelEdit = () => {
    setEditingInfo({ ...userInfo });
    setIsEditing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8"
        >
          <Card className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">管理後台登入</h1>
              <p className="text-gray-600">請輸入管理員密碼</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密碼
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入密碼"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              
              <Button 
                onClick={handleLogin}
                className="w-full"
              >
                登入
              </Button>
              
              <div className="text-center">
                <Link 
                  href="/"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  返回首頁
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題和操作 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">管理後台</h1>
            <p className="text-gray-600 mt-2">管理個人履歷信息和內容</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={async () => {
                try {
                  const data = await adminApi.exportData();
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  alert('數據導出成功！');
                } catch {
                  alert('導出失敗，請重試！');
                }
              }}
            >
              導出數據
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/admin/portfolio'}
            >
              作品集預覽
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('/', '_blank')}
            >
              完整網站
            </Button>
            <Button 
              variant="secondary"
              onClick={handleLogout}
            >
              登出
            </Button>
          </div>
        </motion.div>

        {/* 個人信息編輯 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">個人信息</h2>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  編輯信息
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    取消
                  </Button>
                  <Button onClick={handleSaveInfo}>
                    保存
                  </Button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓名
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editingInfo.name}
                    onChange={(e) => setEditingInfo({...editingInfo, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{userInfo.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  職稱
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editingInfo.title}
                    onChange={(e) => setEditingInfo({...editingInfo, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{userInfo.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電子郵箱
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editingInfo.email}
                    onChange={(e) => setEditingInfo({...editingInfo, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{userInfo.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  聯絡電話
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editingInfo.phone}
                    onChange={(e) => setEditingInfo({...editingInfo, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{userInfo.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editingInfo.github}
                    onChange={(e) => setEditingInfo({...editingInfo, github: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{userInfo.github}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editingInfo.linkedin}
                    onChange={(e) => setEditingInfo({...editingInfo, linkedin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{userInfo.linkedin}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所在地區
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editingInfo.location || ''}
                    onChange={(e) => setEditingInfo({...editingInfo, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{userInfo.location || '未設定'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  個人網站
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={editingInfo.website || ''}
                    onChange={(e) => setEditingInfo({...editingInfo, website: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{userInfo.website || '未設定'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  個人簡介
                </label>
                {isEditing ? (
                  <textarea
                    value={editingInfo.description}
                    onChange={(e) => setEditingInfo({...editingInfo, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="請輸入個人簡介..."
                  />
                ) : (
                  <p className="text-gray-900 py-2">{userInfo.description}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 功能快捷入口 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
        >
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">專案管理</h3>
            <p className="text-gray-600 mb-4">管理作品集和專案展示</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/admin/projects'}
            >
              管理專案
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">技能管理</h3>
            <p className="text-gray-600 mb-4">更新技能和專業能力</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/admin/skills'}
            >
              管理技能
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">數據分析</h3>
            <p className="text-gray-600 mb-4">查看網站訪問統計</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/admin/analytics'}
            >
              查看分析
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">競賽管理</h3>
            <p className="text-gray-600 mb-4">管理競賽參與和獲獎紀錄</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/admin/competitions'}
            >
              管理競賽
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6M9 3v1m0 16v1m1-10h1m8-1V9a4 4 0 00-8 0v2m0 6h8a2 2 0 002-2v-2a2 2 0 00-2-2H10a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">專利管理</h3>
            <p className="text-gray-600 mb-4">管理專利申請和發明成果</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/admin/patents'}
            >
              管理專利
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}