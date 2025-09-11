'use client';

import React from 'react';
import { useAutoTracking } from '@/hooks/useAnalytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * 流量分析提供者組件
 * 在應用程式根部使用，自動啟用流量追蹤功能
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // 啟用自動追蹤
  useAutoTracking();

  return <>{children}</>;
}

export default AnalyticsProvider;