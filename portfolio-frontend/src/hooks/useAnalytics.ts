// 流量分析React Hook
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PageViewTracker, AutoTracker } from '@/lib/analytics';

/**
 * 自動頁面追蹤Hook
 * 在組件中使用此Hook將自動追蹤頁面瀏覽
 */
export function usePageTracking(title?: string) {
  const pathname = usePathname();

  useEffect(() => {
    // 追蹤頁面瀏覽
    PageViewTracker.startTracking(pathname, title);

    // 清理函數：在組件卸載或路由變化時停止追蹤
    return () => {
      PageViewTracker.stopTracking();
    };
  }, [pathname, title]);
}

/**
 * 自動追蹤Hook
 * 在根組件中使用，自動啟用全域流量追蹤
 */
export function useAutoTracking() {
  useEffect(() => {
    AutoTracker.enable();

    return () => {
      AutoTracker.disable();
    };
  }, []);
}

/**
 * 路由變化追蹤Hook
 * 監聽Next.js路由變化並自動追蹤
 */
export function useRouteTracking() {
  const pathname = usePathname();

  useEffect(() => {
    PageViewTracker.switchPage(pathname, document.title);
  }, [pathname]);
}

export default usePageTracking;