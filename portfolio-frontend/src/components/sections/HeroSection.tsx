'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Mail, Phone } from 'lucide-react';
import { gsap } from 'gsap';
import { UserInfo } from '@/types/admin';
import { adminApi } from '@/lib/adminApi';
import Button from '@/components/common/Button';
import TypewriterText from '@/components/animations/TypewriterText';
import MagneticButton from '@/components/animations/MagneticButton';

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
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
    // Load user data
    const loadUserData = async () => {
      try {
        const userData = await adminApi.getUserInfo();
        console.log('HeroSection loaded user data:', userData);
        if (userData) {
          setUserInfo(userData);
        }
      } catch (error) {
        console.error('Failed to load user info in HeroSection:', error);
      }
    };

    loadUserData();

    // Set up periodic reload for real-time updates
    const interval = setInterval(loadUserData, 30000); // 30 seconds

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      // 背景動畫
      gsap.to(heroRef.current, {
        backgroundPosition: '50% 0%',
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: 'none'
      });

      // 文字動畫
      if (titleRef.current) {
        const titleChars = titleRef.current.textContent?.split('') || [];
        titleRef.current.innerHTML = titleChars.map(char => 
          `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('');
        
        tl.from(titleRef.current.children, {
          opacity: 0,
          y: 100,
          rotationX: -90,
          duration: 0.8,
          stagger: 0.1,
          ease: 'back.out(1.7)'
        });
      }

      tl.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power2.out'
      }, '-=0.3');
    }, heroRef);

    return () => {
      ctx.revert();
      clearInterval(interval);
    };
  }, []);

  return (
    <section 
      id="home" 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      style={{
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
        `,
        backgroundSize: '400% 400%'
      }}
    >
      {/* 浮動的幾何形狀 */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => {
          // 使用索引作為種子來生成一致的"隨機"值
          const seed = i * 137.5; // 使用黃金角度作為基礎
          const width = ((seed * 47) % 200) + 100; // 100-300px
          const height = ((seed * 53) % 200) + 100; // 100-300px
          const left = (seed * 17) % 100; // 0-100%
          const top = (seed * 23) % 100; // 0-100%
          const x = ((seed * 31) % 100) - 50; // -50 to 50
          const y = ((seed * 41) % 100) - 50; // -50 to 50
          const duration = ((seed * 7) % 10) + 10; // 10-20s
          
          return (
            <motion.div
              key={i}
              className="absolute bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                left: `${left}%`,
                top: `${top}%`,
              }}
              animate={{
                x: [0, x],
                y: [0, y],
                rotate: [0, 360],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'linear'
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
            {userInfo.name.charAt(0)}
          </div>
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-6 leading-tight">
          <TypewriterText 
            text={userInfo.name}
            delay={500}
            speed={100}
            showCursor={false}
          />
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          <TypewriterText 
            text={userInfo.title}
            delay={2000}
            speed={50}
            showCursor={false}
          />
        </p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto"
        >
          {userInfo.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <MagneticButton strength={0.3}>
            <Button 
              size="lg" 
              className="group"
              onClick={() => document.getElementById('patents')?.scrollIntoView({ behavior: 'smooth' })}
            >
              查看我的作品
              <motion.div
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.div>
            </Button>
          </MagneticButton>

          <div className="flex gap-4">
            <MagneticButton strength={0.2}>
              <motion.a
                href={`mailto:${userInfo.email}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200/50"
              >
                <Mail size={20} className="text-gray-700" />
              </motion.a>
            </MagneticButton>
            
            <MagneticButton strength={0.2}>
              <motion.a
                href={`tel:${userInfo.phone}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200/50"
              >
                <Phone size={20} className="text-gray-700" />
              </motion.a>
            </MagneticButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.button
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
          >
            <ChevronDown size={24} className="text-gray-600" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}