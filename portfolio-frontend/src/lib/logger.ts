/**
 * 開發環境專用的 Logger 工具
 * 在生產環境中自動屏蔽 console 輸出，保護用戶隱私
 */

// 判斷是否為開發環境
const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  /**
   * 一般信息日誌（僅開發環境）
   */
  log(...args: unknown[]) {
    if (isDevelopment) {
      console.log(...args);
    }
  }

  /**
   * 警告日誌（僅開發環境）
   */
  warn(...args: unknown[]) {
    if (isDevelopment) {
      console.warn(...args);
    }
  }

  /**
   * 錯誤日誌（所有環境，但在生產環境中不顯示敏感信息）
   */
  error(...args: unknown[]) {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // 在生產環境中只記錄基本錯誤信息，不暴露詳細內容
      console.error('發生了一個錯誤');
    }
  }

  /**
   * 調試日誌（僅開發環境）
   */
  debug(...args: unknown[]) {
    if (isDevelopment) {
      console.debug(...args);
    }
  }

  /**
   * 信息日誌（僅開發環境）
   */
  info(...args: unknown[]) {
    if (isDevelopment) {
      console.info(...args);
    }
  }

  /**
   * API 調試（僅開發環境）
   */
  api(method: string, url: string, data?: unknown) {
    if (isDevelopment) {
      console.log(`🌐 ${method.toUpperCase()} ${url}`, data || '');
    }
  }

  /**
   * 數據加載日誌（僅開發環境）
   */
  data(message: string, data?: unknown) {
    if (isDevelopment) {
      console.log(`📊 ${message}`, data || '');
    }
  }

  /**
   * 成功操作日誌（僅開發環境）
   */
  success(message: string, data?: unknown) {
    if (isDevelopment) {
      console.log(`✅ ${message}`, data || '');
    }
  }
}

// 導出單例
export const logger = new Logger();