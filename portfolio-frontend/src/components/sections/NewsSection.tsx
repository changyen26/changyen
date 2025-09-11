'use client';

import { motion } from 'framer-motion';
import { Newspaper, Calendar, ExternalLink, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { mockNews } from '@/data/mockData';
import { formatDate } from '@/lib/utils';
import { useInView } from '@/hooks/useInView';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { adminApi } from '@/lib/adminApi';

export default function NewsSection() {
  const [sectionRef, isInView] = useInView({ threshold: 0.2 });
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const [news, setNews] = useState<{ id: string; title: string; content: string; excerpt?: string; publishedAt: string; tags?: string[]; featured?: boolean; imageUrl?: string; createdAt: string; }[]>([]);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsData = await adminApi.getNews();
        console.log('NewsSection loaded news data:', newsData);
        if (newsData && newsData.length > 0) {
          setNews(newsData);
        } else {
          // 如果沒有管理後台的新聞數據，使用 mockNews 作為預設
          setNews(mockNews);
        }
      } catch (error) {
        console.error('Failed to load news:', error);
        // 發生錯誤時使用 mockNews
        setNews(mockNews);
      }
    };

    loadNews();

    // 定期重新載入數據
    const interval = setInterval(loadNews, 30000); // 30秒重新載入一次
    
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -10 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0
    }
  };

  return (
    <section 
      id="news" 
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden"
    >
      {/* 背景裝飾 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 border border-blue-400 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-40 right-10 w-24 h-24 border border-purple-400 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            媒體報導
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            技術創新獲得媒體關注，專業實力受到業界認可
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-8 lg:grid-cols-3"
        >
          {news.map((article) => (
            <motion.div
              key={article.id}
              variants={itemVariants}
              className="group"
            >
              <Card className="overflow-hidden h-full hover:shadow-2xl">
                {/* 文章圖片 */}
                <div className="relative overflow-hidden">
                  <motion.div
                    className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Newspaper size={48} className="text-white" />
                  </motion.div>
                  
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                    {article.media_outlet}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar size={16} className="mr-2" />
                    <span>{formatDate(article.publication_date)}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                    {article.headline}
                  </h3>

                  <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedArticle(selectedArticle === article.id ? null : article.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye size={16} className="mr-2" />
                      {selectedArticle === article.id ? '收起' : '預覽'}
                    </Button>

                    <motion.a
                      href={article.article_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      閱讀全文
                      <ExternalLink size={16} className="ml-2" />
                    </motion.a>
                  </div>

                  {/* 展開的預覽內容 */}
                  <motion.div
                    initial={false}
                    animate={{
                      height: selectedArticle === article.id ? 'auto' : 0,
                      opacity: selectedArticle === article.id ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">
                        {article.summary}
                      </p>
                      
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>媒體來源：{article.media_outlet}</span>
                          <span>發佈日期：{formatDate(article.publication_date)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* 媒體統計 */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">媒體曝光統計</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <motion.div
                  className="text-3xl font-bold text-blue-600 mb-2"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  {news.length}
                </motion.div>
                <div className="text-gray-600">報導總數</div>
              </div>
              
              <div>
                <motion.div
                  className="text-3xl font-bold text-green-600 mb-2"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1.1 }}
                >
                  {new Set(news.map(n => n.media_outlet)).size}
                </motion.div>
                <div className="text-gray-600">媒體機構</div>
              </div>
              
              <div>
                <motion.div
                  className="text-3xl font-bold text-purple-600 mb-2"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  2024
                </motion.div>
                <div className="text-gray-600">最新年份</div>
              </div>
              
              <div>
                <motion.div
                  className="text-3xl font-bold text-orange-600 mb-2"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1.3 }}
                >
                  100K+
                </motion.div>
                <div className="text-gray-600">預估觸及</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}