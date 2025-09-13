import { lazy, Suspense } from 'react';
import Navigation from '../components/common/Navigation';
import HeroSection from '../components/sections/HeroSection';

// 懶加載非關鍵組件
const AboutSection = lazy(() => import('../components/sections/AboutSection'));
const PatentsSection = lazy(() => import('../components/sections/PatentsSection'));
const CompetitionsSection = lazy(() => import('../components/sections/CompetitionsSection'));
const NewsSection = lazy(() => import('../components/sections/NewsSection'));

// 簡單的載入組件
const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export default function Home() {
  return (
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
  );
}