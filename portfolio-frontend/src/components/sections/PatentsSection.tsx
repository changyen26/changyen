'use client';

import { motion } from 'framer-motion';
import { Calendar, Award, FileText, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils';
import { useInView } from '@/hooks/useInView';
import Card from '@/components/common/Card';
import { Project } from '@/types/admin';
import { adminApi } from '@/lib/adminApi';

const categories = ['全部', '人工智能', '物聯網', '區塊鏈'];

export default function PatentsSection() {
  const [sectionRef, isInView] = useInView({ threshold: 0.2 });
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await adminApi.getProjects();
        console.log('PatentsSection loaded projects data:', projectsData);
        setProjects(projectsData || []);
      } catch (error) {
        console.error('Failed to load projects:', error);
        setProjects([]);
      }
    };

    loadProjects();

    // 定期重新載入數據
    const interval = setInterval(loadProjects, 30000); // 30秒重新載入一次
    
    return () => clearInterval(interval);
  }, []);

  const filteredPatents = selectedCategory === '全部' 
    ? (projects || [])
    : (projects || []).filter(project => project.category === selectedCategory);

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
    hidden: { opacity: 0, y: 50, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0
    }
  };

  return (
    <section 
      id="patents" 
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            專利發明
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            創新技術的結晶，每一項專利都代表著對未來科技的探索與貢獻
          </p>
        </motion.div>

        {/* 分類篩選 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <div className="flex items-center gap-2 text-gray-500 mr-4">
            <Filter size={20} />
            <span>分類篩選：</span>
          </div>
          
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* 專利展示網格 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {Array.isArray(filteredPatents) && filteredPatents.map((project) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              className="group perspective-1000"
            >
              <Card className="p-8 h-full hover:shadow-2xl">
                <div className="flex items-start justify-between mb-6">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${project.status === 'completed' ? 'bg-green-100 text-green-700' : project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {project.status === 'completed' ? '已完成' : project.status === 'in_progress' ? '進行中' : '規劃中'}
                  </div>
                  
                  <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FileText size={20} className="text-gray-400" />
                  </motion.div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {project.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {project.description}
                </p>

                <div className="space-y-3">
                  {project.technologies && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Award size={16} className="mr-2" />
                      <span>技術：{project.technologies}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar size={16} className="mr-2" />
                    <span>開始日期：{formatDate(project.createdAt || project.startDate || new Date().toISOString())}</span>
                  </div>

                  {project.endDate && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={16} className="mr-2" />
                      <span>完成日期：{formatDate(project.endDate)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                      {project.category || '專案'}
                    </span>
                    
                    {project.demoUrl || project.repoUrl ? (
                      <motion.a
                        href={project.demoUrl || project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        查看詳情 →
                      </motion.a>
                    ) : (
                      <motion.button
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        查看詳情 →
                      </motion.button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {(!Array.isArray(filteredPatents) || filteredPatents.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
              <FileText size={40} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">{selectedCategory === '全部' ? '暫無專案資料' : '此分類暫無專案資料'}</p>
            <p className="text-gray-400 text-sm">請前往管理後台添加專案</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}