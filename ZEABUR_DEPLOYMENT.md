# 🚀 Zeabur 部署指南

## 準備工作

1. 確保您已經有Zeabur帳戶：https://zeabur.com
2. 代碼已推送到GitHub：https://github.com/changyen26/changyen
3. MySQL數據庫已準備就緒

## 📋 部署步驟 (合併部署版本)

### Step 1: 登入Zeabur控制台

1. 訪問 https://zeabur.com
2. 使用GitHub帳戶登入
3. 創建新的Project

### Step 2: 部署合併服務 (前端+後端)

#### 2.1 新增服務

1. 點擊 **"Add Service"**
2. 選擇 **"GitHub"**
3. 授權Zeabur訪問您的GitHub倉庫
4. 選擇 `changyen26/changyen` 倉庫
5. 使用根目錄 (不選擇子目錄)

#### 2.2 配置環境變數

在服務設置中添加以下環境變數：

**後端配置：**
```env
DATABASE_URL=mysql+pymysql://root:9y76FPMki52d3g0VAclpD8UevTR1zw4Z@sjc1.clusters.zeabur.com:31018/zeabur
ENVIRONMENT=production
SECRET_KEY=zeabur-portfolio-secret-key-2024
API_V1_STR=/api/v1
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PORT=8000
```

**前端配置：**
```env
NEXT_PUBLIC_API_URL=/api/v1
NODE_ENV=production
```

> **注意**: 由於前後端合併部署，CORS配置已經不需要，API URL使用相對路徑

### Step 3: 配置自定義域名 (可選)

1. 在服務設置中點擊 **"Domain"**
2. 添加自定義域名或使用Zeabur提供的免費域名
3. 配置DNS記錄 (如使用自定義域名)

### Step 4: 初始化資料庫

#### 4.1 通過API初始化

部署完成後，訪問以下端點來初始化資料庫：

```bash
POST https://your-service.zeabur.app/api/v1/init-db
```

#### 4.2 手動執行初始化腳本

如果需要手動初始化，可以使用Zeabur的Terminal功能：

```bash
python -m app.utils.init_db
```

## 🔍 驗證部署

### 檢查合併服務

1. 訪問 `https://your-service.zeabur.app` - 前端網站
2. 檢查API文檔：`https://your-service.zeabur.app/docs` - 後端API文檔
3. 健康檢查：`https://your-service.zeabur.app/health` - 後端健康檢查
4. API測試：`https://your-service.zeabur.app/api/v1/...` - 後端API端點

## 📱 最終URL結構 (合併部署)

- **網站首頁**: `https://your-service.zeabur.app`
- **後端API**: `https://your-service.zeabur.app/api/v1`
- **API文檔**: `https://your-service.zeabur.app/docs`
- **健康檢查**: `https://your-service.zeabur.app/health`

## 🔧 常見問題排除

### 問題1: 資料庫連接失敗
**解決方案**: 檢查環境變數中的DATABASE_URL是否正確

### 問題2: 靜態資源載入失敗
**解決方案**: 確保Next.js配置了正確的`output: 'standalone'`

### 問題3: API調用失敗
**解決方案**: 檢查前端的`NEXT_PUBLIC_API_URL`環境變數設置為`/api/v1`

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