'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Code, Calendar, Tag } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { logger } from '../../lib/logger';
import Button from '../common/Button';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6
    }
  },
};

const ProjectCard = ({ project }: { project: Project }) => {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'short',
      });
    } catch {
      return '';
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden group hover:border-gray-700 transition-all duration-500"
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
    >
      {/* 專案圖片 */}
      <div className="relative h-48 overflow-hidden bg-gray-800">
        {project.imageUrl && !imageError ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <Code className="w-12 h-12 text-gray-600" />
          </div>
        )}

        {/* Featured 標記 */}
        {project.featured && (
          <div className="absolute top-3 left-3">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              精選專案
            </span>
          </div>
        )}

        {/* 創建日期 */}
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-gray-300">
            <Calendar className="w-3 h-3" />
            {formatDate(project.createdAt)}
          </div>
        </div>
      </div>

      {/* 專案內容 */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {project.title}
        </h3>

        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* 技術標籤 */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.slice(0, 6).map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full"
              >
                <Tag className="w-3 h-3" />
                {tech}
              </span>
            ))}
            {project.technologies.length > 6 && (
              <span className="text-xs text-gray-500">
                +{project.technologies.length - 6} more
              </span>
            )}
          </div>
        )}

        {/* 專案連結 */}
        <div className="flex gap-3">
          {project.githubUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(project.githubUrl, '_blank')}
              className="flex items-center gap-2"
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
    </motion.div>
  );
};

const ProjectsSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <section id="projects" className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="projects" className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center py-20">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 bg-black">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* 標題區域 */}
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              專案<span className="text-blue-600">作品集</span>
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              展示我的技術實力與創新思維，每個專案都代表著不同階段的技術挑戰與成長歷程
            </p>
          </motion.div>

          {/* 專案網格 */}
          {projects.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
            >
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-16"
              variants={itemVariants}
            >
              <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl text-gray-400 mb-2">目前沒有專案展示</h3>
              <p className="text-gray-500">專案正在準備中，敬請期待...</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;