'use client';

import { useState, useEffect } from 'react';
import { throttle } from '../lib/utils';

interface ScrollState {
  scrollY: number;
  scrollDirection: 'up' | 'down' | 'none';
  isScrolling: boolean;
}

export function useScroll(): ScrollState {
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollY: 0,
    scrollDirection: 'none',
    isScrolling: false
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollState = throttle(() => {
      const scrollY = window.scrollY;
      const scrollDirection = scrollY > lastScrollY ? 'down' : scrollY < lastScrollY ? 'up' : 'none';
      
      setScrollState({
        scrollY,
        scrollDirection,
        isScrolling: true
      });

      lastScrollY = scrollY;
      ticking = false;

      setTimeout(() => {
        setScrollState(prev => ({ ...prev, isScrolling: false }));
      }, 150);
    }, 16);

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scrollState;
}