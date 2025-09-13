'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '../../lib/adminApi';
import { motion } from 'framer-motion';

interface AdminProtectionProps {
  children: React.ReactNode;
}

export default function AdminProtection({ children }: AdminProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // 檢查身份驗證狀態
  useEffect(() => {
    const checkAuth = () => {
      const authTime = localStorage.getItem('admin_auth_time');
      const isAuth = localStorage.getItem('admin_authenticated');

      if (isAuth === 'true' && authTime) {
        const authTimeMs = parseInt(authTime);
        const now = Date.now();
        const sessionDuration = 4 * 60 * 60 * 1000; // 4小時會話

        if (now - authTimeMs < sessionDuration) {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        } else {
          // 會話過期
          localStorage.removeItem('admin_authenticated');
          localStorage.removeItem('admin_auth_time');
        }
      }

      setIsAuthenticated(false);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // 處理登入
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    try {
      const isValid = await adminApi.validatePassword(password);
      if (isValid) {
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_auth_time', Date.now().toString());
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setError('密碼錯誤，請重試');
      }
    } catch (error) {
      setError('登入失敗，請檢查網路連線');
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 處理登出
  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_auth_time');
    setIsAuthenticated(false);
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">驗證中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8"
        >
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/20 p-8 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">管理後台</h1>
              <p className="text-gray-600">請輸入管理員密碼以繼續</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密碼
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="請輸入管理員密碼"
                  required
                  disabled={isLoggingIn}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-md p-3"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn || !password.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoggingIn ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    登入中...
                  </div>
                ) : (
                  '登入'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  返回首頁
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* 登出按鈕 */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors shadow-lg"
        >
          登出
        </button>
      </div>
      {children}
    </div>
  );
}