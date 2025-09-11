// 管理後台API功能
import { UserInfo, Project, Skill, Competition, FileData } from '@/types/admin';

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
interface NewsItem {
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// 模擬API調用 - 在本地存儲中保存數據
class AdminApiService {
  private readonly STORAGE_KEYS = {
    USER_INFO: 'portfolio_user_info',
    PROJECTS: 'portfolio_projects',
    SKILLS: 'portfolio_skills',
    COMPETITIONS: 'portfolio_competitions',
    FILES: 'portfolio_files',
    EXPERIENCES: 'portfolio_experiences',
    EDUCATION: 'portfolio_education',
    NEWS: 'portfolio_news'
  };

  // 獲取用戶信息
  async getUserInfo(): Promise<UserInfo> {
    try {
      // 優先讀取本地存儲的最新數據
      const stored = localStorage.getItem(this.STORAGE_KEYS.USER_INFO);
      console.log('localStorage user data:', stored);
      if (stored) {
        const userData = JSON.parse(stored);
        console.log('Parsed localStorage data:', userData);
        return userData;
      }
      
      if (API_BASE_URL) {
        // 如果沒有本地數據且有後端API，從後端獲取
        try {
          console.log('Fetching user data from API:', `${API_BASE_URL}/api/v1/user`);
          const response = await fetch(`${API_BASE_URL}/api/v1/user`);
          console.log('API response status:', response.status, response.ok);
          if (response.ok) {
            const userData = await response.json();
            console.log('API returned user data:', userData);
            // 保存到本地存儲作為緩存
            localStorage.setItem(this.STORAGE_KEYS.USER_INFO, JSON.stringify(userData));
            return userData;
          }
        } catch (apiError) {
          console.log('Backend API failed, using default data:', apiError);
        }
      }
      
      // 返回默認數據
      const defaultData = {
        name: '張智強',
        email: 'changyen26@gmail.com',
        phone: '+886 912 345 678',
        title: '全端開發工程師',
        description: '專精於現代化網頁開發，擁有豐富的前端和後端開發經驗',
        github: 'https://github.com/changyen26',
        linkedin: 'https://linkedin.com/in/changyen',
        avatar: '',
        location: '台灣',
        website: ''
      };
      
      // 保存默認數據到本地存儲
      localStorage.setItem(this.STORAGE_KEYS.USER_INFO, JSON.stringify(defaultData));
      return defaultData;
      
    } catch (error) {
      console.error('Failed to get user info:', error);
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
          console.log('Backend update response:', response.ok);
        } catch (apiError) {
          console.log('Backend API failed, but data saved locally:', apiError);
        }
      }
      
      return true; // 總是返回成功，因為本地存儲已保存
    } catch (error) {
      console.error('Failed to update user info:', error);
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
      console.error('Failed to validate password:', error);
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
      console.error('Failed to get analytics:', error);
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
      console.error('Failed to get recent views:', error);
      return { recentViews: [], total: 0 };
    }
  }

  // 專案管理
  async getProjects(): Promise<Project[]> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/projects`);
        return await response.json();
      } else {
        const stored = localStorage.getItem(this.STORAGE_KEYS.PROJECTS);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      console.error('Failed to get projects:', error);
      return [];
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
        const projects = await this.getProjects();
        projects.push(newProject);
        localStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
        return true;
      }
    } catch (error) {
      console.error('Failed to create project:', error);
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
        const projects = await this.getProjects();
        const index = projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
          projects[index] = project;
          localStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Failed to update project:', error);
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
        const projects = await this.getProjects();
        const filtered = projects.filter(p => p.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
        return true;
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
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
      console.error('Failed to get skills:', error);
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
      console.error('Failed to create skill:', error);
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
      console.error('Failed to update skill:', error);
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
      console.error('Failed to delete skill:', error);
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
      console.error('Failed to upload file:', error);
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
      console.error('Failed to get files:', error);
      return [];
    }
  }

  async getFileById(id: string): Promise<FileData | null> {
    try {
      const files = await this.getFiles();
      return files.find(file => file.id === id) || null;
    } catch (error) {
      console.error('Failed to get file:', error);
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
      console.error('Failed to delete file:', error);
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
          console.error('API Error:', response.status, response.statusText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiData = await response.json();
        console.log('API Response:', apiData);
        
        // 確保 apiData 是陣列
        if (!Array.isArray(apiData)) {
          console.error('Expected array but got:', typeof apiData, apiData);
          return [];
        }
        
        // 將後端數據格式轉換為前端期望的格式
        return apiData.map((comp: {
          id: string;
          name: string;
          result: string;
          date: string;
          description: string;
          certificateUrl?: string;
          category?: string;
          featured?: boolean;
          organizer?: string;
          location?: string;
          award?: string;
          teamSize?: number;
          role?: string;
          technologies?: string[];
          projectUrl?: string;
          createdAt?: string;
        }) => ({
          id: comp.id,
          title: comp.name, // 後端的 name 映射為前端的 title
          result: comp.result,
          date: comp.date,
          description: comp.description,
          certificateUrl: comp.certificateUrl || '',
          category: comp.category || '技術競賽', // 提供預設值
          featured: comp.featured !== false,
          organizer: comp.organizer || '', // 從後端載入實際資料
          location: comp.location || '',
          award: comp.award || '',
          teamSize: comp.teamSize || 1,
          role: comp.role || '',
          technologies: comp.technologies || [],
          projectUrl: comp.projectUrl || '',
          createdAt: comp.createdAt || new Date().toISOString()
        }));
      } else {
        const stored = localStorage.getItem(this.STORAGE_KEYS.COMPETITIONS);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      console.error('Failed to get competitions:', error);
      return [];
    }
  }

  async createCompetition(competition: Omit<Competition, 'id'>): Promise<boolean> {
    try {
      if (API_BASE_URL) {
        // 只發送後端需要的欄位，映射前端和後端的欄位名稱
        const competitionData = {
          name: competition.title || "",  // 前端使用 title，後端期望 name
          result: competition.result || "",
          description: competition.description || "",
          date: competition.date || "",
          certificateUrl: competition.certificateUrl || "",
          category: competition.category || "技術競賽",
          featured: competition.featured !== false
        };

        // 檢查必填欄位
        if (!competitionData.name) {
          console.error('Competition name is required but missing:', competition);
          throw new Error('競賽名稱為必填欄位');
        }

        console.log('Sending competition data to API:', competitionData);
        
        const response = await fetch(`${API_BASE_URL}/api/v1/competitions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(competitionData),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
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
      console.error('Failed to create competition:', error);
      return false;
    }
  }

  async updateCompetition(competition: Competition): Promise<boolean> {
    try {
      if (API_BASE_URL) {
        // 映射前端數據格式到後端期望格式 - 包含所有表單欄位
        const competitionData = {
          name: competition.title || "",
          result: competition.result || "",
          description: competition.description || "",
          date: competition.date || "",
          certificateUrl: competition.certificateUrl || "",
          category: competition.category || "技術競賽",
          featured: competition.featured !== false,
          organizer: competition.organizer || "",
          location: competition.location || "",
          award: competition.award || "",
          teamSize: competition.teamSize || 1,
          role: competition.role || "",
          projectUrl: competition.projectUrl || "",
          technologies: competition.technologies || []
        };

        console.log('Updating competition data:', competitionData);
        
        const response = await fetch(`${API_BASE_URL}/api/v1/competitions/${competition.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(competitionData),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Update competition API Error:', response.status, errorText);
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
      console.error('Failed to update competition:', error);
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
      console.error('Failed to delete competition:', error);
      return false;
    }
  }

  // 新聞管理
  async getNews(): Promise<NewsItem[]> {
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/v1/news`);
        return await response.json();
      } else {
        const stored = localStorage.getItem(this.STORAGE_KEYS.NEWS);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      console.error('Failed to get news:', error);
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
      console.error('Failed to create news:', error);
      return false;
    }
  }

  // 導出數據
  async exportData(): Promise<ExportData> {
    const userInfo = await this.getUserInfo();
    const analytics = await this.getAnalytics();
    const projects = await this.getProjects();
    const skills = await this.getSkills();
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