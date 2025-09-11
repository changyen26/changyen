'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Lightbulb, Users, Target, Mail, Phone } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { Skill, UserInfo } from '@/types/admin';
import { adminApi } from '@/lib/adminApi';

// 技能分類顏色映射
const categoryColors: Record<string, string> = {
  'Frontend': 'from-blue-400 to-blue-600',
  'Backend': 'from-green-400 to-green-600',
  'Database': 'from-purple-400 to-purple-600',
  'DevOps': 'from-orange-400 to-orange-600',
  'Mobile': 'from-pink-400 to-pink-600',
  'Design': 'from-indigo-400 to-indigo-600',
  'Tools': 'from-yellow-400 to-yellow-600',
  'Other': 'from-gray-400 to-gray-600'
};

const values = [
  {
    icon: Lightbulb,
    title: '創新思維',
    description: '持續探索新技術，追求創新解決方案，推動技術進步'
  },
  {
    icon: Code,
    title: '技術精進',
    description: '專注於程式碼品質，追求最佳實踐，持續學習成長'
  },
  {
    icon: Users,
    title: '團隊合作',
    description: '重視團隊協作，樂於分享知識，共同實現目標'
  },
  {
    icon: Target,
    title: '目標導向',
    description: '明確目標規劃，專注執行效率，確保項目成功'
  }
];

export default function AboutSection() {
  const [sectionRef, isInView] = useInView({ threshold: 0.2 });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "張智強",
    email: "changyen26@gmail.com",
    phone: "+886 912 345 678",
    title: "全端開發工程師",
    description: "專精於現代化網頁開發，擁有豐富的前端和後端開發經驗",
    github: "https://github.com/changyen26",
    linkedin: "https://linkedin.com/in/changyen",
    avatar: "",
    location: "台灣",
    website: ""
  });

  useEffect(() => {
    const loadData = async () => {
      // 載入技能資料
      try {
        const skillsData = await adminApi.getSkills();
        console.log('AboutSection loaded skills data:', skillsData);
        if (skillsData && skillsData.length > 0) {
          setSkills(skillsData);
        } else {
          // 嘗試從 localStorage 獲取技能數據
          const storedSkills = localStorage.getItem('portfolio_skills');
          if (storedSkills) {
            const parsedSkills = JSON.parse(storedSkills);
            console.log('Using stored skills:', parsedSkills);
            setSkills(parsedSkills);
          } else {
            // 如果都沒有，使用預設技能
            setSkills([
              { id: '1', name: '人工智能', level: 95, category: 'Other', icon: '' },
              { id: '2', name: 'Python 開發', level: 90, category: 'Backend', icon: '' },
              { id: '3', name: '物聯網技術', level: 85, category: 'Other', icon: '' },
              { id: '4', name: '區塊鏈', level: 80, category: 'Other', icon: '' },
              { id: '5', name: '機器學習', level: 88, category: 'Other', icon: '' },
              { id: '6', name: '系統架構', level: 82, category: 'Backend', icon: '' }
            ]);
          }
        }
      } catch (error) {
        console.error('Failed to load skills:', error);
        // 嘗試從 localStorage 獲取技能數據
        const storedSkills = localStorage.getItem('portfolio_skills');
        if (storedSkills) {
          const parsedSkills = JSON.parse(storedSkills);
          console.log('Using stored skills after error:', parsedSkills);
          setSkills(parsedSkills);
        }
      }

      // 載入用戶資料
      try {
        const userData = await adminApi.getUserInfo();
        console.log('AboutSection loaded user data:', userData);
        if (userData) {
          setUserInfo(userData);
        }
      } catch (error) {
        console.error('Failed to load user info:', error);
        // 保持預設用戶資料
      }
    };

    loadData();

    // 定期重新載入數據，以獲取最新的用戶資料
    const interval = setInterval(loadData, 30000); // 30秒重新載入一次
    
    return () => clearInterval(interval);
  }, []);

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
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <section 
      id="about" 
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden"
    >
      {/* 背景裝飾 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            關於我
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            一位充滿熱情的技術創新者，致力於用科技改變世界
          </p>
        </motion.div>

        {/* 個人介紹 */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20"
        >
          <Card className="p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <motion.div
                  className="w-48 h-48 mx-auto lg:mx-0 mb-8 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-6xl font-bold text-white shadow-2xl"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {userInfo.name.charAt(0)}
                </motion.div>
                
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{userInfo.name}</h3>
                  <p className="text-lg text-gray-600 mb-6">{userInfo.title}</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <motion.a
                      href={`mailto:${userInfo.email}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Mail size={16} />
                      <span className="text-sm">{userInfo.email}</span>
                    </motion.a>
                    
                    <motion.a
                      href={`tel:${userInfo.phone}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Phone size={16} />
                      <span className="text-sm">{userInfo.phone}</span>
                    </motion.a>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {userInfo.description}
                </p>
                
                <p className="text-gray-600 leading-relaxed mb-8">
                  我相信技術的力量可以改變世界，每一行程式碼、每一個創新想法都可能成為推動社會進步的動力。
                  在我的職業生涯中，我不僅專注於技術的深度探索，更重視如何將技術應用於解決實際問題，
                  為人類社會創造價值。
                </p>
                
                <Button size="lg" className="w-full sm:w-auto">
                  下載履歷 PDF
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 技能展示 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mb-20"
        >
          <motion.h3
            variants={itemVariants}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            技能專長
          </motion.h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.id}
                variants={itemVariants}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {skill.icon && (
                      <img 
                        src={skill.icon} 
                        alt={skill.name}
                        className="w-5 h-5"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <span className="font-medium text-gray-900">{skill.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">{skill.level}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${categoryColors[skill.category] || categoryColors['Other']} rounded-full`}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                    transition={{ duration: 1.5, delay: index * 0.1, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {skills.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">暫無技能資料</p>
              <p className="text-gray-400 text-sm mt-2">請前往管理後台添加技能</p>
            </div>
          )}
        </motion.div>

        {/* 核心價值 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.h3
            variants={itemVariants}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            核心價值
          </motion.h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={itemVariants}
                className="text-center group"
              >
                <Card className="p-6 h-full hover:shadow-xl">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                  >
                    <value.icon size={32} className="text-blue-600" />
                  </motion.div>
                  
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}