# Portfolio Backend API

個人履歷展示網站的後端API服務，基於FastAPI構建。

## 功能特色

- ✅ RESTful API 設計
- ✅ MySQL 資料庫整合
- ✅ 自動化API文檔 (Swagger/OpenAPI)
- ✅ CORS 跨域支援
- ✅ 數據驗證 (Pydantic)
- ✅ 資料庫ORM (SQLAlchemy)

## 安裝與運行

### 方法1: 使用pip安裝依賴

```bash
# 安裝依賴
pip install -r requirements.txt

# 初始化資料庫
python -m app.utils.init_db

# 啟動服務器
python run.py
```

### 方法2: 使用虛擬環境

```bash
# 創建虛擬環境
python -m venv venv

# 啟動虛擬環境 (Windows)
venv\Scripts\activate
# 或 (Linux/Mac)
source venv/bin/activate

# 安裝依賴
pip install -r requirements.txt

# 初始化資料庫
python -m app.utils.init_db

# 啟動服務器
python run.py
```

## API 文檔

服務器啟動後，可以通過以下URL訪問API文檔：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 環境配置

確保 `.env` 文件包含正確的配置：

```env
DATABASE_URL=mysql+pymysql://username:password@host:port/database
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
```

## API 端點

### 用戶 (/api/v1/users)
- GET `/` - 獲取用戶列表
- GET `/{user_id}` - 獲取用戶詳情
- POST `/` - 創建用戶
- PUT `/{user_id}` - 更新用戶
- DELETE `/{user_id}` - 刪除用戶

### 專利 (/api/v1/patents)
- GET `/` - 獲取專利列表 (支持用戶和分類篩選)
- GET `/{patent_id}` - 獲取專利詳情
- POST `/` - 創建專利
- PUT `/{patent_id}` - 更新專利
- DELETE `/{patent_id}` - 刪除專利

### 競賽 (/api/v1/competitions)
- GET `/` - 獲取競賽列表
- GET `/{competition_id}` - 獲取競賽詳情
- POST `/` - 創建競賽記錄
- PUT `/{competition_id}` - 更新競賽
- DELETE `/{competition_id}` - 刪除競賽

### 新聞 (/api/v1/news)
- GET `/` - 獲取新聞列表
- GET `/{article_id}` - 獲取新聞詳情
- POST `/` - 創建新聞
- PUT `/{article_id}` - 更新新聞
- DELETE `/{article_id}` - 刪除新聞

## 資料庫結構

- `users` - 用戶基本信息
- `patents` - 專利信息
- `competitions` - 競賽獲獎記錄
- `news_articles` - 媒體報導記錄