'use client';

import { motion } from 'framer-motion';
import { Code, Lightbulb, Users, Target, Mail, Phone } from 'lucide-react';
import { mockUser } from '@/data/mockData';
import { useInView } from '@/hooks/useInView';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

const skills = [
  { name: '人工智能', level: 95, color: 'from-blue-400 to-blue-600' },
  { name: 'Python 開發', level: 90, color: 'from-green-400 to-green-600' },
  { name: '物聯網技術', level: 85, color: 'from-purple-400 to-purple-600' },
  { name: '區塊鏈', level: 80, color: 'from-orange-400 to-orange-600' },
  { name: '機器學習', level: 88, color: 'from-pink-400 to-pink-600' },
  { name: '系統架構', level: 82, color: 'from-indigo-400 to-indigo-600' }
];

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
                  {mockUser.name.charAt(0)}
                </motion.div>
                
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{mockUser.name}</h3>
                  <p className="text-lg text-gray-600 mb-6">{mockUser.title}</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <motion.a
                      href={`mailto:${mockUser.email}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Mail size={16} />
                      <span className="text-sm">{mockUser.email}</span>
                    </motion.a>
                    
                    <motion.a
                      href={`tel:${mockUser.phone}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Phone size={16} />
                      <span className="text-sm">{mockUser.phone}</span>
                    </motion.a>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {mockUser.bio}
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
                key={skill.name}
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900">{skill.name}</span>
                  <span className="text-sm text-gray-600">{skill.level}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                    transition={{ duration: 1.5, delay: index * 0.2, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
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