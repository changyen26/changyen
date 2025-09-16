// 管理後台API功能
import { UserInfo, Project, Skill, Competition, Patent, MediaCoverage, FileData } from '../types/admin';
import { logger } from './logger';
// API 響應介面
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 分析數據介面
interface AnalyticsData {
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

// 最近瀏覽記錄介面
interface RecentViewsData {
  recentViews: {
    id: string;
    path: string;
    title: string;
    ipAddress: string;
    userAgent: string;
    referer: string;
    sessionId: string;
    visitTime: string;
    viewDuration: number;
  }[];
  total: number;
}

// 新聞介面
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  publishedAt: string;
  tags?: string[];
  featured?: boolean;
  imageUrl?: string;
  createdAt: string;
}

// 導出數據介面
interface ExportData {
  userInfo: UserInfo;
  analytics: AnalyticsData;
  projects: Project[];
  skills: Skill[];
  competitions: Competition[];
  news: NewsItem[];
  exportedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// 模擬API調用 - 在本地存儲中保存數據
class AdminApiService {
  private readonly STORAGE_KEYS = {
    USER_INFO: 'portfolio_user_info',
    PROJECTS: 'portfolio_projects',
    SKILLS: 'portfolio_skills',
    COMPETITIONS: 'portfolio_competitions',
    PATENTS: 'portfolio_patents',
    MEDIA_COVERAGE: 'portfolio_media_coverage',
    FILES: 'portfolio_files',
    EXPERIENCES: 'portfolio_experiences',
    EDUCATION: 'portfolio_education',
    NEWS: 'portfolio_news'
  };

  // 獲取用戶信息
  async getUserInfo(): Promise<UserInfo> {
    try {
      // 優先從 API 獲取最新資料，確保資料同步
      if (API_BASE_URL) {
        try {
          logger.log('Fetching user data from API:', `${API_BASE_URL}/api/v1/user`);
          const response = await fetch(`${API_BASE_URL}/api/v1/user`, {
            // 添加快取破壞機制
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          logger.log('API response status:', response.status, response.ok);
          if (response.ok) {
            const userData = await response.json();
            logger.log('API returned user data:', userData);
            // 保存到本地存儲作為緩存
            localStorage.setItem(this.STORAGE_KEYS.USER_INFO, JSON.stringify(userData));
            return userData;
          }
        } catch (apiError) {
          logger.log('Backend API failed, fallback to localStorage or default data:', apiError);
        }
      }
      
      // API 失敗時，嘗試從 localStorage 讀取快取資料
      const stored = localStorage.getItem(this.STORAGE_KEYS.USER_INFO);
      logger.log('Fallback to localStorage user data:', stored);
      if (stored) {
        try {
          const userData = JSON.parse(stored);
          logger.log('Using cached localStorage data:', userData);
          return userData;
        } catch (parseError) {
          logger.error('Failed to parse localStorage data:', parseError);
        }
      }
      
      // 返回默認數據 (僅在 API 完全失效時使用)
      const defaultData = {
        name: '載入中...',
        email: '載入中...',
        phone: '載入中...',
        title: '載入中...',
        description: '載入中...',
        github: '載入中...',
        linkedin: '載入中...',
        avatar: '',
        location: '台灣',
        website: ''
      };
      
      // 保存默認數據到本地存儲
      localStorage.setItem(this.STORAGE_KEYS.USER_INFO, JSON.stringify(defaultData));
      return defaultData;
      
    } catch (error) {
      logger.error('Failed to get user info:', error);
      throw error;
    }
  }

  // 更新用戶信息
  async updateUserInfo(userInfo: UserInfo): Promise<boolean> {
    try {
      // 總是保存到本地存儲作為緩存
      localStorage.setItem(this.STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
      
      if (API_BASE_URL) {
        // 嘗試發送到後端API（即使失敗也返回成功，因為已經保存到本地）
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/user/update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userInfo),
          });
          logger.log('Backend update response:', response.ok);
        } catch (apiError) {
          logger.log('Backend API failed, but data saved locally:', apiError);
        }
      }
      
      return true; // 總是返回成功，因為本地存儲已保存
    } catch (error) {
      logger.error('Failed to update user info:', error);
      return false;
    }
  }

  // 驗證管理員密碼
  async validatePassword(password: string): Promise<boolean> {
    try {
      if (API_BASE_URL) {
        // 如果有後端API，使用後端驗證
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        });
        return response.ok;
      } else {
        // 沒有後端時使用簡單的硬編碼密碼
        return password === 'admin123';
      }
    } catch (error) {
      logger.error('Failed to validate password:', error);
      return false;
    }
  }

  // 獲取網站統計數據
  async getAnalytics(days: number = 30): Promise<AnalyticsData> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/analytics/stats?days=${days}`);
        if (response.ok) {
          return await response.json();
        }
      }
      
      // 如果API不可用，返回模擬數據
      return {
          pageViews: 1250,
          uniqueVisitors: 890,
          averageTimeOnSite: '2m 45s',
          topPages: [
            { path: '/', views: 650 },
            { path: '/about', views: 320 },
            { path: '/projects', views: 280 }
          ],
          referrers: [
            { source: 'google.com', visits: 450 },
            { source: 'linkedin.com', visits: 180 },
            { source: 'github.com', visits: 120 }
          ]
        };
    } catch (error) {
      logger.error('Failed to get analytics:', error);
      throw error;
    }
  }

  // 獲取最近瀏覽記錄
  async getRecentViews(limit: number = 50): Promise<RecentViewsData> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/analytics/recent?limit=${limit}`);
        if (response.ok) {
          return await response.json();
        }
      }
      
      // 如果API不可用，返回模擬數據
      return {
        recentViews: [
          {
            id: '1',
            path: '/',
            title: '首頁',
            ipAddress: '127.0.0.1',
            userAgent: 'Chrome',
            referer: '',
            sessionId: 'session-1',
            visitTime: new Date().toISOString(),
            viewDuration: 120
          }
        ],
        total: 1
      };
    } catch (error) {
      logger.error('Failed to get recent views:', error);
      return { recentViews: [], total: 0 };
    }
  }

  // 專案管理
  async getProjects(): Promise<ApiResponse<Project[]>> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/projects`);
        if (response.ok) {
          const data = await response.json();
          return { success: true, data };
        } else {
          const error = await response.text();
          logger.error("Failed to fetch projects from API:", error);
          return { success: false, error: `API 錯誤: ${response.status}` };
        }
      } else {
        const stored = localStorage.getItem(this.STORAGE_KEYS.PROJECTS);
        const data = stored ? JSON.parse(stored) : [];
        return { success: true, data };
      }
    } catch (error) {
      logger.error("Failed to get projects:", error);
      return { success: false, error: "載入專案資料失敗" };
    }

  }
  async createProject(project: Omit<Project, 'id'>): Promise<boolean> {
    try {
      const newProject = {
        ...project,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProject),
        });
        return response.ok;
      } else {
        const projectsResponse = await this.getProjects();
        if (!projectsResponse.success || !projectsResponse.data) return false;
        projectsResponse.data.push(newProject);
        localStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(projectsResponse.data));
        return true;
      }
    } catch (error) {
      logger.error('Failed to create project:', error);
      return false;
    }
  }

  async updateProject(project: Project): Promise<boolean> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/projects/${project.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(project),
        });
        return response.ok;
      } else {
        const projectsResponse = await this.getProjects();        if (!projectsResponse.success || !projectsResponse.data) return false;        const index = projectsResponse.data.findIndex(p => p.id === project.id);        if (index !== -1) {          projectsResponse.data[index] = project;          localStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(projectsResponse.data));
          return true;
        }
        return false;
      }
    } catch (error) {
      logger.error('Failed to update project:', error);
      return false;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/projects/${id}`, {
          method: 'DELETE',
        });
        return response.ok;
      } else {
        const projectsResponse = await this.getProjects();        if (!projectsResponse.success || !projectsResponse.data) return false;        const filtered = projectsResponse.data.filter(p => p.id !== id);        localStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
        return true;
      }
    } catch (error) {
      logger.error('Failed to delete project:', error);
      return false;
    }
  }

  // 技能管理
  async getSkills(): Promise<Skill[]> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/skills`);
        return await response.json();
      } else {
        const stored = localStorage.getItem(this.STORAGE_KEYS.SKILLS);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      logger.error('Failed to get skills:', error);
      return [];
    }
  }

  async createSkill(skill: Omit<Skill, 'id'>): Promise<boolean> {
    try {
      const newSkill = {
        ...skill,
        id: Date.now().toString()
      };

      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/skills`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSkill),
        });
        return response.ok;
      } else {
        const skills = await this.getSkills();
        skills.push(newSkill);
        localStorage.setItem(this.STORAGE_KEYS.SKILLS, JSON.stringify(skills));
        return true;
      }
    } catch (error) {
      logger.error('Failed to create skill:', error);
      return false;
    }
  }

  async updateSkill(skill: Skill): Promise<boolean> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/skills/${skill.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(skill),
        });
        return response.ok;
      } else {
        const skills = await this.getSkills();
        const index = skills.findIndex(s => s.id === skill.id);
        if (index !== -1) {
          skills[index] = skill;
          localStorage.setItem(this.STORAGE_KEYS.SKILLS, JSON.stringify(skills));
          return true;
        }
        return false;
      }
    } catch (error) {
      logger.error('Failed to update skill:', error);
      return false;
    }
  }

  async deleteSkill(id: string): Promise<boolean> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/skills/${id}`, {
          method: 'DELETE',
        });
        return response.ok;
      } else {
        const skills = await this.getSkills();
        const filtered = skills.filter(s => s.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.SKILLS, JSON.stringify(filtered));
        return true;
      }
    } catch (error) {
      logger.error('Failed to delete skill:', error);
      return false;
    }
  }

  // ===== 專利管理 =====
  async getPatents(): Promise<Patent[]> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/patents`);
        if (response.ok) {
          return await response.json();
        }
        return [];
      } else {
        const stored = localStorage.getItem(this.STORAGE_KEYS.PATENTS);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      logger.error('Failed to fetch patents:', error);
      return [];
    }
  }

  async createPatent(patent: Partial<Patent>): Promise<Patent | null> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/patents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patent),
        });
        if (response.ok) {
          return await response.json();
        }
        return null;
      } else {
        const newPatent: Patent = {
          id: Date.now().toString(),
          title: patent.title || '',
          patentNumber: patent.patentNumber,
          description: patent.description,
          category: patent.category || '發明專利',
          status: patent.status || '審查中',
          filingDate: patent.filingDate,
          grantDate: patent.grantDate,
          publicationDate: patent.publicationDate,
          inventors: patent.inventors || [],
          assignee: patent.assignee,
          country: patent.country || '台灣',
          patentUrl: patent.patentUrl,
          priorityDate: patent.priorityDate,
          classification: patent.classification,
          featured: patent.featured || false,
          createdAt: new Date().toISOString(),
        };

        const patents = await this.getPatents();
        patents.push(newPatent);
        localStorage.setItem('patents', JSON.stringify(patents));
        return newPatent;
      }
    } catch (error) {
      logger.error('Failed to create patent:', error);
      return null;
    }
  }

  async updatePatent(id: string, patent: Partial<Patent>): Promise<Patent | null> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/patents/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patent),
        });
        if (response.ok) {
          return await response.json();
        }
        return null;
      } else {
        const patents = await this.getPatents();
        const index = patents.findIndex(p => p.id === id);
        if (index !== -1) {
          patents[index] = { ...patents[index], ...patent };
          localStorage.setItem('patents', JSON.stringify(patents));
          return patents[index];
        }
        return null;
      }
    } catch (error) {
      logger.error('Failed to update patent:', error);
      return null;
    }
  }

  async deletePatent(id: string): Promise<boolean> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/patents/${id}`, {
          method: 'DELETE',
        });
        return response.ok;
      } else {
        const patents = await this.getPatents();
        const filtered = patents.filter(p => p.id !== id);
        localStorage.setItem('patents', JSON.stringify(filtered));
        return true;
      }
    } catch (error) {
      logger.error('Failed to delete patent:', error);
      return false;
    }
  }

  // ===== 媒體報導管理 =====
  async getMediaCoverage(): Promise<MediaCoverage[]> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/media-coverage`);
        if (response.ok) {
          return await response.json();
        }
        return [];
      } else {
        const stored = localStorage.getItem(this.STORAGE_KEYS.MEDIA_COVERAGE);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      logger.error('Failed to fetch media coverage:', error);
      return [];
    }
  }

  async createMediaCoverage(mediaCoverage: Partial<MediaCoverage>): Promise<MediaCoverage | null> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/media-coverage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mediaCoverage),
        });
        if (response.ok) {
          return await response.json();
        }
        return null;
      } else {
        const newMediaCoverage: MediaCoverage = {
          id: Date.now().toString(),
          title: mediaCoverage.title || '',
          mediaName: mediaCoverage.mediaName || '',
          summary: mediaCoverage.summary,
          url: mediaCoverage.url,
          imageUrl: mediaCoverage.imageUrl,
          mediaType: mediaCoverage.mediaType || '媒體報導',
          author: mediaCoverage.author,
          content: mediaCoverage.content,
          publicationDate: mediaCoverage.publicationDate,
          featured: mediaCoverage.featured || false,
          tags: mediaCoverage.tags || [],
          createdAt: new Date().toISOString(),
        };

        const mediaList = await this.getMediaCoverage();
        mediaList.push(newMediaCoverage);
        localStorage.setItem(this.STORAGE_KEYS.MEDIA_COVERAGE, JSON.stringify(mediaList));
        return newMediaCoverage;
      }
    } catch (error) {
      logger.error('Failed to create media coverage:', error);
      return null;
    }
  }

  async updateMediaCoverage(id: string, mediaCoverage: Partial<MediaCoverage>): Promise<MediaCoverage | null> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/media-coverage/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mediaCoverage),
        });
        if (response.ok) {
          return await response.json();
        }
        return null;
      } else {
        const mediaList = await this.getMediaCoverage();
        const index = mediaList.findIndex(m => m.id === id);
        if (index !== -1) {
          mediaList[index] = { ...mediaList[index], ...mediaCoverage };
          localStorage.setItem(this.STORAGE_KEYS.MEDIA_COVERAGE, JSON.stringify(mediaList));
          return mediaList[index];
        }
        return null;
      }
    } catch (error) {
      logger.error('Failed to update media coverage:', error);
      return null;
    }
  }

  async deleteMediaCoverage(id: string): Promise<boolean> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/media-coverage/${id}`, {
          method: 'DELETE',
        });
        return response.ok;
      } else {
        const mediaList = await this.getMediaCoverage();
        const filtered = mediaList.filter(m => m.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.MEDIA_COVERAGE, JSON.stringify(filtered));
        return true;
      }
    } catch (error) {
      logger.error('Failed to delete media coverage:', error);
      return false;
    }
  }

  // 文件管理
  async uploadFile(file: File): Promise<FileData | null> {
    try {
      if (!file) return null;

      // 檢查文件大小 (限制5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('文件大小超過5MB限制');
      }

      // 檢查文件類型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('不支援的文件類型');
      }

      // 轉換為Base64
      const base64Data = await this.fileToBase64(file);

      const fileData: FileData = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64Data,
        uploadedAt: new Date().toISOString()
      };

      if (API_BASE_URL) {
        // 如果有後端API，發送到後端
        const response = await fetch(`${API_BASE_URL}/api/v1/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fileData),
        });
        if (response.ok) {
          return await response.json();
        }
        throw new Error('上傳失敗');
      } else {
        // 存儲到本地
        const files = await this.getFiles();
        files.push(fileData);
        localStorage.setItem(this.STORAGE_KEYS.FILES, JSON.stringify(files));
        return fileData;
      }
    } catch (error) {
      logger.error('Failed to upload file:', error);
      throw error;
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // 移除 "data:mime/type;base64," 前綴
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async getFiles(): Promise<FileData[]> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/files`);
        return await response.json();
      } else {
        const stored = localStorage.getItem(this.STORAGE_KEYS.FILES);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      logger.error('Failed to get files:', error);
      return [];
    }
  }

  async getFileById(id: string): Promise<FileData | null> {
    try {
      const files = await this.getFiles();
      return files.find(file => file.id === id) || null;
    } catch (error) {
      logger.error('Failed to get file:', error);
      return null;
    }
  }

  async deleteFile(id: string): Promise<boolean> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/files/${id}`, {
          method: 'DELETE',
        });
        return response.ok;
      } else {
        const files = await this.getFiles();
        const filtered = files.filter(file => file.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.FILES, JSON.stringify(filtered));
        return true;
      }
    } catch (error) {
      logger.error('Failed to delete file:', error);
      return false;
    }
  }

  // 獲取文件的完整數據URL（用於顯示）
  getFileDataUrl(fileData: FileData): string {
    return `data:${fileData.type};base64,${fileData.data}`;
  }

  // 競賽管理
  async getCompetitions(): Promise<Competition[]> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/competitions`);

        if (!response.ok) {
          logger.error('API Error:', response.status, response.statusText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const apiData = await response.json();

        // 確保 apiData 是陣列
        if (!Array.isArray(apiData)) {
          logger.error('Expected array but got:', typeof apiData, apiData);
          return [];
        }
        
        // 將後端數據格式轉換為前端期望的格式
        return apiData.map((comp: {
          id: string;
          name: string;
          result: string;
          date: string;
          description: string;
          detailedDescription?: string;
          certificateUrl?: string;
          category?: string;
          featured?: boolean;
          organizer?: string;
          location?: string;
          teamSize?: number;
          role?: string;
          technologies?: string[];
          projectUrl?: string;
          projectImages?: string[];
          createdAt?: string;
        }) => ({
          id: comp.id,
          name: comp.name, // 後端的 name 映射為前端的 name
          result: comp.result,
          date: comp.date,
          description: comp.description,
          detailedDescription: comp.detailedDescription || undefined,
          certificateUrl: comp.certificateUrl || '',
          category: comp.category || '技術競賽', // 提供預設值
          featured: comp.featured !== false,
          organizer: comp.organizer || '', // 從後端載入實際資料
          location: comp.location || '',
          teamSize: comp.teamSize || 1,
          role: comp.role || '',
          technologies: comp.technologies || [],
          projectUrl: comp.projectUrl || '',
          projectImages: comp.projectImages || [], // 修復：加入 projectImages 處理
          createdAt: comp.createdAt || new Date().toISOString()
        }));
      } else {
        const stored = localStorage.getItem(this.STORAGE_KEYS.COMPETITIONS);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      logger.error('Failed to get competitions:', error);
      return [];
    }
  }

  async createCompetition(competition: Omit<Competition, 'id'>): Promise<boolean> {
    try {
      if (API_BASE_URL) {
        // 只發送後端需要的欄位，映射前端和後端的欄位名稱
        const competitionData = {
          name: competition.name || "",  // 前端使用 name，後端期望 name
          result: competition.result || "",
          description: competition.description || "",
          detailedDescription: competition.detailedDescription || "",
          date: competition.date || "",
          certificateUrl: competition.certificateUrl || "",
          category: competition.category || "技術競賽",
          featured: competition.featured !== false,
          organizer: competition.organizer || "",
          location: competition.location || "",
          teamSize: competition.teamSize || 1,
          role: competition.role || "",
          projectUrl: competition.projectUrl || "",
          technologies: competition.technologies || [],
          projectImages: competition.projectImages || []  // 修復：加入 projectImages 欄位
        };

        // 檢查必填欄位
        if (!competitionData.name) {
          logger.error('Competition name is required but missing:', competition);
          throw new Error('競賽名稱為必填欄位');
        }

        logger.log('Sending competition data to API:', competitionData);
        
        const response = await fetch(`${API_BASE_URL}/api/v1/competitions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(competitionData),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          logger.error('API Error:', response.status, errorText);
          throw new Error(`API Error: ${response.status}`);
        }
        
        return true;
      } else {
        // localStorage 存儲時才需要 id 和 createdAt
        const newCompetition = {
          ...competition,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        
        const competitions = await this.getCompetitions();
        competitions.push(newCompetition);
        localStorage.setItem(this.STORAGE_KEYS.COMPETITIONS, JSON.stringify(competitions));
        return true;
      }
    } catch (error) {
      logger.error('Failed to create competition:', error);
      return false;
    }
  }

  async updateCompetition(competition: Competition): Promise<boolean> {
    try {
      if (API_BASE_URL) {
        // 映射前端數據格式到後端期望格式 - 包含所有表單欄位
        const competitionData = {
          name: competition.name || "",  // 修復：使用 name 而不是 title
          result: competition.result || "",
          description: competition.description || "",
          detailedDescription: competition.detailedDescription || "",
          date: competition.date || "",
          certificateUrl: competition.certificateUrl || "",
          category: competition.category || "技術競賽",
          featured: competition.featured !== false,
          organizer: competition.organizer || "",
          location: competition.location || "",
          teamSize: competition.teamSize || 1,
          role: competition.role || "",
          projectUrl: competition.projectUrl || "",
          technologies: competition.technologies || [],
          projectImages: competition.projectImages || []  // 修復：加入 projectImages 欄位
        };

        logger.log('Updating competition data:', competitionData);
        
        const response = await fetch(`${API_BASE_URL}/api/v1/competitions/${competition.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(competitionData),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          logger.error('Update competition API Error:', response.status, errorText);
        }
        
        return response.ok;
      } else {
        const competitions = await this.getCompetitions();
        const index = competitions.findIndex(c => c.id === competition.id);
        if (index !== -1) {
          competitions[index] = competition;
          localStorage.setItem(this.STORAGE_KEYS.COMPETITIONS, JSON.stringify(competitions));
          return true;
        }
        return false;
      }
    } catch (error) {
      logger.error('Failed to update competition:', error);
      return false;
    }
  }

  async deleteCompetition(id: string): Promise<boolean> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/competitions/${id}`, {
          method: 'DELETE',
        });
        return response.ok;
      } else {
        const competitions = await this.getCompetitions();
        const filtered = competitions.filter(c => c.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.COMPETITIONS, JSON.stringify(filtered));
        return true;
      }
    } catch (error) {
      logger.error('Failed to delete competition:', error);
      return false;
    }
  }

  // 新聞管理
  // About Values 管理
  async getAboutValues(): Promise<any[]> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/about-values`);
        if (response.ok) {
          return await response.json();
        }
      }
      return [];
    } catch (error) {
      logger.error('Failed to fetch about values:', error);
      return [];
    }
  }

  async createAboutValue(data: any): Promise<boolean> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/about-values`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return response.ok;
      }
      return false;
    } catch (error) {
      logger.error('Failed to create about value:', error);
      return false;
    }
  }

  async updateAboutValue(id: string, data: any): Promise<boolean> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/about-values/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return response.ok;
      }
      return false;
    } catch (error) {
      logger.error('Failed to update about value:', error);
      return false;
    }
  }

  async deleteAboutValue(id: string): Promise<boolean> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/about-values/${id}`, {
          method: 'DELETE',
        });
        return response.ok;
      }
      return false;
    } catch (error) {
      logger.error('Failed to delete about value:', error);
      return false;
    }
  }

  async reorderAboutValues(orderedIds: string[]): Promise<boolean> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/about-values/reorder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderedIds }),
        });
        return response.ok;
      }
      return false;
    } catch (error) {
      logger.error('Failed to reorder about values:', error);
      return false;
    }
  }  async getNews(): Promise<NewsItem[]> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/news`);
        return await response.json();
      } else {
        const stored = localStorage.getItem(this.STORAGE_KEYS.NEWS);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      logger.error('Failed to get news:', error);
      return [];
    }
  }

  async createNews(news: Omit<NewsItem, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      const newNews = {
        ...news,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/news`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newNews),
        });
        return response.ok;
      } else {
        const newsData = await this.getNews();
        newsData.push(newNews);
        localStorage.setItem(this.STORAGE_KEYS.NEWS, JSON.stringify(newsData));
        return true;
      }
    } catch (error) {
      logger.error('Failed to create news:', error);
      return false;
    }
  }

  // 導出數據
  async exportData(): Promise<ExportData> {
    const userInfo = await this.getUserInfo();
    const analytics = await this.getAnalytics();
    const projectsResponse = await this.getProjects();    const projects = projectsResponse.success && projectsResponse.data ? projectsResponse.data : [];    const skills = await this.getSkills();
    const competitions = await this.getCompetitions();
    const news = await this.getNews();
    
    return {
      userInfo,
      analytics,
      projects,
      skills,
      competitions,
      news,
      exportedAt: new Date().toISOString()
    };
  }
}

export const adminApi = new AdminApiService();