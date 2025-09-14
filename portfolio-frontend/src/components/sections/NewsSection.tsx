'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import type { Easing } from 'framer-motion';
import { logger } from '../../lib/logger';
import { ArrowRight } from 'lucide-react';
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

  // 計算滑動距離
  const translateX = -currentIndex * 100;

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
              mediaType: '技術創新',
              featured: false
            },
            {
              id: '3',
              title: '下一代量子計算的突破性進展',
              mediaName: 'MIT Review',
              publicationDate: '2024-01-05',
              url: '#',
              summary: '報導最新量子計算研究成果，展示其在密碼學、藥物研發等領域的潛在應用價值。',
              mediaType: '技術創新',
              featured: false
            }
          ]);
        }
      } catch (error) {
        logger.error('Failed to load media coverage from API:', error);
        setNews([]);
      }
    };

    loadNews();
  }, []);

  return (
    <section
      id="news"
      ref={containerRef}
      className="relative bg-white min-h-screen"
    >
      <div
        ref={sectionRef}
        className="h-screen overflow-hidden"
      >
        <div className="h-full flex flex-col">
          {/* 固定標題區 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1.2, ease: 'easeOut' as Easing }}
            className="pt-32 pl-8 md:pl-16 pb-8 flex-shrink-0"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-[1px] bg-black/20" />
              <span className="text-sm tracking-[0.3em] uppercase text-black/60 font-mono">
                MEDIA COVERAGE
              </span>
            </div>
            <div className="flex items-center justify-between pr-8 md:pr-16">
              <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tight text-black font-mono">
                NEWS
              </h2>

              {/* 導航按鈕 */}
              {news.length > 1 && (
                <div className="flex items-center gap-4">
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
            </div>
          </motion.div>

          {/* 滑動容器 */}
          <div
            className="flex-1 flex items-center overflow-hidden pl-8 md:pl-16"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="relative w-full flex justify-center">
              {/* 只顯示當前索引的新聞 */}
              {news.length > 0 && (
                <motion.div
                  key={`news-${currentIndex}`}
                  className="flex justify-center items-center"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.19, 1, 0.22, 1] as Easing
                  }}
                >
                  <div
                    className="border border-black/10 rounded-3xl p-8 md:p-12 flex flex-col justify-between bg-white hover:border-black/30 transition-colors duration-300 group cursor-pointer"
                    style={{
                      height: 'clamp(30rem, 60vh, 40rem)',
                      width: 'clamp(20rem, 70vw, 28rem)'
                    }}
                  >
                    {/* 頂部：編號和標題 */}
                    <div>
                      <span className="text-sm font-mono text-black/40">
                        ({String(currentIndex + 1).padStart(2, '0')})
                      </span>
                      <h3 className="text-2xl md:text-3xl font-bold uppercase mt-4 leading-tight text-black font-mono">
                        {news[currentIndex].title.length > 30
                          ? news[currentIndex].title.substring(0, 30) + '...'
                          : news[currentIndex].title}
                      </h3>
                      <div className="mt-4 flex items-center gap-4">
                        <span className="text-sm font-mono text-black/60">
                          {news[currentIndex].mediaName}
                        </span>
                        <span className="text-sm font-mono text-black/40">
                          {formatDate(news[currentIndex].publicationDate)}
                        </span>
                      </div>
                    </div>

                    {/* 中部：摘要 */}
                    <p className="text-base leading-relaxed text-black/70 font-mono py-6">
                      {news[currentIndex].summary}
                    </p>

                    {/* 底部：連結 */}
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
                  </div>
                </motion.div>
              )}

              {/* 如果沒有報導 */}
              {news.length === 0 && (
                <div className="flex justify-center items-center h-96">
                  <p className="font-mono text-black/40 text-sm uppercase tracking-wider">
                    No media coverage available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}