import Navigation from '@/components/common/Navigation';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import PatentsSection from '@/components/sections/PatentsSection';
import CompetitionsSection from '@/components/sections/CompetitionsSection';
import NewsSection from '@/components/sections/NewsSection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <PatentsSection />
        <CompetitionsSection />
        <NewsSection />
      </main>
    </div>
  );
}