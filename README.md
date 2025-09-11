# 個人履歷展示網站

一個現代化的個人履歷展示網站，具備Apple風格的動畫效果和專業的前後端分離架構。

## 🌟 項目特色

- ✨ **Apple風格動畫** - 打字機效果、磁性交互、視差滾動
- 🎨 **現代化設計** - 玻璃態美學、響應式布局  
- 🚀 **高性能架構** - Next.js + FastAPI + MySQL
- 📱 **完全響應式** - 完美適配桌面和移動設備
- 🔄 **前後端分離** - RESTful API設計

## 🛠 技術棧

### 前端 (portfolio-frontend)
- **框架**: Next.js 14 + React 18 + TypeScript
- **樣式**: Tailwind CSS + 自定義Apple風格CSS
- **動畫**: Framer Motion + GSAP
- **狀態管理**: React Query (TanStack Query)
- **HTTP客戶端**: Axios

### 後端 (portfolio-backend)  
- **框架**: FastAPI + Python 3.8+
- **資料庫**: MySQL + SQLAlchemy ORM
- **驗證**: Pydantic + JWT
- **文檔**: 自動生成OpenAPI/Swagger
- **部署**: Uvicorn ASGI服務器

### 資料庫設計
- **用戶表** (users) - 基本資料
- **專利表** (patents) - 專利發明記錄
- **競賽表** (competitions) - 獲獎記錄  
- **新聞表** (news_articles) - 媒體報導

## 🚀 快速開始

### 前端啟動

```bash
cd portfolio-frontend
npm install
npm run dev
```

訪問: http://localhost:3001

### 後端啟動

```bash
cd portfolio-backend

# Windows
install_requirements.bat

# 或手動安裝
pip install -r requirements.txt

# 初始化資料庫
python -m app.utils.init_db

# 啟動API服務器
python run.py
```

訪問: 
- API服務器: http://localhost:8000
- API文檔: http://localhost:8000/docs

## 📂 項目結構

```
changyen/
├── portfolio-frontend/          # React前端
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   ├── components/         # React組件
│   │   │   ├── common/        # 通用組件
│   │   │   ├── sections/      # 頁面區塊
│   │   │   └── animations/    # 動畫組件
│   │   ├── hooks/             # 自定義Hooks
│   │   ├── lib/               # 工具函數
│   │   ├── types/             # TypeScript類型
│   │   └── data/              # 模擬數據
│   └── package.json
│
├── portfolio-backend/           # Python後端
│   ├── app/
│   │   ├── api/endpoints/     # API路由
│   │   ├── core/              # 核心配置
│   │   ├── models/            # 資料庫模型
│   │   ├── schemas/           # Pydantic模型
│   │   ├── crud/              # CRUD操作
│   │   └── utils/             # 工具函數
│   ├── requirements.txt       # Python依賴
│   └── run.py                 # 啟動腳本
│
└── README.md                    # 項目說明
```

## 🎯 核心功能

### 🏠 首頁區塊
- 動態打字機效果顯示姓名和職位
- 磁性跟隨交互按鈕
- 浮動幾何背景動畫
- 平滑滾動導航

### 🔬 專利展示
- 專利列表展示和分類篩選
- 狀態標籤 (已獲准/審查中/已過期)
- 卡片懸浮動畫效果
- 詳細資訊彈出視窗

### 🏆 競賽成就
- 時間線設計展示獲獎歷程
- 獎項等級色彩區分 (金銀銅)
- 統計數據摘要
- 證書連結下載

### 📰 媒體報導
- 網格式新聞展示
- 文章預覽和摘要
- 媒體來源標識
- 外部連結跳轉

### 👤 關於我
- 個人資料展示
- 技能水平進度條動畫
- 核心價值觀卡片
- 聯絡資訊

## 🎨 設計特色

- **Apple風格動畫**: 流暢的過渡和變換效果
- **玻璃態設計**: backdrop-filter模糊背景
- **磁性交互**: 鼠標跟隨按鈕效果  
- **視差滾動**: 多層次背景動畫
- **響應式布局**: 完美的移動端體驗

## 📊 API接口

### 用戶管理
- `GET /api/v1/users/` - 獲取用戶列表
- `GET /api/v1/users/{id}` - 獲取用戶詳情

### 專利管理
- `GET /api/v1/patents/?user_id=1` - 獲取用戶專利
- `GET /api/v1/patents/?category=AI` - 按分類篩選

### 競賽記錄
- `GET /api/v1/competitions/?user_id=1` - 獲取競賽記錄

### 新聞文章  
- `GET /api/v1/news/?user_id=1` - 獲取新聞報導

## 🔧 環境配置

### 前端環境變數
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 後端環境變數
```env
DATABASE_URL=mysql+pymysql://user:password@host:port/database
BACKEND_CORS_ORIGINS=["http://localhost:3001"]
SECRET_KEY=your-secret-key
```

## 🎪 演示特色

1. **首頁載入** - 姓名逐字打字動畫
2. **按鈕交互** - 磁性跟隨效果
3. **滾動體驗** - 平滑視差背景  
4. **內容展示** - 淡入淡出動畫
5. **響應式** - 移動端完美適配

## 📱 瀏覽器支援

- Chrome 90+
- Firefox 88+  
- Safari 14+
- Edge 90+

## 🤝 貢獻

歡迎提交 Pull Request 或回報 Issues！

## 📄 授權

MIT License

---

**開發者**: 張智強  
**技術棧**: React + Next.js + FastAPI + MySQL  
**特色**: Apple風格動畫 + 現代化設計