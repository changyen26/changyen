#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
資料庫設置助手
"""

import pymysql
import getpass
from config import Config

def test_mysql_connection():
    """測試MySQL連接"""
    print("=== MySQL 連接測試 ===")
    
    # 提示輸入資料庫配置
    host = input(f"MySQL 主機 [{Config.MYSQL_HOST}]: ") or Config.MYSQL_HOST
    port = int(input(f"MySQL 端口 [{Config.MYSQL_PORT}]: ") or Config.MYSQL_PORT)
    user = input(f"MySQL 用戶名 [{Config.MYSQL_USER}]: ") or Config.MYSQL_USER
    
    # 安全輸入密碼
    password = getpass.getpass("MySQL 密碼 (回車如果沒有密碼): ")
    
    try:
        # 測試連接到MySQL服務器 (不指定資料庫)
        print(f"\n連接到 MySQL 服務器 {user}@{host}:{port}...")
        connection = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        print(f"成功連接！MySQL 版本: {version[0]}")
        
        # 檢查是否存在 portfolio 資料庫
        database_name = Config.MYSQL_DATABASE
        cursor.execute("SHOW DATABASES LIKE %s", (database_name,))
        if cursor.fetchone():
            print(f"資料庫 '{database_name}' 已存在")
        else:
            print(f"資料庫 '{database_name}' 不存在")
            create_db = input(f"是否創建資料庫 '{database_name}'? (y/N): ")
            if create_db.lower() == 'y':
                cursor.execute(f"CREATE DATABASE `{database_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                print(f"成功創建資料庫 '{database_name}'")
        
        cursor.close()
        connection.close()
        
        # 更新 .env 文件
        if password:
            update_env = input("\n是否更新 .env 文件中的密碼? (y/N): ")
            if update_env.lower() == 'y':
                update_env_file(user, password, host, port, database_name)
        
        return True, user, password, host, port, database_name
        
    except pymysql.Error as e:
        print(f"連接失敗: {e}")
        return False, None, None, None, None, None

def update_env_file(user, password, host, port, database):
    """更新 .env 文件"""
    try:
        env_content = f"""# 本地MySQL資料庫配置
MYSQL_USER={user}
MYSQL_PASSWORD={password}
MYSQL_HOST={host}
MYSQL_PORT={port}
MYSQL_DATABASE={database}

# Flask 配置
SECRET_KEY=your-secret-key-change-this-in-production-portfolio-2024
ENVIRONMENT=development
FLASK_ENV=development

# 備份 - Zeabur遠端資料庫 (如果需要可以切換)
# DATABASE_URL=mysql+pymysql://root:9y76FPMki52d3g0VAclpD8UevTR1zw4Z@sjc1.clusters.zeabur.com:31018/zeabur
"""
        
        with open('.env', 'w', encoding='utf-8') as f:
            f.write(env_content)
        
        print("成功更新 .env 文件")
        
    except Exception as e:
        print(f"更新 .env 文件失敗: {e}")

def create_tables_manually():
    """手動創建表格"""
    print("\n=== 創建資料庫表格 ===")
    
    try:
        from models import db, User, Competition, Project, Skill, News, UploadedFile
        from config import config
        from flask import Flask
        
        app = Flask(__name__)
        app.config.from_object(config['development'])
        db.init_app(app)
        
        with app.app_context():
            print("正在創建表格...")
            db.create_all()
            print("成功創建所有表格！")
            
            # 檢查表格
            from sqlalchemy import text
            result = db.session.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result.fetchall()]
            print(f"已創建的表格: {', '.join(tables)}")
            
        return True
        
    except Exception as e:
        print(f"創建表格失敗: {e}")
        return False

def main():
    """主函數"""
    print("Portfolio 資料庫設置助手")
    print("=" * 40)
    
    # 測試連接
    success, user, password, host, port, database = test_mysql_connection()
    
    if success:
        print("\nMySQL 連接成功！")
        
        # 嘗試創建表格
        if create_tables_manually():
            print("\n設置完成！可以啟動 Flask 應用了。")
            print("運行命令: python3.11 app_mysql.py")
        else:
            print("\n表格創建失敗，請檢查權限和配置。")
    else:
        print("\n請檢查 MySQL 服務器狀態和認證信息。")
        print("\n可能的解決方案:")
        print("1. 確保 MySQL 服務器正在運行")
        print("2. 檢查用戶名和密碼")
        print("3. 確保用戶有足夠的權限")

if __name__ == "__main__":
    main()