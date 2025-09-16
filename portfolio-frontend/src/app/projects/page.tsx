'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Code, Calendar, Tag, ArrowLeft, Filter } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { logger } from '../../lib/logger';
import Button from '../../components/common/Button';
import Navigation from '../../components/common/Navigation';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};


const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
      className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden group hover:border-gray-700 transition-all duration-500 ${
        index === 0 && project.featured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
    >
      {/* 專案圖片 */}
      <div className={`relative overflow-hidden bg-gray-800 ${
        index === 0 && project.featured ? 'h-64 md:h-80' : 'h-48'
      }`}>
        {project.imageUrl && !imageError ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <Code className="w-16 h-16 text-gray-600" />
          </div>
        )}

        {/* Featured 標記 */}
        {project.featured && (
          <div className="absolute top-4 left-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm px-3 py-1 rounded-full">
              精選專案
            </span>
          </div>
        )}

        {/* 創建日期 */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-sm text-gray-300">
            <Calendar className="w-4 h-4" />
            {formatDate(project.createdAt)}
          </div>
        </div>

        {/* Hover 覆蓋層 */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
          {project.githubUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(project.githubUrl, '_blank')}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              <Github className="w-4 h-4" />
              原始碼
            </Button>
          )}

          {project.liveUrl && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.open(project.liveUrl, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              查看專案
            </Button>
          )}
        </div>
      </div>

      {/* 專案內容 */}
      <div className="p-6">
        <h3 className={`font-bold text-white mb-3 group-hover:text-blue-400 transition-colors ${
          index === 0 && project.featured ? 'text-2xl' : 'text-xl'
        }`}>
          {project.title}
        </h3>

        <p className={`text-gray-400 mb-4 ${
          index === 0 && project.featured ? 'text-base line-clamp-4' : 'text-sm line-clamp-3'
        }`}>
          {project.description}
        </p>

        {/* 技術標籤 */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.technologies.slice(0, index === 0 && project.featured ? 8 : 6).map((tech, techIndex) => (
              <span
                key={techIndex}
                className="inline-flex items-center gap-1 bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full hover:bg-gray-700 transition-colors"
              >
                <Tag className="w-3 h-3" />
                {tech}
              </span>
            ))}
            {project.technologies.length > (index === 0 && project.featured ? 8 : 6) && (
              <span className="text-xs text-gray-500 px-2">
                +{project.technologies.length - (index === 0 && project.featured ? 8 : 6)} more
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getProjects();

        if (response.success && response.data) {
          setProjects(response.data);
        } else {
          setError('無法載入專案資料');
          logger.error('Failed to fetch projects:', response.error);
        }
      } catch (error) {
        setError('載入專案時發生錯誤');
        logger.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project =>
    filter === 'all' || (filter === 'featured' && project.featured)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-16 flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-16 flex items-center justify-center h-96">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="mb-8 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                專案<span className="text-blue-600">作品集</span>
              </h1>

              <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>

              <p className="text-gray-400 text-xl max-w-3xl mx-auto mb-12">
                這裡展示了我的技術實力與創新思維，每個專案都代表著不同階段的技術挑戰與成長歷程。
                從概念到實現，每一行代碼都承載著對完美的追求。
              </p>

              {/* 過濾器 */}
              <div className="flex items-center justify-center gap-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <Button
                  variant={filter === 'all' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  全部專案 ({projects.length})
                </Button>
                <Button
                  variant={filter === 'featured' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('featured')}
                >
                  精選專案 ({projects.filter(p => p.featured).length})
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 專案展示區 */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-6">
            {filteredProjects.length > 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {filteredProjects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Code className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl text-gray-400 mb-4">
                  {filter === 'featured' ? '目前沒有精選專案' : '目前沒有專案展示'}
                </h3>
                <p className="text-gray-500 mb-8">
                  {filter === 'featured'
                    ? '精選專案正在準備中，敬請期待...'
                    : '專案正在開發中，很快就會有精彩內容！'
                  }
                </p>
                {filter === 'featured' && (
                  <Button
                    variant="outline"
                    onClick={() => setFilter('all')}
                  >
                    查看所有專案
                  </Button>
                )}
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProjectsPage;