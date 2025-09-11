// 流量分析工具
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// 會話管理
class SessionManager {
  private static sessionId: string | null = null;
  private static readonly SESSION_KEY = 'portfolio_session_id';

  static getSessionId(): string {
    if (this.sessionId) {
      return this.sessionId;
    }

    // 嘗試從localStorage獲取現有會話ID
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (stored) {
        this.sessionId = stored;
        return stored;
      }
    }

    // 創建新的會話ID
    this.sessionId = uuidv4();
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_KEY, this.sessionId);
    }

    return this.sessionId;
  }

  static renewSession(): string {
    this.sessionId = uuidv4();
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_KEY, this.sessionId);
    }
    return this.sessionId;
  }
}

// 頁面追蹤資料介面
export interface PageTrackingData {
  path: string;
  title?: string;
  sessionId?: string;
  referrer?: string;
}

// 分析統計資料介面
export interface AnalyticsStats {
  pageViews: number;
  uniqueVisitors: number;
  averageTimeOnSite: string;
  topPages: Array<{
    path: string;
    title: string;
    views: number;
  }>;
  referrers: Array<{
    source: string;
    visits: number;
  }>;
  browsers: Array<{
    name: string;
    count: number;
  }>;
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
}

// 最近瀏覽記錄介面
export interface RecentView {
  id: string;
  path: string;
  title: string;
  ipAddress: string;
  userAgent: string;
  referer: string;
  sessionId: string;
  visitTime: string;
  viewDuration: number;
}

export interface RecentViewsResponse {
  recentViews: RecentView[];
  total: number;
}

class AnalyticsAPI {
  /**
   * 記錄頁面瀏覽
   */
  static async trackPageView(data: PageTrackingData): Promise<void> {
    try {
      const sessionId = SessionManager.getSessionId();
      
      const trackingData = {
        path: data.path,
        title: data.title || document.title || '',
        sessionId: data.sessionId || sessionId,
        referrer: data.referrer || document.referrer || ''
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      logger.log('📊 頁面瀏覽記錄成功:', result);
    } catch (error) {
      logger.error('❌ 頁面瀏覽記錄失敗:', error);
      // 不要拋出錯誤，以免影響使用者體驗
    }
  }

  /**
   * 獲取分析統計數據
   */
  static async getStats(days: number = 30): Promise<AnalyticsStats> {
    const response = await fetch(`${API_BASE_URL}/api/v1/analytics/stats?days=${days}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`取得分析數據失敗: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 獲取最近的瀏覽記錄
   */
  static async getRecentViews(limit: number = 50): Promise<RecentViewsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/analytics/recent?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`取得最近瀏覽記錄失敗: ${response.status}`);
    }

    return response.json();
  }
}

// 頁面瀏覽追蹤Hook
export class PageViewTracker {
  private static startTime: number = 0;
  private static currentPath: string = '';

  /**
   * 開始追蹤頁面
   */
  static startTracking(path: string, title?: string): void {
    this.startTime = Date.now();
    this.currentPath = path;
    
    // 記錄頁面瀏覽
    AnalyticsAPI.trackPageView({
      path,
      title
    });
  }

  /**
   * 停止追蹤頁面 (可用於記錄停留時間)
   */
  static stopTracking(): void {
    if (this.startTime > 0) {
      const duration = Math.round((Date.now() - this.startTime) / 1000);
      logger.log(`📊 頁面停留時間: ${duration}秒`, this.currentPath);
      this.startTime = 0;
      this.currentPath = '';
    }
  }

  /**
   * 切換頁面時的處理
   */
  static switchPage(newPath: string, newTitle?: string): void {
    this.stopTracking();
    this.startTracking(newPath, newTitle);
  }
}

// 自動追蹤功能
export class AutoTracker {
  private static isEnabled: boolean = false;

  /**
   * 啟用自動追蹤
   */
  static enable(): void {
    if (typeof window === 'undefined' || this.isEnabled) {
      return;
    }

    this.isEnabled = true;

    // 追蹤初始頁面
    PageViewTracker.startTracking(
      window.location.pathname + window.location.search,
      document.title
    );

    // 監聽頁面卸載事件
    window.addEventListener('beforeunload', () => {
      PageViewTracker.stopTracking();
    });

    // 監聽頁面可見性變化
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        PageViewTracker.stopTracking();
      } else if (document.visibilityState === 'visible') {
        PageViewTracker.startTracking(
          window.location.pathname + window.location.search,
          document.title
        );
      }
    });

    logger.log('📊 自動流量追蹤已啟用');
  }

  /**
   * 停用自動追蹤
   */
  static disable(): void {
    this.isEnabled = false;
    PageViewTracker.stopTracking();
    logger.log('📊 自動流量追蹤已停用');
  }
}

export { AnalyticsAPI, SessionManager };
export default AnalyticsAPI;