'use client';

import { lazy, Suspense, useState, useEffect } from 'react';
import Navigation from '../components/common/Navigation';
import HeroSection from '../components/sections/HeroSection';
import Preloader from '../components/animations/Preloader';
import CustomCursor from '../components/animations/CustomCursor';

// 懶加載非關鍵組件
const AboutSection = lazy(() => import('../components/sections/AboutSection'));
const PatentsSection = lazy(() => import('../components/sections/PatentsSection'));
const CompetitionsSection = lazy(() => import('../components/sections/CompetitionsSection'));
const NewsSection = lazy(() => import('../components/sections/NewsSection'));

// 簡單的載入組件
const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
  </div>
);

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  // 頁面載入時滾動到頂部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      {/* 自定義游標 */}
      <CustomCursor />

      {/* 預載入動畫 */}
      {isLoading && <Preloader onComplete={handlePreloaderComplete} />}

      {/* 主要內容 */}
      <div className="min-h-screen">
        <Navigation />
        <main>
          <HeroSection />
          <Suspense fallback={<SectionLoader />}>
            <AboutSection />
          </Suspense>
          <Suspense fallback={<SectionLoader />}>
            <PatentsSection />
          </Suspense>
          <Suspense fallback={<SectionLoader />}>
            <CompetitionsSection />
          </Suspense>
          <Suspense fallback={<SectionLoader />}>
            <NewsSection />
          </Suspense>
        </main>
      </div>
    </>
  );
}