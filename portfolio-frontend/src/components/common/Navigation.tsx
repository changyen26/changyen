'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Easing } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useScroll } from '../../hooks/useScroll';
import { cn } from '../../lib/utils';
import { adminApi } from '../../lib/adminApi';
import { logger } from '../../lib/logger';
import Button from './Button';

const navItems = [
  { label: 'HOME', href: '#home' },
  { label: 'PATENTS', href: '#patents' },
  { label: 'COMPETITIONS', href: '#competitions' },
  { label: 'NEWS', href: '#news' },
  { label: 'ABOUT', href: '#about' },
];

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState('謝長諺'); // 預設值
  const { scrollY, scrollDirection } = useScroll();
  const [activeSection, setActiveSection] = useState('home');
  const [currentTime, setCurrentTime] = useState('');

  const isVisible = scrollY < 100 || scrollDirection === 'up';

  useEffect(() => {
    // 更新時間
    const updateTime = () => {
      const now = new Date();
      const taiwanTime = now.toLocaleString('en-US', {
        timeZone: 'Asia/Taipei',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      setCurrentTime(`TAIWAN, TW ${taiwanTime} CST`);
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 60000); // 每分鐘更新

    // 延遲載入用戶資料，避免阻塞初始渲染
    const timer = setTimeout(() => {
      const loadUserData = async () => {
        try {
          const userData = await adminApi.getUserInfo();
          logger.log('Navigation loaded user data:', userData);
          if (userData && userData.name) {
            setUserName(userData.name);
          }
        } catch (error) {
          logger.error('Failed to load user info in Navigation:', error);
        }
      };
      loadUserData();
    }, 200); // 延遲載入，讓頁面先渲染

    const handleSectionChange = () => {
      const sections = navItems.map(item => item.href.substring(1));
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleSectionChange);
    return () => {
      window.removeEventListener('scroll', handleSectionChange);
      clearTimeout(timer);
      clearInterval(timeInterval);
    };
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' as Easing }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrollY > 50
          ? 'bg-white border-b border-gray-200'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0"
          >
            <h1 className="text-sm font-mono uppercase tracking-widest text-black">
              {userName}.PORTFOLIO
            </h1>
          </motion.div>

          {/* Role - 隱藏在滾動時 */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: scrollY < 50 ? 1 : 0,
              y: scrollY < 50 ? 0 : -20
            }}
            transition={{ duration: 0.3 }}
            className="hidden md:block flex-1 text-center"
          >
            <p className="text-xs font-mono uppercase tracking-widest text-gray-600">
              INNOVATION ENGINEER — AI / TECH
            </p>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => scrollToSection(item.href)}
                  className={cn(
                    'px-4 py-2 text-xs font-mono uppercase tracking-widest transition-all duration-200 relative border-b border-transparent',
                    activeSection === item.href.substring(1)
                      ? 'text-black border-black'
                      : 'text-gray-500 hover:text-black hover:border-gray-300'
                  )}
                >
                  {item.label}
                  {activeSection === item.href.substring(1) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gray-100 rounded-md -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Location & Time - 隱藏在滾動時 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: scrollY < 50 ? 1 : 0,
              x: scrollY < 50 ? 0 : 20
            }}
            transition={{ duration: 0.3 }}
            className="hidden lg:block"
          >
            <p className="text-xs font-mono uppercase tracking-widest text-gray-600">
              {currentTime}
            </p>
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="開啟選單"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/20"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => scrollToSection(item.href)}
                  className={cn(
                    'block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200',
                    activeSection === item.href.substring(1)
                      ? 'text-black bg-gray-100'
                      : 'text-gray-600 hover:text-black hover:bg-gray-50'
                  )}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}