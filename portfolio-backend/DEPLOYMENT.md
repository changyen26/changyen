# 部署指南

## 本地開發

### 設定環境變數
1. 複製 `.env.example` 為 `.env`
2. 修改 `.env` 中的配置：
   ```
   # 本地開發時，設定絕對路徑
   UPLOAD_FOLDER=E:\MY\portfolio-backend\uploads

   # 其他本地資料庫配置...
   ```

### 啟動服務
```bash
python app_mysql.py
```

## Zeabur 部署

### 環境變數設定
在 Zeabur 控制台設定以下環境變數：

**必要變數：**
- `DATABASE_URL`: MySQL 連接字串
- `SECRET_KEY`: Flask 密鑰
- `FLASK_ENV`: `production`
- `ADMIN_PASSWORD`: 管理員密碼

**檔案上傳變數：**
- `UPLOAD_FOLDER`: **不要設定**（讓系統使用預設的相對路徑 `./uploads`）

### 部署流程
1. 推送代碼到 GitHub
2. 在 Zeabur 連接 GitHub 倉庫
3. 設定環境變數
4. 部署會自動開始

### 檔案上傳路徑說明
- **本地開發**: 使用絕對路徑 `E:\MY\portfolio-backend\uploads`
- **Zeabur 部署**: 使用相對路徑 `./uploads`（相對於應用根目錄）

### 注意事項
1. `.env` 檔案不會被提交到 Git（已加入 `.gitignore`）
2. `uploads/` 目錄會被 Git 追蹤但檔案內容不會（除了 `.gitkeep`）
3. Zeabur 部署時會自動在容器中建立 `uploads` 目錄
4. 上傳的檔案在 Zeabur 重新部署時會遺失，建議使用對象存儲服務（如 AWS S3）作為生產環境方案

## 生產環境建議
對於生產環境，建議：
1. 使用對象存儲（S3, Google Cloud Storage 等）
2. 配置 CDN 加速
3. 實施檔案大小和類型限制
4. 添加防病毒掃描