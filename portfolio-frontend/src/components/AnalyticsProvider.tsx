'use client';

import React, { useEffect } from 'react';
import { initAnalytics } from '../lib/analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * 流量分析提供者組件
 * 在應用程式根部使用，自動啟用流量追蹤功能
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    // 只在客戶端初始化分析
    if (typeof window !== 'undefined') {
      initAnalytics();
    }
  }, []);

  // 不使用任何包裹元素，直接返回 children
  return <>{children}</>;
}

export default AnalyticsProvider;