import { User, Patent, NewsArticle } from '@/types';
import { Competition } from '@/types/admin';

export const mockUser: User = {
  id: 1,
  name: "謝長諺",
  title: "創新研發工程師 & 競賽達人",
  email: "zhangzhiqiang@email.com",
  phone: "+886 912-345-678",
  bio: "專精於人工智能與機器學習領域的研發工程師，擁有多項專利發明及國際競賽獲獎經驗。致力於將創新技術應用於實際解決方案中，推動科技進步與社會發展。",
  avatar_url: "/images/avatar.jpg",
  created_at: "2023-01-01T00:00:00Z"
};

export const mockPatents: Patent[] = [
  {
    id: 1,
    user_id: 1,
    title: "基於深度學習的影像辨識系統及其方法",
    patent_number: "TW-I765432",
    description: "一種創新的影像辨識系統，結合卷積神經網路與注意力機制，提升辨識準確率達95%以上。",
    filing_date: "2022-03-15",
    grant_date: "2023-08-20",
    status: "granted",
    category: "人工智能",
    created_at: "2022-03-15T09:00:00Z"
  },
  {
    id: 2,
    user_id: 1,
    title: "智慧物聯網感測器網路架構",
    patent_number: "TW-I789012",
    description: "創新的物聯網感測器網路設計，具備自適應通訊協定與低功耗特性。",
    filing_date: "2022-07-10",
    grant_date: "2024-01-15",
    status: "granted",
    category: "物聯網",
    created_at: "2022-07-10T14:30:00Z"
  },
  {
    id: 3,
    user_id: 1,
    title: "區塊鏈去中心化身份驗證系統",
    patent_number: "TW-A123456",
    description: "基於區塊鏈技術的身份驗證系統，提供安全且高效的去中心化認證機制。",
    filing_date: "2023-02-20",
    grant_date: "",
    status: "pending",
    category: "區塊鏈",
    created_at: "2023-02-20T11:15:00Z"
  }
];

export const mockCompetitions: Competition[] = [
  {
    id: "1",
    name: "國際人工智能創新競賽 IAIC 2023",
    description: "以『智慧醫療診斷輔助系統』獲得國際人工智能創新競賽金獎，該系統能協助醫師提升診斷準確率30%。",
    organizer: "國際人工智能學會",
    category: "AI/機器學習",
    date: "2023-09-15",
    location: "台北",
    result: "金牌",
    teamSize: 4,
    role: "技術負責人",
    technologies: ["Python", "TensorFlow", "OpenCV"],
    certificateUrl: "/certificates/iaic-2023.pdf",
    projectUrl: "",
    featured: true,
    createdAt: "2023-09-15T16:00:00Z"
  },
  {
    id: "2",
    name: "全球物聯網創新挑戰賽 IoT Challenge",
    description: "開發智慧農業監控系統，整合多種感測器實現精準農業管理，獲得評審一致好評。",
    organizer: "國際物聯網協會",
    category: "IoT/物聯網",
    date: "2022-11-28",
    location: "新竹",
    result: "銀牌",
    teamSize: 3,
    role: "隊長",
    technologies: ["Arduino", "Python", "MQTT"],
    certificateUrl: "/certificates/iot-challenge.pdf",
    projectUrl: "",
    featured: true,
    createdAt: "2022-11-28T10:30:00Z"
  },
  {
    id: "3",
    name: "亞洲機器學習競賽 AMLC 2024",
    description: "運用先進的深度學習技術解決複雜的電腦視覺問題，展現優秀的技術實力。",
    organizer: "亞洲機器學習學會",
    category: "AI/機器學習",
    date: "2024-05-20",
    location: "線上競賽",
    result: "優選",
    teamSize: 2,
    role: "演算法工程師",
    technologies: ["Python", "PyTorch", "Computer Vision"],
    certificateUrl: "/certificates/amlc-2024.pdf",
    projectUrl: "",
    featured: false,
    createdAt: "2024-05-20T15:45:00Z"
  }
];

export const mockNews: NewsArticle[] = [
  {
    id: 1,
    user_id: 1,
    headline: "年輕工程師獲國際AI競賽金獎，創新醫療技術受矚目",
    media_outlet: "科技新報",
    publication_date: "2023-09-20",
    article_url: "https://technews.tw/2023/09/20/young-engineer-ai-award/",
    summary: "張智強以創新的智慧醫療診斷輔助系統獲得IAIC 2023金獎，該技術有望革新醫療診斷流程...",
    image_url: "/images/news-1.jpg",
    created_at: "2023-09-20T08:00:00Z"
  },
  {
    id: 2,
    user_id: 1,
    headline: "台灣之光！本土研發專利技術領先國際",
    media_outlet: "經濟日報",
    publication_date: "2023-08-25",
    article_url: "https://money.udn.com/money/story/5612/taiwan-patent-innovation",
    summary: "在人工智能影像辨識領域，台灣年輕研發人員張智強的專利技術獲得國際認可，辨識準確率突破95%...",
    image_url: "/images/news-2.jpg",
    created_at: "2023-08-25T14:20:00Z"
  },
  {
    id: 3,
    user_id: 1,
    headline: "物聯網創新應用，智慧農業系統獲國際獎項",
    media_outlet: "農業週刊",
    publication_date: "2022-12-05",
    article_url: "https://agriweek.com/2022/12/05/iot-smart-farming-award/",
    summary: "結合物聯網與人工智能技術的智慧農業監控系統，幫助農民提升作物產量20%，獲得國際競賽肯定...",
    image_url: "/images/news-3.jpg",
    created_at: "2022-12-05T11:30:00Z"
  }
];