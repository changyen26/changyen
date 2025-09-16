'use client';

import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';
import { logger } from '../../lib/logger';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDate } from '../../lib/utils';
import { useInView } from '../../hooks/useInView';
import { MediaCoverage } from '../../types/admin';
import { adminApi } from '../../lib/adminApi';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NewsSection() {
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
              title: '創新科技引領未來：AI 與物聯網的結合',
              mediaName: 'TechCrunch',
              publicationDate: '2024-01-15',
              url: '#',
              summary: '探討人工智能與物聯網技術的深度整合，以及其在智慧城市建設中的應用前景。這項技術突破將為未來城市發展帶來革命性改變。',
              mediaType: '技術創新',
              featured: true
            },
            {
              id: '2',
              title: '區塊鏈技術在供應鏈管理的創新應用',
              mediaName: 'Forbes',
              publicationDate: '2024-01-10',
              url: '#',
              summary: '深入分析區塊鏈技術如何改變傳統供應鏈管理模式，提升透明度和效率，為企業創造更大價值。',
              mediaType: '專題報導',
              featured: false
            },
            {
              id: '3',
              title: '5G時代的創新機遇與商業應用解析',
              mediaName: 'Wired',
              publicationDate: '2024-01-05',
              url: '#',
              summary: '全面解析5G技術如何推動各行各業的數字化轉型，從自動駕駛到遠程醫療，探索無限可能。',
              mediaType: '產業評論',
              featured: true
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

  return (
    <section
      id="news"
      ref={sectionRef}
      className="py-32 bg-white"
    >
      <div className="max-w-7xl mx-auto px-8">
        {/* 標題區塊 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1.2, ease: 'easeOut' as Easing }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-black/20" />
            <span className="text-sm tracking-[0.3em] uppercase text-black/60 font-mono">
              MEDIA COVERAGE
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tight text-black font-mono">
            媒體報導
          </h2>
        </motion.div>

        {/* 主要內容區 */}
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* 左側控制區 */}
          <motion.div
            className="w-full lg:w-1/3"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* 導航控制 */}
            {news.length > 1 && (
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={prevSlide}
                  className="p-3 rounded-full border border-black/20 hover:border-black/40 transition-all duration-300"
                >
                  <ChevronLeft size={24} />
                </button>
                <span className="font-mono text-sm text-black/60">
                  {String(currentIndex + 1).padStart(2, '0')} / {String(news.length).padStart(2, '0')}
                </span>
                <button
                  onClick={nextSlide}
                  className="p-3 rounded-full border border-black/20 hover:border-black/40 transition-all duration-300"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}

            {/* 描述文字 */}
            <div className="space-y-4">
              <p className="text-black/60 font-mono text-sm leading-relaxed">
                追蹤最新的科技趨勢與產業動態，
                深度解析技術創新與商業應用的前沿觀點。
              </p>
              <div className="w-8 h-[1px] bg-black/20" />
            </div>
          </motion.div>

          {/* 右側新聞卡片 */}
          <div
            className="flex-1"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {news.length > 0 ? (
              <motion.div
                key={`news-${currentIndex}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.6,
                  ease: [0.19, 1, 0.22, 1] as Easing
                }}
                className="border border-black/10 p-8 md:p-12 bg-white hover:border-black/30 transition-colors duration-300 group"
              >
                {/* 頂部：編號和媒體 */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono text-black/40">
                      ({String(currentIndex + 1).padStart(2, '0')})
                    </span>
                    <div className="w-4 h-[1px] bg-black/20" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-black/60 uppercase tracking-wider">
                      {news[currentIndex].mediaName}
                    </div>
                    <div className="text-xs font-mono text-black/40 mt-1">
                      {formatDate(news[currentIndex].publicationDate)}
                    </div>
                  </div>
                </div>

                {/* 標題 */}
                <h3 className="text-2xl md:text-3xl font-bold uppercase leading-tight text-black font-mono mb-6">
                  {news[currentIndex].title}
                </h3>

                {/* 類型標籤 */}
                {news[currentIndex].mediaType && (
                  <div className="mb-6">
                    <span className="inline-block px-3 py-1 border border-black/20 text-xs font-mono uppercase tracking-wider text-black/60">
                      {news[currentIndex].mediaType}
                    </span>
                  </div>
                )}

                {/* 摘要 */}
                <p className="text-base leading-relaxed text-black/70 font-mono mb-8">
                  {news[currentIndex].summary}
                </p>

                {/* 底部：連結 */}
                <motion.div
                  className="flex items-center justify-between pt-6 border-t border-black/10"
                >
                  <motion.a
                    href={news[currentIndex].url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-black/60 hover:text-black transition-colors duration-300"
                    whileHover={{ x: 5 }}
                  >
                    Read Article
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.a>

                  {/* 精選標記 */}
                  {news[currentIndex].featured && (
                    <span className="text-xs font-mono text-black/40 uppercase tracking-wider">
                      Featured
                    </span>
                  )}
                </motion.div>
              </motion.div>
            ) : (
              <div className="border border-black/10 p-12 text-center">
                <p className="font-mono text-black/40 text-sm uppercase tracking-wider">
                  No media coverage available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}