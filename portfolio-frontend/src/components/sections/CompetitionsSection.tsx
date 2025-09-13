'use client';

import { useEffect as useClientEffect } from 'react';

import { useState, useEffect } from 'react';
import { logger } from '../../lib/logger';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Medal, ExternalLink } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { useInView } from '../../hooks/useInView';
import Card from '../common/Card';
import { Competition } from '../../types/admin';
import { adminApi } from '../../lib/adminApi';

export default function CompetitionsSection() {
  const [sectionRef, isInView] = useInView({ threshold: 0.2 });
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        const competitionsData = await adminApi.getCompetitions();
        // 顯示所有競賽，並按日期排序 (最新的在前)
        const sortedCompetitions = competitionsData
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setCompetitions(sortedCompetitions || []);
      } catch (error) {
        logger.error('Failed to load competitions:', error);
        setCompetitions([]);
      }
    };

    // 強制客戶端載入（修復 SSR/hydration 問題）
    const timer = setTimeout(() => {
      loadCompetitions();
    }, 1000);

    return () => clearTimeout(timer);
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
      case '金牌': case '冠軍':
        return 'from-yellow-400 to-yellow-600';
      case '銀牌': case '亞軍':
        return 'from-gray-400 to-gray-600';
      case '銅牌': case '季軍':
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

  // 計算詳細統計資料
  const getDetailedStats = () => {
    const stats = {
      總計: competitions.length,
      金牌: competitions.filter(c => c.result === '金牌' || c.result === '冠軍').length,
      銀牌: competitions.filter(c => c.result === '銀牌' || c.result === '亞軍').length,
      銅牌: competitions.filter(c => c.result === '銅牌' || c.result === '季軍').length,
      優選: competitions.filter(c => c.result === '優選').length,
      佳作: competitions.filter(c => c.result === '佳作').length,
      入圍: competitions.filter(c => c.result === '入圍').length,
      特別獎: competitions.filter(c => c.result === '特別獎').length,
      其他: competitions.filter(c => !['金牌', '冠軍', '銀牌', '亞軍', '銅牌', '季軍', '優選', '佳作', '入圍', '特別獎'].includes(c.result)).length
    };
    return stats;
  };

  const detailedStats = getDetailedStats();

  const handleCompetitionClick = (competition: Competition) => {
    // 檢查是否有詳細資訊可以顯示
    const hasDetails = competition.certificateFile ||
        (competition.certificateUrl && competition.certificateUrl.trim() !== '') ||
        (competition.detailedDescription && competition.detailedDescription.trim() !== '') ||
        (competition.projectImages && competition.projectImages.length > 0) ||
        (competition.projectUrl && competition.projectUrl.trim() !== '');

    // 只要有任何競賽資料就可以點擊查看
    setSelectedCompetition(competition);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCompetition(null);
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
          className="text-center mb-12 md:mb-16 px-4 md:px-0"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            競賽成就
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed">
            在國際舞台上展現創新實力，每一個獎項都是對技術能力的肯定
          </p>

          {/* 競賽統計總覽 */}
          {competitions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
                  <div className="text-2xl md:text-3xl font-bold text-yellow-600 mb-1 md:mb-2">
                    {detailedStats.金牌}
                  </div>
                  <div className="text-sm md:text-base text-gray-600">金獎</div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
                  <div className="text-2xl md:text-3xl font-bold text-gray-600 mb-1 md:mb-2">
                    {detailedStats.銀牌}
                  </div>
                  <div className="text-sm md:text-base text-gray-600">銀獎</div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
                  <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-1 md:mb-2">
                    {detailedStats.銅牌}
                  </div>
                  <div className="text-sm md:text-base text-gray-600">銅獎</div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1 md:mb-2">
                    {detailedStats.總計}
                  </div>
                  <div className="text-sm md:text-base text-gray-600">總獲獎</div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 成就時間線 */}
        {competitions.length > 0 ? (
          <div className="relative">
            {/* 桌面版時間線主軸 */}
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-blue-400 to-purple-600 rounded-full hidden md:block"
              style={{ height: '100%' }}
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />

            {/* 手機版時間線主軸 */}
            <motion.div
              className="absolute left-6 w-0.5 bg-gradient-to-b from-blue-400 to-purple-600 rounded-full md:hidden"
              style={{ height: '100%' }}
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />

            <motion.div
              variants={timelineVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="space-y-12 md:space-y-16"
            >
              {competitions.map((competition, index) => (
              <motion.div
                key={competition.id}
                variants={itemVariants}
                className={`flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } flex-row`}
              >
                {/* 桌面版卡片佈局 */}
                <div className={`hidden md:block w-1/2 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                  <Card
                    className="p-8 group hover:shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => handleCompetitionClick(competition)}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-3 rounded-full bg-gradient-to-r ${getRankColor(competition.result)} text-white shadow-lg`}>
                        <Trophy size={24} />
                      </div>

                      {(
                        <motion.div
                          className="opacity-70 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-blue-100 rounded-full"
                          whileHover={{ scale: 1.1 }}
                        >
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </motion.div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {competition.name}
                    </h3>

                    <div className="flex items-center gap-4 mb-4 flex-wrap">
                      <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getRankColor(competition.result)} text-white font-medium text-sm`}>
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

                {/* 手機版卡片佈局 */}
                <div className="md:hidden flex-1 ml-14 mr-4">
                  <Card
                    className={`p-4 group hover:shadow-lg cursor-pointer hover:scale-[1.02] transition-all duration-300 border-l-4 ${getRankColor(competition.result).includes('yellow') ? 'border-yellow-400' :
                      getRankColor(competition.result).includes('gray') ? 'border-gray-400' :
                      getRankColor(competition.result).includes('orange') ? 'border-orange-400' :
                      getRankColor(competition.result).includes('blue') ? 'border-blue-400' :
                      getRankColor(competition.result).includes('purple') ? 'border-purple-400' :
                      getRankColor(competition.result).includes('green') ? 'border-green-400' : 'border-indigo-400'}`}
                    onClick={() => handleCompetitionClick(competition)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-full bg-gradient-to-r ${getRankColor(competition.result)} text-white shadow-md flex-shrink-0`}>
                        <Trophy size={18} />
                      </div>

                      {(
                        <motion.div
                          className="opacity-60 group-hover:opacity-100 transition-opacity duration-200 p-1 bg-blue-50 rounded-full flex-shrink-0 ml-2"
                          whileHover={{ scale: 1.1 }}
                        >
                          <svg
                            className="w-3.5 h-3.5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </motion.div>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-2 leading-tight pr-2">
                      {competition.name}
                    </h3>

                    <div className="space-y-2 mb-3">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r ${getRankColor(competition.result)} text-white font-medium text-xs`}>
                        <Medal size={12} className="mr-1" />
                        {competition.result}
                      </div>

                      {competition.category && (
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full w-fit">
                          {competition.category}
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3 leading-relaxed text-xs line-clamp-3">
                      {competition.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <div className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        <span>{formatDate(competition.date)}</span>
                      </div>

                      {competition.organizer && (
                        <div className="text-right text-xs text-gray-400 truncate ml-2 max-w-[120px]">
                          {competition.organizer}
                        </div>
                      )}
                    </div>

                    {/* 手機版技術標籤 */}
                    {competition.technologies && competition.technologies.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {competition.technologies.slice(0, 2).map((tech, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-xs rounded"
                            >
                              {tech}
                            </span>
                          ))}
                          {competition.technologies.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{competition.technologies.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>

                {/* 桌面版時間線節點 */}
                <motion.div
                  className="relative z-10 hidden md:block"
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

                {/* 手機版時間線節點 */}
                <motion.div
                  className="absolute left-6 transform -translate-x-1/2 z-10 md:hidden"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.3 }}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getRankColor(competition.result)} shadow-lg flex items-center justify-center border-2 border-white`}>
                    <Trophy size={16} className="text-white" />
                  </div>

                  {/* 脈衝效果 */}
                  <motion.div
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${getRankColor(competition.result)} opacity-20`}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  />
                </motion.div>

                <div className="hidden md:block w-1/2" />
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


        {/* 證書模態對話框 */}
        {showModal && selectedCompetition && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedCompetition.name}
                    </h3>
                    <p className="text-gray-600">{selectedCompetition.organizer}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedCompetition.result === '金牌' || selectedCompetition.result === '冠軍' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : selectedCompetition.result === '銀牌' || selectedCompetition.result === '亞軍'
                          ? 'bg-gray-100 text-gray-800'
                          : selectedCompetition.result === '銅牌' || selectedCompetition.result === '季軍'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedCompetition.result}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(selectedCompetition.date)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {selectedCompetition.description && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">競賽簡介</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedCompetition.description}
                    </p>
                  </div>
                )}

                {selectedCompetition.detailedDescription && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">詳細過程介紹</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {selectedCompetition.detailedDescription}
                    </p>
                  </div>
                )}

                {selectedCompetition.projectImages && selectedCompetition.projectImages.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">作品圖片</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedCompetition.projectImages.map((imageUrl, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="relative group cursor-pointer"
                          onClick={() => window.open(imageUrl, '_blank')}
                        >
                          <img
                            src={imageUrl}
                            alt={`作品圖片 ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWclueBh+eEoeazleilv+WPqzwvdGV4dD48L3N2Zz4=';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded-full p-2">
                              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCompetition.technologies && selectedCompetition.technologies.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">使用技術</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCompetition.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedCompetition.teamSize && selectedCompetition.teamSize > 1) && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">團隊資訊</h4>
                    <p className="text-gray-700">
                      團隊人數：{selectedCompetition.teamSize} 人
                      {selectedCompetition.role && ` · 擔任角色：${selectedCompetition.role}`}
                    </p>
                  </div>
                )}

                {/* 證書顯示 */}
                {selectedCompetition.certificateFile && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">獲獎證書</h4>
                    {selectedCompetition.certificateFile.type.startsWith('image/') ? (
                      <img
                        src={adminApi.getFileDataUrl(selectedCompetition.certificateFile)}
                        alt="競賽證書"
                        className="w-full max-w-3xl mx-auto rounded-lg shadow-lg"
                      />
                    ) : selectedCompetition.certificateFile.type === 'application/pdf' ? (
                      <div className="text-center py-8">
                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-700 mb-4">PDF 證書文件</p>
                        <button
                          onClick={() => {
                            const url = adminApi.getFileDataUrl(selectedCompetition.certificateFile!);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = selectedCompetition.certificateFile!.name;
                            link.click();
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          下載 PDF
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* 外部連結按鈕 */}
                <div className="flex flex-wrap gap-3 justify-center mt-6">
                  {selectedCompetition.certificateUrl && !selectedCompetition.certificateFile && (
                    <button
                      onClick={() => window.open(selectedCompetition.certificateUrl, '_blank')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      查看證書
                    </button>
                  )}

                  {selectedCompetition.projectUrl && (
                    <button
                      onClick={() => window.open(selectedCompetition.projectUrl, '_blank')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      查看專案
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}