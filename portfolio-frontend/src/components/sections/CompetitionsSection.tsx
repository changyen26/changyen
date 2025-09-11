'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Medal, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useInView } from '@/hooks/useInView';
import Card from '@/components/common/Card';
import { Competition } from '@/types/admin';
import { adminApi } from '@/lib/adminApi';

export default function CompetitionsSection() {
  const [sectionRef, isInView] = useInView({ threshold: 0.2 });
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        const competitionsData = await adminApi.getCompetitions();
        // 只顯示精選的競賽，並按日期排序
        const featuredCompetitions = competitionsData
          .filter(comp => comp.featured)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setCompetitions(featuredCompetitions || []);
      } catch (error) {
        console.error('Failed to load competitions:', error);
        setCompetitions([]);
      }
    };

    loadCompetitions();
  }, []);

  const timelineVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.8 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1
    }
  };

  const getRankColor = (result: string) => {
    switch (result) {
      case '冠軍':
        return 'from-yellow-400 to-yellow-600';
      case '亞軍':
        return 'from-gray-400 to-gray-600';
      case '季軍':
        return 'from-orange-400 to-orange-600';
      case '優選':
      case '佳作':
        return 'from-blue-400 to-blue-600';
      case '特別獎':
        return 'from-purple-400 to-purple-600';
      case '入圍':
        return 'from-green-400 to-green-600';
      default:
        return 'from-indigo-400 to-indigo-600';
    }
  };

  return (
    <section 
      id="competitions" 
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
    >
      {/* 背景裝飾 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-12 h-12 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            競賽成就
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            在國際舞台上展現創新實力，每一個獎項都是對技術能力的肯定
          </p>
        </motion.div>

        {/* 成就時間線 */}
        {competitions.length > 0 ? (
          <div className="relative">
            {/* 時間線主軸 */}
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-blue-400 to-purple-600 rounded-full"
              style={{ height: '100%' }}
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />

            <motion.div
              variants={timelineVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="space-y-16"
            >
              {competitions.map((competition, index) => (
              <motion.div
                key={competition.id}
                variants={itemVariants}
                className={`flex items-center ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                  <Card className="p-8 group hover:shadow-2xl">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-3 rounded-full bg-gradient-to-r ${getRankColor(competition.result)} text-white shadow-lg`}>
                        <Trophy size={24} />
                      </div>
                      
                      {(competition.certificateUrl || competition.certificateFile) && (
                        <motion.a
                          href={competition.certificateFile ? 
                            adminApi.getFileDataUrl(competition.certificateFile) : 
                            competition.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-gray-100 rounded-full"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ExternalLink size={20} className="text-gray-500" />
                        </motion.a>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {competition.title}
                    </h3>

                    <div className="flex items-center gap-4 mb-4">
                      <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getRankColor(competition.result)} text-white font-medium`}>
                        <Medal size={16} className="inline mr-2" />
                        {competition.result}
                      </div>
                      
                      {competition.category && (
                        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {competition.category}
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {competition.description}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                      <Calendar size={16} className="mr-2" />
                      <span>{formatDate(competition.date)}</span>
                    </div>
                  </Card>
                </div>

                {/* 時間線節點 */}
                <motion.div
                  className="relative z-10"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.3 }}
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getRankColor(competition.result)} shadow-xl flex items-center justify-center`}>
                    <Trophy size={24} className="text-white" />
                  </div>
                  
                  {/* 脈衝效果 */}
                  <motion.div
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${getRankColor(competition.result)} opacity-30`}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  />
                </motion.div>

                <div className="w-1/2" />
              </motion.div>
            ))}
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
              <Trophy size={40} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">暫無競賽資料</p>
            <p className="text-gray-400 text-sm">請前往管理後台添加競賽成就</p>
          </div>
        )}

        {/* 統計摘要 */}
        {competitions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-20 text-center"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {competitions.filter(c => c.result.includes('冠軍') || c.result.includes('金') || c.result.includes('1')).length}
                </div>
                <div className="text-gray-600">金獎</div>
              </div>
              
              <div>
                <div className="text-3xl font-bold text-gray-600 mb-2">
                  {competitions.filter(c => c.result.includes('亞軍') || c.result.includes('銀') || c.result.includes('2')).length}
                </div>
                <div className="text-gray-600">銀獎</div>
              </div>
              
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {competitions.filter(c => c.result.includes('季軍') || c.result.includes('銅') || c.result.includes('3')).length}
                </div>
                <div className="text-gray-600">銅獎</div>
              </div>
              
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {competitions.length}
                </div>
                <div className="text-gray-600">總獲獎</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}