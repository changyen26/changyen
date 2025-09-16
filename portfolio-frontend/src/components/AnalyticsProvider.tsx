'use client';

import React, { useEffect } from 'react';
import { AutoTracker } from '../lib/analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * 流量分析提供者組件
 * 在應用程式根部使用，自動啟用流量追蹤功能
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    // 只在客戶端啟用自動追蹤
    if (typeof window !== 'undefined') {
      try {
        AutoTracker.enable();
      } catch (error) {
        console.error('Failed to enable analytics tracker:', error);
      }
    }

    // 清理函數
    return () => {
      if (typeof window !== 'undefined') {
        try {
          AutoTracker.disable();
        } catch (error) {
          console.error('Failed to disable analytics tracker:', error);
        }
      }
    };
  }, []);

  // 不使用任何包裹元素，直接返回 children
  return <>{children}</>;
}

export default AnalyticsProvider;