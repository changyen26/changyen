'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import type { Easing } from 'framer-motion';
import { logger } from '../../lib/logger';
import { ArrowRight, Calendar, User, Tag, ExternalLink } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { formatDate } from '../../lib/utils';
import { useInView } from '../../hooks/useInView';
import { MediaCoverage } from '../../types/admin';
import { adminApi } from '../../lib/adminApi';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NewsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sectionRef, isInView] = useInView({ threshold: 0.1 });
  const [news, setNews] = useState<MediaCoverage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 滑動控制 - 支援循環
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  // 觸控滑動支援
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsData = await adminApi.getMediaCoverage();
        logger.log('NewsSection loaded media coverage from API:', newsData);

        if (newsData && newsData.length > 0) {
          // 按發布日期排序（最新在前）
          const sortedNews = newsData.sort((a, b) => {
            const dateA = new Date(a.publicationDate || '').getTime();
            const dateB = new Date(b.publicationDate || '').getTime();
            return dateB - dateA; // 降序排列
          });
          setNews(sortedNews);
        } else {
          // 使用預設數據作為示例
          setNews([
            {
              id: '1',
              title: '創新科技引領未來：AI 與物聯網的結合應用實踐',
              mediaName: 'TechCrunch',
              publicationDate: '2024-01-15',
              url: '#',
              summary: '探討人工智能與物聯網技術的深度整合，以及其在智慧城市建設中的應用前景。這項技術突破將為未來城市發展帶來革命性改變，從交通管理到能源優化都將實現智能化升級。',
              mediaType: '技術創新',
              author: '張科技',
              featured: true,
              tags: ['AI', 'IoT', '智慧城市']
            },
            {
              id: '2',
              title: '區塊鏈技術在供應鏈管理的創新應用與實踐',
              mediaName: 'Forbes',
              publicationDate: '2024-01-10',
              url: '#',
              summary: '深入分析區塊鏈技術如何改變傳統供應鏈管理模式，提升透明度和效率，為企業創造更大價值。從原料追溯到產品認證，全面提升供應鏈的可信度。',
              mediaType: '專題報導',
              author: '李經理',
              featured: false,
              tags: ['區塊鏈', '供應鏈', '企業創新']
            },
            {
              id: '3',
              title: '5G時代的創新機遇：從概念到商業應用的完整解析',
              mediaName: 'Wired',
              publicationDate: '2024-01-05',
              url: '#',
              summary: '全面解析5G技術如何推動各行各業的數字化轉型，從自動駕駛到遠程醫療，探索無限可能的商業應用場景和未來發展趨勢。',
              mediaType: '產業評論',
              author: '王博士',
              featured: true,
              tags: ['5G', '數字化', '商業應用']
            }
          ]);
        }
      } catch (error) {
        logger.error('Failed to load media coverage:', error);
        setNews([]);
      }
    };

    loadNews();
  }, []);

  // 自動播放
  useEffect(() => {
    if (news.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 8000); // 8秒自動切換

    return () => clearInterval(interval);
  }, [news.length]);

  return (
    <section
      id="news"
      ref={sectionRef}
      className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-20 overflow-hidden"
    >
      {/* 背景裝飾 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-purple-100/20"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-tl from-purple-200/10 to-pink-200/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="h-full flex flex-col md:flex-row items-center">
          {/* 左側：標題和控制 */}
          <motion.div
            className="w-full md:w-1/3 md:pr-12 mb-8 md:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as Easing }}
          >
            <div className="text-center md:text-left">
              <motion.span
                className="inline-block text-sm font-semibold text-blue-600 mb-4 px-4 py-2 bg-blue-50 rounded-full"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                媒體報導
              </motion.span>

              <motion.h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                最新
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  媒體動態
                </span>
              </motion.h2>

              <motion.p
                className="text-lg text-gray-600 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                追蹤最新的科技趨勢與產業動態，深度解析技術創新與商業應用的前沿觀點
              </motion.p>

              {/* 控制按鈕 */}
              {news.length > 1 && (
                <motion.div
                  className="flex items-center justify-center md:justify-start gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <button
                    onClick={prevSlide}
                    className="group p-4 rounded-full bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <ChevronLeft size={24} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                  </button>

                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl font-bold text-gray-800">
                      {String(currentIndex + 1).padStart(2, '0')}
                    </span>
                    <div className="text-sm text-gray-500">
                      of {String(news.length).padStart(2, '0')}
                    </div>
                  </div>

                  <button
                    onClick={nextSlide}
                    className="group p-4 rounded-full bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <ChevronRight size={24} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* 右側：新聞卡片 */}
          <div
            className="flex-1 flex items-center justify-center"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {news.length > 0 ? (
              <motion.div
                key={`news-${currentIndex}`}
                className="w-full max-w-xl"
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.9 }}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1] as Easing
                }}
              >
                <div className="relative bg-white rounded-2xl p-8 shadow-2xl shadow-gray-900/10 hover:shadow-3xl hover:shadow-gray-900/15 transition-all duration-500 group border border-gray-100">
                  {/* 背景裝飾 */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                  {/* 媒體類型和精選標籤 */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200">
                      {news[currentIndex].mediaType || '媒體報導'}
                    </span>
                    {news[currentIndex].featured && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200">
                        ⭐ 精選報導
                      </span>
                    )}
                  </div>

                  {/* 標題 */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                    {news[currentIndex].title}
                  </h3>

                  {/* 媒體資訊 */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {news[currentIndex].mediaName.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {news[currentIndex].mediaName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={16} />
                      {formatDate(news[currentIndex].publicationDate)}
                    </div>
                  </div>

                  {/* 作者資訊 */}
                  {news[currentIndex].author && (
                    <div className="flex items-center gap-2 mb-6">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">作者：{news[currentIndex].author}</span>
                    </div>
                  )}

                  {/* 摘要 */}
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {news[currentIndex].summary}
                  </p>

                  {/* 標籤 */}
                  {news[currentIndex].tags && news[currentIndex].tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {news[currentIndex].tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 閱讀連結 */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <motion.a
                      href={news[currentIndex].url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300"
                      whileHover={{ x: 3 }}
                    >
                      閱讀完整報導
                      <ExternalLink size={16} className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    </motion.a>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      <span>即時更新</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ArrowRight size={24} />
                </div>
                <p className="text-center">暫無媒體報導</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}