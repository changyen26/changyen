export interface User {
  id: number;
  name: string;
  title: string;
  email: string;
  phone: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

export interface Patent {
  id: number;
  user_id: number;
  title: string;
  patent_number: string;
  description: string;
  filing_date: string;
  grant_date: string;
  status: 'pending' | 'granted' | 'expired';
  category: string;
  created_at: string;
}

export interface Competition {
  id: string;
  name: string; // 統一使用 name 作為競賽名稱
  description: string;
  organizer: string;
  category: string; // 競賽類別：技術創新、商業競賽、學術競賽等
  date: string;
  location?: string;
  result: string; // 統一使用 result 作為獲獎結果：金牌、銀牌、銅牌等
  teamSize?: number; // 團隊人數
  role?: string; // 在團隊中的角色
  technologies?: string[]; // 使用的技術
  certificateUrl?: string; // 證書連結（保留向後相容）
  certificateFile?: {
    id: string;
    name: string;
    type: string;
    size: number;
    data: string;
    uploadedAt: string;
  }; // 證書文件數據
  projectUrl?: string; // 專案連結
  featured: boolean; // 是否為精選競賽
  createdAt: string;
}

export interface NewsArticle {
  id: number;
  user_id: number;
  headline: string;
  media_outlet: string;
  publication_date: string;
  article_url: string;
  summary: string;
  image_url: string;
  created_at: string;
}

export interface AnimationConfig {
  duration: number;
  delay: number;
  easing: string;
}

export interface ScrollPosition {
  scrollY: number;
  scrollDirection: 'up' | 'down';
}