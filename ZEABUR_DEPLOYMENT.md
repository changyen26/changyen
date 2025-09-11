# 🚀 Zeabur 部署指南

## 準備工作

1. 確保您已經有Zeabur帳戶：https://zeabur.com
2. 代碼已推送到GitHub：https://github.com/changyen26/changyen
3. MySQL數據庫已準備就緒

## 📋 部署步驟

### Step 1: 登入Zeabur控制台

1. 訪問 https://zeabur.com
2. 使用GitHub帳戶登入
3. 創建新的Project

### Step 2: 部署後端API

#### 2.1 新增後端服務

1. 點擊 **"Add Service"**
2. 選擇 **"GitHub"**
3. 授權Zeabur訪問您的GitHub倉庫
4. 選擇 `changyen26/changyen` 倉庫
5. 選擇 **"portfolio-backend"** 目錄

#### 2.2 配置後端環境變數

在服務設置中添加以下環境變數：

```env
DATABASE_URL=mysql+pymysql://root:9y76FPMki52d3g0VAclpD8UevTR1zw4Z@sjc1.clusters.zeabur.com:31018/zeabur
ENVIRONMENT=production
SECRET_KEY=zeabur-portfolio-secret-key-2024
API_V1_STR=/api/v1
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PORT=8000
```

#### 2.3 配置CORS設置

等前端部署完成後，更新CORS配置：

```env
BACKEND_CORS_ORIGINS=["https://your-frontend-service.zeabur.app"]
```

### Step 3: 部署前端

#### 3.1 新增前端服務

1. 在同一個Project中點擊 **"Add Service"**
2. 選擇 **"GitHub"**
3. 選擇同一個 `changyen26/changyen` 倉庫
4. 選擇 **"portfolio-frontend"** 目錄

#### 3.2 配置前端環境變數

```env
NEXT_PUBLIC_API_URL=https://your-backend-service.zeabur.app
NODE_ENV=production
```

> **注意**: 將 `your-backend-service` 替換為您實際的後端服務名稱

### Step 4: 配置自定義域名 (可選)

1. 在服務設置中點擊 **"Domain"**
2. 添加自定義域名或使用Zeabur提供的免費域名
3. 配置DNS記錄 (如使用自定義域名)

### Step 5: 初始化資料庫

#### 5.1 通過API初始化

部署完成後，訪問以下端點來初始化資料庫：

```bash
POST https://your-backend-service.zeabur.app/init-db
```

#### 5.2 手動執行初始化腳本

如果需要手動初始化，可以使用Zeabur的Terminal功能：

```bash
python -m app.utils.init_db
```

## 🔍 驗證部署

### 檢查後端API

1. 訪問 `https://your-backend-service.zeabur.app`
2. 檢查API文檔：`https://your-backend-service.zeabur.app/docs`
3. 健康檢查：`https://your-backend-service.zeabur.app/health`

### 檢查前端網站

1. 訪問 `https://your-frontend-service.zeabur.app`
2. 確認所有動畫正常工作
3. 測試API數據載入

## 📱 最終URL結構

- **前端網站**: `https://your-frontend-service.zeabur.app`
- **後端API**: `https://your-backend-service.zeabur.app`
- **API文檔**: `https://your-backend-service.zeabur.app/docs`

## 🔧 常見問題排除

### 問題1: CORS錯誤
**解決方案**: 確保後端的CORS配置包含前端域名

### 問題2: 資料庫連接失敗
**解決方案**: 檢查環境變數中的DATABASE_URL是否正確

### 問題3: 靜態資源載入失敗
**解決方案**: 確保Next.js配置了正確的`output: 'standalone'`

### 問題4: API調用失敗
**解決方案**: 檢查前端的`NEXT_PUBLIC_API_URL`環境變數

## 🔄 更新部署

### 自動部署
- 推送到GitHub main/master分支會自動觸發重新部署
- 等待構建完成 (通常2-5分鐘)

### 手動重新部署
1. 在Zeabur控制台中找到對應服務
2. 點擊 **"Redeploy"** 按鈕

## 📊 監控和日誌

- **實時日誌**: 在Zeabur控制台查看服務日誌
- **性能監控**: 使用Zeabur內建的監控功能
- **資源使用**: 查看CPU、記憶體使用情況

## 🎯 生產環境最佳實踐

1. **環境變數安全**: 將敏感資訊存儲在環境變數中
2. **日誌監控**: 定期檢查應用日誌
3. **備份策略**: 定期備份資料庫數據
4. **性能監控**: 監控應用響應時間和錯誤率
5. **SSL證書**: Zeabur自動提供SSL證書

## 🛡️ 安全建議

- 使用強密碼作為SECRET_KEY
- 定期更新依賴包
- 監控異常訪問日誌
- 限制API訪問頻率 (可選)

---

部署完成後，您的個人履歷網站將可在Zeabur上穩定運行！

**技術支援**: 如遇問題，可查看Zeabur官方文檔或聯繫技術支援。