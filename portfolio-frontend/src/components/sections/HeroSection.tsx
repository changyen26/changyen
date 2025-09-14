'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';
import { UserInfo } from '../../types/admin';
import { useScroll } from '../../hooks/useScroll';
import { adminApi } from '../../lib/adminApi';
import { logger } from '../../lib/logger';
import Button from '../common/Button';
import TextReveal from '../animations/TextReveal';
import AnimatedLink from '../animations/AnimatedLink';

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const { scrollY } = useScroll();
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
    // 延遲載入用戶資料，避免阻塞初始渲染
    const timer = setTimeout(() => {
      const loadUserData = async () => {
        try {
          const userData = await adminApi.getUserInfo();
          logger.log('HeroSection loaded user data:', userData);
          if (userData) {
            setUserInfo(userData);
          }
        } catch (error) {
          logger.error('Failed to load user info in HeroSection:', error);
        }
      };
      loadUserData();
    }, 100); // 延遲 100ms 載入

    // 恢復完整的 GSAP 動畫
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
      clearTimeout(timer);
    };
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 text-black"
    >
      {/* 極簡網格背景 */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="mb-16"
        >
          <div className="w-2 h-2 mx-auto mb-8 bg-black rounded-full" />
        </motion.div>

        <TextReveal
          className="text-5xl md:text-7xl font-bold text-black mb-8 leading-tight tracking-wider uppercase font-mono"
          delay={0.3}
          duration={1}
        >
          {userInfo.name}
        </TextReveal>

        <TextReveal
          className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed uppercase tracking-widest font-mono"
          delay={0.6}
          duration={1}
        >
          {userInfo.title || "INNOVATION THROUGH TECHNOLOGY"}
        </TextReveal>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="text-sm text-gray-500 mb-16 max-w-xl mx-auto uppercase tracking-widest font-mono leading-loose"
        >
          {userInfo.description || "DEDICATED TO CREATING INNOVATIVE DIGITAL EXPERIENCES"}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="flex justify-center items-center mb-20"
        >
          <AnimatedLink
            onClick={() => document.getElementById('patents')?.scrollIntoView({ behavior: 'smooth' })}
            className="border border-black/20 px-8 py-3 text-sm uppercase tracking-widest font-mono text-black hover:bg-black hover:text-white transition-colors duration-500"
            underlineColor="bg-black"
          >
            VIEW WORK
            <motion.span
              className="ml-3 inline-block"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              →
            </motion.span>
          </AnimatedLink>
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
            transition={{ duration: 3, repeat: Infinity }}
            className="p-3 border border-black/20 text-black hover:bg-black hover:text-white transition-all duration-300"
          >
            <ChevronDown size={16} />
          </motion.button>
        </motion.div>
      </div>

      {/* 專業領域超大背景標籤 - 頁面底部 */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 2.5 }}
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-7xl"
        style={{
          transform: `translate(-50%, 0) scale(${Math.max(0.7, Math.min(1.3, 0.7 + scrollY / 400))})`,
          opacity: Math.max(0, Math.min(0.08, 0.08 - scrollY / 1500))
        }}
      >
        <div className="text-center overflow-hidden w-full">
          <motion.h2
            className="font-bold font-mono uppercase text-black/8 leading-none select-none pointer-events-none whitespace-nowrap"
            style={{
              fontSize: `clamp(1rem, 4.5vw, 6rem)`,
              letterSpacing: scrollY > 200 ? '0.2em' : '0.1em'
            }}
            animate={{
              letterSpacing: scrollY > 200 ? '0.2em' : '0.1em'
            }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          >
            物聯網｜壓電薄膜｜半導體｜全端
          </motion.h2>
        </div>
      </motion.div>
    </section>
  );
}