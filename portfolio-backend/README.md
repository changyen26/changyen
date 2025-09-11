# Portfolio Backend API

個人作品集網站的後端API服務，使用Flask框架開發。

## 功能特色

- 使用JSON文件作為數據存儲（輕量化部署）
- 完整的CRUD API操作
- 支持中文字符
- CORS跨域支持
- 文件上傳功能
- RESTful API設計

## 快速開始

### 環境要求

- Python 3.8+
- Flask 3.0+

### 安裝依賴

```bash
pip install -r requirements.txt
```

### 啟動服務

```bash
python app.py
```

服務將運行在 `http://localhost:8000`

## API 端點

### 健康檢查
- `GET /health` - 服務器健康狀態

### 用戶管理
- `GET /api/v1/user` - 獲取用戶信息
- `POST /api/v1/user/update` - 更新用戶信息

### 競賽管理
- `GET /api/v1/competitions` - 獲取所有競賽
- `POST /api/v1/competitions` - 創建新競賽
- `GET /api/v1/competitions/{id}` - 獲取特定競賽
- `PUT /api/v1/competitions/{id}` - 更新競賽
- `DELETE /api/v1/competitions/{id}` - 刪除競賽

### 項目管理
- `GET /api/v1/projects` - 獲取所有項目
- `POST /api/v1/projects` - 創建新項目
- `PUT /api/v1/projects/{id}` - 更新項目
- `DELETE /api/v1/projects/{id}` - 刪除項目

### 技能管理
- `GET /api/v1/skills` - 獲取所有技能
- `POST /api/v1/skills` - 創建新技能
- `PUT /api/v1/skills/{id}` - 更新技能
- `DELETE /api/v1/skills/{id}` - 刪除技能

### 新聞管理
- `GET /api/v1/news` - 獲取所有新聞
- `POST /api/v1/news` - 創建新聞

### 文件管理
- `POST /api/v1/files` - 上傳文件
- `GET /api/v1/files/{id}` - 獲取文件

## 數據存儲

所有數據存儲在 `data/` 目錄下的JSON文件中：
- `competitions.json` - 競賽資料
- `user.json` - 用戶資料
- `skills.json` - 技能資料
- `projects.json` - 項目資料
- `news.json` - 新聞資料
- `uploads/` - 上傳的文件

## 開發模式

服務器會在 debug 模式下運行，支持：
- 熱重載
- 詳細錯誤信息
- 自動初始化測試數據

## 注意事項

- 此API設計用於開發和小規模部署
- 生產環境建議使用專業數據庫（如MySQL、PostgreSQL）
- 文件上傳大小和類型可根據需求調整