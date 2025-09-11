// 管理後台相關類型定義

export interface UserInfo {
  name: string;
  email: string;
  phone: string;
  title: string;
  description: string;
  github: string;
  linkedin: string;
  avatar?: string;
  location?: string;
  website?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 0-100
  category: string;
  icon?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  location?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  publishedAt?: string;
  tags: string[];
  featured: boolean;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  organizer: string;
  category: string; // 競賽類別：技術創新、商業競賽、學術競賽等
  date: string;
  location?: string;
  result: string; // 獲獎結果：冠軍、亞軍、優選等
  award?: string; // 獎項名稱
  teamSize?: number; // 團隊人數
  role?: string; // 在團隊中的角色
  technologies?: string[]; // 使用的技術
  certificateUrl?: string; // 證書連結（保留向後相容）
  certificateFile?: FileData; // 證書文件數據
  projectUrl?: string; // 專案連結
  featured: boolean; // 是否為精選競賽
  createdAt: string;
}

export interface Patent {
  id: string;
  title: string;
  patentNumber?: string; // 專利號碼
  description?: string;
  category: string; // 專利類型：發明專利、新型專利、外觀設計專利
  status: string; // 狀態：審查中、已核准、已公開、已駁回
  filingDate?: string; // 申請日期
  grantDate?: string; // 核准日期
  publicationDate?: string; // 公開日期
  inventors?: string[]; // 發明人
  assignee?: string; // 專利權人
  country: string; // 申請國家
  patentUrl?: string; // 專利文件連結
  priorityDate?: string; // 優先權日期
  classification?: string; // 國際分類號
  featured: boolean; // 是否為精選專利
  createdAt?: string;
}

export interface FileData {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64 編碼的文件數據
  uploadedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email: string;
  };
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-TW' | 'en-US';
}

export interface Analytics {
  pageViews: number;
  uniqueVisitors: number;
  averageTimeOnSite: string;
  topPages: {
    path: string;
    views: number;
  }[];
  referrers: {
    source: string;
    visits: number;
  }[];
  browsers?: {
    name: string;
    count: number;
    percentage: string;
  }[];
}