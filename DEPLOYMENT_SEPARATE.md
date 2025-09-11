# 🚀 分開部署方案 (推薦)

由於合併部署遇到複雜性問題，建議使用更穩定的分開部署方案：

## 📋 Zeabur分開部署步驟

### Step 1: 部署後端API

#### 1.1 創建後端服務
1. 在Zeabur中點擊 **"Add Service"**
2. 選擇 **"GitHub"**
3. 選擇 `changyen26/changyen` 倉庫
4. 選擇 **"portfolio-backend"** 目錄

#### 1.2 配置後端環境變數
```env
DATABASE_URL=mysql+pymysql://root:9y76FPMki52d3g0VAclpD8UevTR1zw4Z@sjc1.clusters.zeabur.com:31018/zeabur
ENVIRONMENT=production
SECRET_KEY=zeabur-portfolio-secret-key-2024
API_V1_STR=/api/v1
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PORT=8000
BACKEND_CORS_ORIGINS=["https://your-frontend-service.zeabur.app"]
```

### Step 2: 部署前端

#### 2.1 創建前端服務
1. 在同一個Project中點擊 **"Add Service"**
2. 選擇 **"GitHub"**
3. 選擇同一個 `changyen26/changyen` 倉庫
4. 選擇 **"portfolio-frontend"** 目錄

#### 2.2 配置前端環境變數
```env
NEXT_PUBLIC_API_URL=https://your-backend-service.zeabur.app/api/v1
NODE_ENV=production
```

### Step 3: 更新CORS配置

部署完成後，更新後端的CORS配置：
```env
BACKEND_CORS_ORIGINS=["https://your-frontend-service.zeabur.app"]
```

### Step 4: 初始化資料庫

訪問以下端點初始化資料庫：
```bash
POST https://your-backend-service.zeabur.app/api/v1/init-db
```

## 🎯 分開部署的優勢

1. **穩定性**: 每個服務獨立構建和部署
2. **簡單性**: 使用標準的Docker配置
3. **可擴展性**: 可以獨立擴展前端和後端
4. **調試容易**: 問題隔離更清楚

## 📱 最終URL結構

- **前端網站**: `https://your-frontend-service.zeabur.app`
- **後端API**: `https://your-backend-service.zeabur.app`
- **API文檔**: `https://your-frontend-service.zeabur.app/docs`

這種方式更可靠，建議先使用這個方案。