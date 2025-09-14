'use client';

import { useState, useEffect } from 'react';
import { logger } from '../../lib/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { useInView } from '../../hooks/useInView';
import { Competition } from '../../types/admin';
import { adminApi } from '../../lib/adminApi';

export default function CompetitionsSection() {
  const [sectionRef, isInView] = useInView({ threshold: 0.1 });
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        const competitionsData = await adminApi.getCompetitions();
        const sortedCompetitions = competitionsData
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setCompetitions(sortedCompetitions || []);
      } catch (error) {
        logger.error('Failed to load competitions:', error);
        setCompetitions([]);
      }
    };

    const timer = setTimeout(() => {
      loadCompetitions();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 檢測是否為手機版
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleExpand = (id: string) => {
    if (isMobile) {
      setExpandedId(expandedId === id ? null : id);
    }
  };

  const handleMouseEnter = (id: string) => {
    if (!isMobile) {
      setHoveredId(id);
      setExpandedId(id);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setHoveredId(null);
      setExpandedId(null);
    }
  };

  const getRankColor = (result: string) => {
    switch (result) {
      case '金牌': case '冠軍':
        return 'text-yellow-600';
      case '銀牌': case '亞軍':
        return 'text-gray-600';
      case '銅牌': case '季軍':
        return 'text-orange-600';
      case '優選':
      case '佳作':
        return 'text-blue-600';
      case '特別獎':
        return 'text-purple-600';
      case '入圍':
        return 'text-green-600';
      default:
        return 'text-indigo-600';
    }
  };

  return (
    <section
      id="competitions"
      ref={sectionRef}
      className="py-32 bg-white"
    >
      <div className="max-w-7xl mx-auto px-8">
        {/* 標題區 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-black/20" />
            <span className="text-sm tracking-[0.3em] uppercase text-black/60 font-mono">
              ACHIEVEMENTS
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tight text-black font-mono">
            競賽成就
          </h2>
        </motion.div>

        {/* 競賽列表 */}
        <motion.div
          className="space-y-0"
          layout
          transition={{ layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
        >
          {competitions.map((competition, index) => (
            <motion.div
              key={competition.id}
              initial={{ opacity: 0 }}
              animate={isInView ? {
                opacity: 1,
                transition: {
                  duration: 0.6,
                  delay: index * 0.08,
                  ease: [0.19, 1, 0.22, 1]
                }
              } : {}}
              layout
              transition={{
                layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.3 }
              }}
              className="border-b border-black/10 last:border-b-0 overflow-hidden cursor-pointer group"
              onClick={() => toggleExpand(competition.id)}
              onMouseEnter={() => handleMouseEnter(competition.id)}
              onMouseLeave={handleMouseLeave}
            >
              {/* 主要內容區 - 桌面懸停/手機點擊 */}
              <div className="py-8">
                {/* 編號 */}
                <motion.h4
                  className="text-sm font-mono text-black/30 uppercase tracking-widest mb-4"
                  animate={{
                    opacity: expandedId === competition.id ? 0.5 : 0.3
                  }}
                >
                  {String(index + 1).padStart(2, '0')}-{new Date(competition.date).getFullYear().toString().slice(-1)}
                </motion.h4>

                {/* 主標題 - 使用條件渲染避免動畫卡頓 */}
                <motion.div
                  animate={{
                    opacity: expandedId === competition.id ? 0 : 1,
                    height: expandedId === competition.id ? 0 : 'auto'
                  }}
                  transition={{
                    opacity: expandedId === competition.id ?
                      { duration: 0.1, ease: "easeOut" } :
                      { duration: 0.2, ease: "easeIn", delay: 0.35 },
                    height: expandedId === competition.id ?
                      { duration: 0.15, ease: "easeOut" } :
                      { duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.2 }
                  }}
                  className="overflow-hidden"
                >
                  <motion.h3
                    className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 transition-all duration-500 group-hover:translate-x-4"
                  >
                    <span>{competition.name.toLowerCase()}</span>
                  </motion.h3>

                  {/* 獎別顯示 */}
                  <div className="flex items-center gap-4 mb-2">
                    <span className={`text-sm font-mono uppercase tracking-widest ${getRankColor(competition.result)}`}>
                      {competition.result}
                    </span>
                    <span className="text-sm font-mono text-black/30 uppercase tracking-widest">
                      {new Date(competition.date).getFullYear()}
                    </span>
                  </div>
                </motion.div>

                {/* 第二行標題 - 展開時顯示 */}
                <AnimatePresence>
                  {expandedId === competition.id && (
                    <motion.h3
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-2xl md:text-4xl font-bold text-gray-900/20 mb-6"
                    >
                      <span>
                        <span className="text-gray-900/40">{'//'}</span> {competition.name.toLowerCase()}
                      </span>
                    </motion.h3>
                  )}
                </AnimatePresence>
              </div>

              {/* 展開內容區 */}
              <AnimatePresence>
                {expandedId === competition.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: 'auto',
                      opacity: 1,
                      transition: {
                        height: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98], delay: 0.1 },
                        opacity: { duration: 0.3, delay: 0.2 }
                      }
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      transition: {
                        opacity: { duration: 0.15 },
                        height: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
                      }
                    }}
                    className="overflow-hidden pb-8 relative"
                  >
                    {/* 右上角競賽名稱 */}
                    <motion.div
                      className="absolute top-4 right-4 md:top-6 md:right-6 text-right max-w-[60%]"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        transition: {
                          delay: 0.35,
                          duration: 0.4,
                          ease: [0.04, 0.62, 0.23, 0.98]
                        }
                      }}
                    >
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 leading-tight">
                        {competition.name.toLowerCase()}
                      </h3>
                      <div className="flex items-center justify-end gap-2 md:gap-3 text-xs">
                        <span className={`font-mono uppercase tracking-widest ${getRankColor(competition.result)}`}>
                          {competition.result}
                        </span>
                        <span className="font-mono text-black/40 uppercase tracking-widest">
                          {new Date(competition.date).getFullYear()}
                        </span>
                      </div>
                    </motion.div>

                    <div className="pt-8 relative min-h-[300px]">
                      {/* 細項列表 */}
                      <div className="max-w-[60%] pr-8">
                        <motion.ul
                          className="space-y-3 mb-8"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            transition: {
                              delay: 0.4,
                              duration: 0.4,
                              ease: [0.04, 0.62, 0.23, 0.98]
                            }
                          }}
                        >
                          {competition.organizer && (
                            <li className="text-black/70">
                              <span className="font-mono text-sm">/ </span>
                              <span className="font-mono uppercase tracking-wider">
                                {competition.organizer}
                              </span>
                            </li>
                          )}

                          {competition.category && (
                            <li className="text-black/70">
                              <span className="font-mono text-sm">/ </span>
                              <span className="font-mono uppercase tracking-wider">
                                {competition.category}
                              </span>
                            </li>
                          )}

                          <li className="text-black/70">
                            <span className="font-mono text-sm">/ </span>
                            <span className="font-mono uppercase tracking-wider">
                              {formatDate(competition.date)}
                            </span>
                          </li>

                          {competition.technologies && competition.technologies.length > 0 && (
                            competition.technologies.slice(0, 4).map((tech, i) => (
                              <li key={i} className="text-black/70">
                                <span className="font-mono text-sm">/ </span>
                                <span className="font-mono uppercase tracking-wider">
                                  {tech}
                                </span>
                              </li>
                            ))
                          )}

                          {/* 額外資訊 */}
                          {competition.teamSize && competition.teamSize > 1 && (
                            <li className="text-black/70">
                              <span className="font-mono text-sm">/ </span>
                              <span className="font-mono uppercase tracking-wider">
                                Team of {competition.teamSize}
                              </span>
                            </li>
                          )}

                          {competition.role && (
                            <li className="text-black/70">
                              <span className="font-mono text-sm">/ </span>
                              <span className="font-mono uppercase tracking-wider">
                                {competition.role}
                              </span>
                            </li>
                          )}
                        </motion.ul>
                      </div>

                      {/* 作品圖片 - 右下方直式佈局，避開右上角獎別區域 */}
                      {competition.projectImages && competition.projectImages.length > 0 && (
                        <motion.div
                          className="absolute top-20 right-8 w-32 md:w-40 lg:w-48"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            transition: {
                              delay: 0.5,
                              duration: 0.4,
                              ease: [0.04, 0.62, 0.23, 0.98]
                            }
                          }}
                        >
                          <div className="w-full h-40 md:h-48 lg:h-56 overflow-hidden rounded-sm">
                            <img
                              src={competition.projectImages[0]}
                              alt={competition.name}
                              className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>

                        </motion.div>
                      )}

                      {/* 沒有圖片時的描述區域 */}
                      {(!competition.projectImages || competition.projectImages.length === 0) && (
                        <div>
                          {/* 描述文字 */}
                          {competition.description && (
                            <motion.p
                              className="text-gray-700 leading-relaxed mb-6"
                              initial={{ opacity: 0, y: 20, scale: 0.98 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                transition: {
                                  delay: 0.4,
                                  duration: 0.6,
                                  ease: [0.04, 0.62, 0.23, 0.98]
                                }
                              }}
                            >
                              {competition.description}
                            </motion.p>
                          )}

                          {/* 詳細描述 */}
                          {competition.detailedDescription && (
                            <motion.div
                              initial={{ opacity: 0, y: 15 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                transition: {
                                  delay: 0.5,
                                  duration: 0.5,
                                  ease: [0.04, 0.62, 0.23, 0.98]
                                }
                              }}
                            >
                              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                                {competition.detailedDescription}
                              </p>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 有圖片時的描述文字 - 橫跨整行 */}
                    {competition.projectImages && competition.projectImages.length > 0 && (
                      <div className="mt-8">
                        {/* 描述文字 */}
                        {competition.description && (
                          <motion.p
                            className="text-gray-700 leading-relaxed max-w-4xl mb-4"
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: 1,
                              transition: {
                                delay: 0.6,
                                duration: 0.4,
                                ease: [0.04, 0.62, 0.23, 0.98]
                              }
                            }}
                          >
                            {competition.description}
                          </motion.p>
                        )}

                        {/* 詳細描述 */}
                        {competition.detailedDescription && (
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              transition: {
                                delay: 0.7,
                                duration: 0.4,
                                ease: [0.04, 0.62, 0.23, 0.98]
                              }
                            }}
                          >
                            <p className="text-gray-600 leading-relaxed max-w-4xl text-sm whitespace-pre-line">
                              {competition.detailedDescription}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* 連結 */}
                    {(competition.certificateUrl || competition.projectUrl) && (
                      <motion.div
                        className="flex gap-6 mt-8"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: {
                            delay: 0.6,
                            duration: 0.5,
                            ease: [0.04, 0.62, 0.23, 0.98]
                          }
                        }}
                      >
                        {competition.certificateUrl && (
                          <a
                            href={competition.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono uppercase tracking-wider text-black/60 hover:text-black transition-colors border-b border-black/20 hover:border-black pb-1"
                          >
                            view certificate
                          </a>
                        )}
                        {competition.projectUrl && (
                          <a
                            href={competition.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono uppercase tracking-wider text-black/60 hover:text-black transition-colors border-b border-black/20 hover:border-black pb-1"
                          >
                            view project
                          </a>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* 空狀態 */}
        {competitions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 mx-auto mb-8 border-2 border-black/5 rounded-full flex items-center justify-center">
              <Trophy size={48} className="text-black/10" />
            </div>
            <p className="text-2xl font-mono uppercase tracking-widest text-black/20 mb-4">
              NO COMPETITIONS YET
            </p>
          </motion.div>
        )}

        {/* 統計資訊 */}
        {competitions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-20 pt-8 border-t border-black/10"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-2xl md:text-3xl font-bold font-mono text-gray-900">
                  {competitions.filter(c => ['金牌', '冠軍'].includes(c.result)).length}
                </p>
                <p className="text-xs font-mono uppercase tracking-widest text-black/40 mt-1">
                  Gold
                </p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold font-mono text-gray-900">
                  {competitions.filter(c => ['銀牌', '亞軍'].includes(c.result)).length}
                </p>
                <p className="text-xs font-mono uppercase tracking-widest text-black/40 mt-1">
                  Silver
                </p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold font-mono text-gray-900">
                  {competitions.filter(c => ['銅牌', '季軍'].includes(c.result)).length}
                </p>
                <p className="text-xs font-mono uppercase tracking-widest text-black/40 mt-1">
                  Bronze
                </p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold font-mono text-gray-900">
                  {competitions.length}
                </p>
                <p className="text-xs font-mono uppercase tracking-widest text-black/40 mt-1">
                  Total
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}