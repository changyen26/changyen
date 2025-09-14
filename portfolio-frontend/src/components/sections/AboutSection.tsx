'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Easing } from 'framer-motion';
import { Code, Lightbulb, Users, Target, ArrowRight } from 'lucide-react';
import { useInView } from '../../hooks/useInView';
import { Skill, UserInfo } from '../../types/admin';
import { adminApi } from '../../lib/adminApi';
import { logger } from '../../lib/logger';

const values = [
  {
    icon: Lightbulb,
    title: '創新思維',
    subtitle: 'Innovation',
    description: '持續探索新技術，追求創新解決方案，推動技術進步。專注於將前沿科技應用到實際項目中，創造有意義的產品體驗。',
    details: ['人工智能應用開發', '物聯網系統設計', '區塊鏈技術研究', '前沿技術探索']
  },
  {
    icon: Code,
    title: '技術精進',
    subtitle: 'Excellence',
    description: '專注於程式碼品質，追求最佳實踐，持續學習成長。堅持寫出可維護、可擴展、高性能的代碼。',
    details: ['前後端架構設計', '代碼質量控制', '性能優化實踐', '技術棧深度學習']
  },
  {
    icon: Users,
    title: '團隊合作',
    subtitle: 'Collaboration',
    description: '重視團隊協作，樂於分享知識，共同實現目標。建立良好的溝通機制，促進知識共享和技能提升。',
    details: ['跨部門協作經驗', '技術團隊領導', '知識分享文化', '敏捷開發實踐']
  },
  {
    icon: Target,
    title: '目標導向',
    subtitle: 'Goal-Driven',
    description: '明確目標規劃，專注執行效率，確保項目成功。從用戶需求出發，以結果為導向完成每個項目。',
    details: ['項目管理經驗', '需求分析能力', '解決方案設計', '成果交付保證']
  }
];

// 翻卡組件
const FlipCard = ({ value, index }: { value: typeof values[0], index: number }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const IconComponent = value.icon;

  return (
    <motion.div
      className="flip-card-container h-80 w-full cursor-pointer"
      onHoverStart={() => setIsFlipped(true)}
      onHoverEnd={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] as Easing }}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="flip-card relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] as Easing }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 正面 */}
        <div
          className="flip-card-front absolute inset-0 w-full h-full bg-white border border-black/10 flex flex-col items-center justify-center text-center p-8 group"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <motion.div
            className="mb-6 text-black/20 group-hover:text-black/40 transition-colors duration-500"
            whileHover={{ scale: 1.1 }}
          >
            <IconComponent size={48} strokeWidth={1} />
          </motion.div>
          <h3 className="text-2xl font-bold font-mono uppercase tracking-wider text-black mb-2">
            {value.title}
          </h3>
          <p className="text-sm font-mono uppercase tracking-widest text-black/40">
            {value.subtitle}
          </p>
          <motion.div
            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            animate={{ x: isFlipped ? 5 : 0 }}
          >
            <ArrowRight size={20} className="text-black/40" />
          </motion.div>
        </div>

        {/* 背面 */}
        <div
          className="flip-card-back absolute inset-0 w-full h-full bg-black text-white p-8 flex flex-col justify-between"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <IconComponent size={24} strokeWidth={1.5} className="text-white/80" />
              <h3 className="text-xl font-bold font-mono uppercase tracking-wider">
                {value.title}
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-white/80 mb-6">
              {value.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white/60 mb-3">
              Key Areas
            </h4>
            <ul className="space-y-2">
              {value.details.map((detail, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span className="font-mono">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function AboutSection() {
  const [sectionRef, isInView] = useInView({ threshold: 0.1 });
  const [skillsRef, isSkillsInView] = useInView({ threshold: 0.1 });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "謝長諺",
    email: "changyen26@gmail.com",
    phone: "+886 912 345 678",
    title: "",
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
        logger.log('AboutSection loaded skills data:', skillsData);
        if (skillsData && skillsData.length > 0) {
          setSkills(skillsData);
        } else {
          // 使用預設技能
          setSkills([
            { id: '1', name: '人工智能', level: 95, category: 'Other', icon: '' },
            { id: '2', name: 'Python 開發', level: 90, category: 'Backend', icon: '' },
            { id: '3', name: '物聯網技術', level: 85, category: 'Other', icon: '' },
            { id: '4', name: '區塊鏈', level: 80, category: 'Other', icon: '' },
            { id: '5', name: '機器學習', level: 88, category: 'Other', icon: '' },
            { id: '6', name: '系統架構', level: 82, category: 'Backend', icon: '' }
          ]);
        }
      } catch (error) {
        logger.error('Failed to load skills:', error);
        // 使用預設技能
        setSkills([
          { id: '1', name: '人工智能', level: 95, category: 'Other', icon: '' },
          { id: '2', name: 'Python 開發', level: 90, category: 'Backend', icon: '' },
          { id: '3', name: '物聯網技術', level: 85, category: 'Other', icon: '' },
          { id: '4', name: '區塊鏈', level: 80, category: 'Other', icon: '' },
          { id: '5', name: '機器學習', level: 88, category: 'Other', icon: '' },
          { id: '6', name: '系統架構', level: 82, category: 'Backend', icon: '' }
        ]);
      }

      // 載入用戶資料
      try {
        const userData = await adminApi.getUserInfo();
        if (userData) {
          setUserInfo(userData);
        }
      } catch (error) {
        logger.error('Failed to load user info:', error);
      }
    };

    loadData();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-32 bg-white"
    >
      <div className="max-w-7xl mx-auto px-8">
        {/* 標題區 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1.2, ease: 'easeOut' as Easing }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-black/20" />
            <span className="text-sm tracking-[0.3em] uppercase text-black/60 font-mono">
              PHILOSOPHY
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tight text-black font-mono">
            ABOUT
          </h2>
        </motion.div>

        {/* 個人簡介 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] as Easing }}
          className="mb-24"
        >
          <div className="max-w-4xl">
            <p className="text-lg md:text-xl leading-relaxed text-black/80 font-mono mb-8">
              {userInfo.name} — {userInfo.description}
            </p>
            <p className="text-base leading-relaxed text-black/60 font-mono">
              專注於將創新技術轉化為有意義的解決方案，相信技術的力量可以改變世界。
              每一個項目都是對完美的追求，每一行代碼都承載著對未來的願景。
            </p>
          </div>
        </motion.div>

        {/* 翻卡網格 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.19, 1, 0.22, 1] as Easing }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24"
        >
          {values.map((value, index) => (
            <FlipCard key={index} value={value} index={index} />
          ))}
        </motion.div>

        {/* 技能展示 */}
        <motion.div
          ref={skillsRef}
          initial={{ opacity: 0 }}
          animate={isSkillsInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.19, 1, 0.22, 1] as Easing }}
          className="mb-24"
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-[1px] bg-black/20" />
            <span className="text-sm tracking-[0.3em] uppercase text-black/60 font-mono">
              EXPERTISE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isSkillsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] as Easing }}
                className="group"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-sm uppercase tracking-wider text-black">
                    {skill.name}
                  </span>
                  <span className="font-mono text-xs text-black/40">
                    {skill.level}%
                  </span>
                </div>
                <div className="h-[1px] bg-black/10 overflow-hidden">
                  <motion.div
                    className="h-full bg-black"
                    initial={{ width: 0 }}
                    animate={isSkillsInView ? { width: `${skill.level}%` } : { width: 0 }}
                    transition={{
                      duration: 1.5,
                      delay: 0.5 + index * 0.1,
                      ease: [0.19, 1, 0.22, 1] as Easing
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {skills.length === 0 && (
            <div className="text-center py-12">
              <p className="font-mono text-black/40 text-sm uppercase tracking-wider">
                No skills data available
              </p>
            </div>
          )}
        </motion.div>

        {/* 聯繫信息 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.19, 1, 0.22, 1] as Easing }}
          className="mt-24 pt-16 border-t border-black/10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-sm font-mono uppercase tracking-widest text-black/40 mb-4">
                Contact
              </h3>
              <div className="space-y-2">
                <p className="font-mono text-black/80">{userInfo.email}</p>
                <p className="font-mono text-black/60">{userInfo.location}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-mono uppercase tracking-widest text-black/40 mb-4">
                Available for
              </h3>
              <div className="space-y-2">
                <p className="font-mono text-black/80">Full-time opportunities</p>
                <p className="font-mono text-black/80">Freelance projects</p>
                <p className="font-mono text-black/80">Technical consulting</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}