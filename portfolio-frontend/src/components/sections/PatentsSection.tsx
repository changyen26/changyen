'use client';

import { motion } from 'framer-motion';
import { logger } from '../../lib/logger';
import { Calendar, Award, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDate } from '../../lib/utils';
import { useInView } from '../../hooks/useInView';
import { Patent } from '../../types/admin';
import { adminApi } from '../../lib/adminApi';

export default function PatentsSection() {
  const [sectionRef, isInView] = useInView({ threshold: 0.1 });
  const [patents, setPatents] = useState<Patent[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const loadPatents = async () => {
      try {
        const patentsData = await adminApi.getPatents();
        logger.log('PatentsSection loaded patents from API:', patentsData);

        if (patentsData && patentsData.length > 0) {
          setPatents(patentsData);
        } else {
          setPatents([]);
        }
      } catch (error) {
        logger.error('Failed to load patents from API:', error);
        setPatents([]);
      }
    };

    loadPatents();

    const interval = setInterval(loadPatents, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="patents"
      ref={sectionRef}
      className="py-32 bg-white"
    >
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-black/20" />
            <span className="text-sm tracking-[0.3em] uppercase text-black/60 font-mono">
              INNOVATIONS
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tight text-black font-mono">
            專利發明
          </h2>
        </motion.div>

        <div className="relative">
          {/* 專利列表 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className="space-y-0"
          >
            {patents.map((patent, index) => (
              <motion.div
                key={patent.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: [0.19, 1, 0.22, 1]
                  }
                } : {}}
                onMouseEnter={() => setHoveredId(patent.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative border-b border-black/10 py-10 cursor-pointer transition-all duration-500 hover:px-8"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 年份和狀態 */}
                    <div className="flex items-center gap-6 mb-4">
                      <span className="text-sm font-mono text-black/40 uppercase tracking-widest">
                        {patent.filingDate ? new Date(patent.filingDate).getFullYear() : 'PENDING'}
                      </span>
                      <div className={`text-xs font-mono uppercase tracking-widest ${
                        patent.status === '已核准' || patent.status === '已授權' ? 'text-green-600' :
                        patent.status === '審查中' || patent.status === 'pending' ? 'text-blue-600' :
                        'text-gray-500'
                      }`}>
                        {patent.status}
                      </div>
                      <div className="text-xs font-mono uppercase tracking-widest text-black/40">
                        {patent.category}
                      </div>
                    </div>

                    {/* 標題 */}
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 tracking-tight text-gray-900 transition-all duration-500 group-hover:translate-x-4">
                      {patent.title}
                    </h3>

                    {/* 描述 */}
                    <p className="text-sm md:text-base text-gray-700 max-w-3xl leading-relaxed transition-all duration-500 group-hover:text-gray-900">
                      {patent.description}
                    </p>

                    {/* 專利資訊 */}
                    <div className="flex items-center gap-8 mt-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                      {patent.patentNumber && (
                        <div className="flex items-center gap-2 text-sm text-black/50">
                          <Award size={14} />
                          <span className="font-mono">{patent.patentNumber}</span>
                        </div>
                      )}
                      {patent.grantDate && (
                        <div className="flex items-center gap-2 text-sm text-black/50">
                          <Calendar size={14} />
                          <span className="font-mono">授權: {formatDate(patent.grantDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 箭頭 */}
                  <motion.div
                    className="flex items-center justify-center w-12 h-12 ml-8"
                    animate={{
                      x: hoveredId === patent.id ? 10 : 0,
                      opacity: hoveredId === patent.id ? 1 : 0.3
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <ArrowRight size={24} className="text-black" />
                  </motion.div>
                </div>

                {/* 連結 */}
                {patent.patentUrl && (
                  <a
                    href={patent.patentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10"
                    aria-label={`查看 ${patent.title} 專利文件`}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* 空狀態 */}
          {(!Array.isArray(patents) || patents.length === 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-32 h-32 mx-auto mb-8 border-2 border-black/10 rounded-full flex items-center justify-center">
                <Award size={48} className="text-black/20" />
              </div>
              <p className="text-2xl font-mono uppercase tracking-widest text-black/30 mb-4">
                NO PATENTS YET
              </p>
              <p className="text-sm font-mono text-black/20 uppercase tracking-widest">
                專利資料即將上線
              </p>
            </motion.div>
          )}
        </div>

        {/* 底部統計 */}
        {patents.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-20 pt-12 border-t border-black/10 flex items-center justify-between"
          >
            <div className="flex items-center gap-8 md:gap-12">
              <div>
                <p className="text-2xl md:text-3xl font-bold font-mono text-gray-900">{patents.length}</p>
                <p className="text-xs md:text-sm font-mono uppercase tracking-widest text-gray-600 mt-1">
                  Total Patents
                </p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold font-mono text-gray-900">
                  {patents.filter(p => p.status === '已核准' || p.status === '已授權').length}
                </p>
                <p className="text-xs md:text-sm font-mono uppercase tracking-widest text-gray-600 mt-1">
                  Granted
                </p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold font-mono text-gray-900">
                  {patents.filter(p => p.status === '審查中' || p.status === 'pending').length}
                </p>
                <p className="text-xs md:text-sm font-mono uppercase tracking-widest text-gray-600 mt-1">
                  Pending
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}