'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { Analytics } from '@/types/admin';
import { adminApi } from '@/lib/adminApi';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentViews, setRecentViews] = useState<{
    recentViews: {
      id: string;
      path: string;
      title: string;
      ipAddress: string;
      userAgent: string;
      referer: string;
      sessionId: string;
      visitTime: string;
      viewDuration: number;
    }[];
    total: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(30);

  useEffect(() => {
    loadAnalytics();
    loadRecentViews();
  }, [selectedDays]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getAnalytics(selectedDays);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentViews = async () => {
    try {
      const data = await adminApi.getRecentViews(20);
      setRecentViews(data);
    } catch (error) {
      console.error('Failed to load recent views:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">載入數據中...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">數據分析</h1>
            <p className="text-gray-600 mt-2">
              查看網站訪問統計和使用數據
              <span className="ml-2 text-sm">
                (最近 {selectedDays} 天)
              </span>
            </p>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="flex gap-2">
              {[7, 30, 90].map(days => (
                <button
                  key={days}
                  onClick={() => setSelectedDays(days)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedDays === days
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {days}天
                </button>
              ))}
            </div>
            
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
            >
              返回
            </Button>
            <Button onClick={() => { loadAnalytics(); loadRecentViews(); }}>
              刷新數據
            </Button>
          </div>
        </motion.div>

        {analytics && (
          <>
            {/* 總覽數據卡片 */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {analytics.pageViews.toLocaleString()}
                  </h3>
                  <p className="text-gray-600">總頁面瀏覽量</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {analytics.uniqueVisitors.toLocaleString()}
                  </h3>
                  <p className="text-gray-600">獨立訪客數</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {analytics.averageTimeOnSite}
                  </h3>
                  <p className="text-gray-600">平均停留時間</p>
                </Card>
              </motion.div>
            </div>

            {/* 熱門頁面和流量來源 */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">熱門頁面</h2>
                  <div className="space-y-4">
                    {analytics.topPages.map((page, index) => (
                      <div key={page.path} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold text-sm">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{page.path}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {page.views.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">次瀏覽</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* 流量來源 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">流量來源</h2>
                  <div className="space-y-4">
                    {analytics.referrers?.map((referrer, index) => (
                      <div key={referrer.source} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-600 font-semibold text-sm">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{referrer.source}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {referrer.visits.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">次訪問</p>
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-center py-4">暫無流量來源數據</p>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* 瀏覽器統計和最近瀏覽記錄 */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* 瀏覽器統計 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">瀏覽器統計</h2>
                  <div className="space-y-4">
                    {analytics && (analytics as any).browsers?.length > 0 ? (
                      (analytics as any).browsers.map((browser: any, index: number) => (
                        <div key={browser.name} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-orange-600 font-semibold text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{browser.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {browser.count.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">次使用</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">暫無瀏覽器統計數據</p>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* 最近瀏覽記錄 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">最近瀏覽</h2>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {recentViews?.recentViews?.length > 0 ? (
                      recentViews.recentViews.slice(0, 10).map((view, index) => (
                        <div key={view.id} className="flex items-start justify-between border-b border-gray-100 pb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{view.title || view.path}</p>
                            <p className="text-sm text-gray-500">{view.path}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(view.visitTime).toLocaleString('zh-TW')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{view.viewDuration}s</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">暫無最近瀏覽數據</p>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* 數據圖表區域 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">訪問趨勢</h2>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-4">訪問趨勢圖表</p>
                  <p className="text-sm text-gray-400">
                    將來可以集成 Chart.js 或其他圖表庫來顯示詳細的訪問趨勢
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* 導出功能 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-8"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">數據導出</h3>
                    <p className="text-gray-600">導出完整的分析報告</p>
                  </div>
                  <Button 
                    onClick={async () => {
                      try {
                        const data = await adminApi.exportData();
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `portfolio-analytics-${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        alert('數據導出成功！');
                      } catch (error) {
                        alert('導出失敗，請重試！');
                      }
                    }}
                  >
                    導出 JSON
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}

        {!analytics && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">無法載入分析數據</p>
            <Button onClick={loadAnalytics}>
              重新載入
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}