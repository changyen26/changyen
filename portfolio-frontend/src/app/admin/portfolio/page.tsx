'use client';

import { useState, useEffect } from 'react';
import { logger } from '../../../lib/logger';
import { motion } from 'framer-motion';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { UserInfo, Project, Skill } from '../../../types/admin';
import { adminApi } from '../../../lib/adminApi';
import AdminProtection from '../../../components/common/AdminProtection';

export default function PortfolioPreviewPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [userInfoData, projectsData, skillsData] = await Promise.all([
        adminApi.getUserInfo(),
        adminApi.getProjects(),
        adminApi.getSkills()
      ]);
      
      setUserInfo(userInfoData);
      setProjects(projectsData || []);
      setSkills(skillsData || []);
    } catch {
      logger.error('Failed to load data:');
    } finally {
      setIsLoading(false);
    }
  };

  const featuredProjects = projects.filter(project => project.featured);
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (isLoading) {
    return (
      <AdminProtection>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">載入作品集中...</p>
        </div>
        </div>
      </AdminProtection>
    );
  }

  return (
    <AdminProtection>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">作品集預覽</h1>
            <p className="text-gray-600 mt-2">預覽所有管理的內容和信息</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
            >
              返回
            </Button>
            <Button 
              onClick={() => window.open('/', '_blank')}
            >
              查看完整網站
            </Button>
          </div>
        </motion.div>

        {/* 個人信息概覽 */}
        {userInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="flex-shrink-0">
                  {userInfo.avatar ? (
                    <img 
                      src={userInfo.avatar} 
                      alt={userInfo.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{userInfo.name}</h2>
                  <p className="text-lg text-blue-600 mb-4">{userInfo.title}</p>
                  <p className="text-gray-600 mb-4">{userInfo.description}</p>
                  
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    {userInfo.email && (
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {userInfo.email}
                      </div>
                    )}
                    
                    {userInfo.phone && (
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {userInfo.phone}
                      </div>
                    )}
                    
                    {userInfo.location && (
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {userInfo.location}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-4 mt-4 justify-center md:justify-start">
                    {userInfo.github && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(userInfo.github, '_blank')}
                      >
                        GitHub
                      </Button>
                    )}
                    {userInfo.linkedin && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(userInfo.linkedin, '_blank')}
                      >
                        LinkedIn
                      </Button>
                    )}
                    {userInfo.website && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(userInfo.website, '_blank')}
                      >
                        個人網站
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 精選專案 */}
        {featuredProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">精選專案</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card className="p-6 h-full flex flex-col">
                    {project.imageUrl && (
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    )}
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {project.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 flex-1">
                      {project.description}
                    </p>
                    
                    {project.technologies.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, i) => (
                            <span 
                              key={i}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-auto">
                      {project.githubUrl && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(project.githubUrl, '_blank')}
                        >
                          GitHub
                        </Button>
                      )}
                      {project.liveUrl && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(project.liveUrl, '_blank')}
                        >
                          展示
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 技能展示 */}
        {skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">專業技能</h2>
            
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorySkills.map((skill) => (
                    <Card key={skill.id} className="p-4">
                      <div className="flex items-center mb-2">
                        {skill.icon && (
                          <img 
                            src={skill.icon} 
                            alt={skill.name}
                            className="w-5 h-5 mr-2"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <span className="font-medium text-gray-900">{skill.name}</span>
                      </div>
                      
                      <div className="mb-1">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>{skill.level >= 90 ? '專家' : skill.level >= 75 ? '熟練' : skill.level >= 50 ? '中等' : skill.level >= 25 ? '初級' : '入門'}</span>
                          <span>{skill.level}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              skill.level >= 90 ? 'bg-green-500' :
                              skill.level >= 75 ? 'bg-blue-500' :
                              skill.level >= 50 ? 'bg-yellow-500' :
                              skill.level >= 25 ? 'bg-orange-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* 統計信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">內容統計</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
                <div className="text-sm text-gray-600">總專案數</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{featuredProjects.length}</div>
                <div className="text-sm text-gray-600">精選專案</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{skills.length}</div>
                <div className="text-sm text-gray-600">技能數量</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{Object.keys(skillsByCategory).length}</div>
                <div className="text-sm text-gray-600">技能分類</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
      </div>
    </AdminProtection>
  );
}