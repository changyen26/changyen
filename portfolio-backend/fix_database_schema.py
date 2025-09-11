#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修復線上資料庫結構
"""

import pymysql
import os
from dotenv import load_dotenv

# 載入環境變數
load_dotenv()

def fix_database_schema():
    """修復資料庫結構"""
    print("=== 修復線上資料庫結構 ===")
    
    # 連接到線上 MySQL 資料庫
    connection = None
    try:
        connection = pymysql.connect(
            host=os.getenv('MYSQL_HOST'),
            port=int(os.getenv('MYSQL_PORT')),
            user=os.getenv('MYSQL_USER'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DATABASE'),
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        print(f"成功連接到資料庫: {os.getenv('MYSQL_DATABASE')}")
        
        # 檢查 users 表結構
        print("\n檢查 users 表結構...")
        cursor.execute("DESCRIBE users")
        users_columns = [row[0] for row in cursor.fetchall()]
        print(f"現有欄位: {', '.join(users_columns)}")
        
        # 檢查需要的欄位映射
        current_to_needed = {
            'bio': 'description',  # bio 已存在，可能需要重命名為 description
            'avatar_url': 'avatar'  # avatar_url 已存在，可能需要重命名為 avatar
        }
        
        # 需要添加的新欄位
        new_columns = {
            'github': "ADD COLUMN github VARCHAR(255)",
            'linkedin': "ADD COLUMN linkedin VARCHAR(255)", 
            'location': "ADD COLUMN location VARCHAR(255)",
            'website': "ADD COLUMN website VARCHAR(255)"
        }
        
        # 如果沒有 description 但有 bio，添加 description 欄位
        if 'description' not in users_columns and 'bio' in users_columns:
            cursor.execute("ALTER TABLE users ADD COLUMN description TEXT")
            cursor.execute("UPDATE users SET description = bio WHERE bio IS NOT NULL")
            print("成功添加 description 欄位並從 bio 複製數據")
        elif 'description' not in users_columns:
            cursor.execute("ALTER TABLE users ADD COLUMN description TEXT")
            print("成功添加 description 欄位")
        
        # 如果沒有 avatar 但有 avatar_url，添加 avatar 欄位
        if 'avatar' not in users_columns and 'avatar_url' in users_columns:
            cursor.execute("ALTER TABLE users ADD COLUMN avatar VARCHAR(255)")
            cursor.execute("UPDATE users SET avatar = avatar_url WHERE avatar_url IS NOT NULL")
            print("成功添加 avatar 欄位並從 avatar_url 複製數據")
        elif 'avatar' not in users_columns:
            cursor.execute("ALTER TABLE users ADD COLUMN avatar VARCHAR(255)")
            print("成功添加 avatar 欄位")
        
        # 添加其他缺少的欄位
        for column, sql_part in new_columns.items():
            if column not in users_columns:
                sql = f"ALTER TABLE users {sql_part}"
                print(f"添加欄位 {column}...")
                cursor.execute(sql)
                print(f"成功添加 {column} 欄位")
        
        # 檢查其他必要的表
        tables_to_check = ['competitions', 'projects', 'skills', 'news_articles', 'analytics', 'uploaded_files']
        
        cursor.execute("SHOW TABLES")
        existing_tables = [row[0] for row in cursor.fetchall()]
        print(f"\n現有表: {', '.join(existing_tables)}")
        
        # 創建缺少的表
        missing_tables = []
        for table in tables_to_check:
            if table not in existing_tables:
                missing_tables.append(table)
        
        if missing_tables:
            print(f"\n缺少的表: {', '.join(missing_tables)}")
            print("建議使用 Flask-Migrate 或重新運行模型創建...")
            
            # 創建基本的表結構
            create_tables_sql = {
                'competitions': """
                CREATE TABLE competitions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    category VARCHAR(100),
                    date DATE,
                    result VARCHAR(100),
                    url VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
                """,
                'projects': """
                CREATE TABLE projects (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    category VARCHAR(100),
                    tech_stack TEXT,
                    github_url VARCHAR(255),
                    demo_url VARCHAR(255),
                    image_url VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
                """,
                'skills': """
                CREATE TABLE skills (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    category VARCHAR(100),
                    level INT DEFAULT 1,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
                """,
                'news_articles': """
                CREATE TABLE news_articles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    content TEXT,
                    category VARCHAR(100),
                    published_date DATE,
                    url VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
                """,
                'analytics': """
                CREATE TABLE analytics (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    event_type VARCHAR(100) NOT NULL,
                    page_path VARCHAR(255),
                    page_title VARCHAR(255),
                    user_agent TEXT,
                    ip_address VARCHAR(45),
                    session_id VARCHAR(255),
                    referrer VARCHAR(255),
                    browser VARCHAR(100),
                    os VARCHAR(100),
                    device VARCHAR(100),
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
                """,
                'uploaded_files': """
                CREATE TABLE uploaded_files (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL,
                    original_filename VARCHAR(255),
                    file_path VARCHAR(500),
                    file_size INT,
                    mime_type VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
                """
            }
            
            for table in missing_tables:
                if table in create_tables_sql:
                    print(f"創建表 {table}...")
                    cursor.execute(create_tables_sql[table])
                    print(f"✓ 成功創建 {table} 表")
        
        # 確保有基本的用戶資料
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        
        if user_count == 0:
            print("\n插入預設用戶資料...")
            default_user_sql = """
            INSERT INTO users (name, email, phone, title, description, github, linkedin, location, website)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            default_user_data = (
                "謝長諺",
                "changyen26@gmail.com", 
                "+886 912 345 678",
                "全端開發工程師",
                "專精於現代化網頁開發，擁有豐富的前端和後端開發經驗",
                "https://github.com/changyen26",
                "https://linkedin.com/in/changyen",
                "台灣",
                ""
            )
            cursor.execute(default_user_sql, default_user_data)
            print("✓ 成功插入預設用戶資料")
        
        connection.commit()
        print("\n資料庫結構修復完成！")
        
    except Exception as e:
        print(f"錯誤: {e}")
        if connection:
            connection.rollback()
        return False
        
    finally:
        if connection:
            connection.close()
    
    return True

if __name__ == "__main__":
    if fix_database_schema():
        print("\n資料庫修復成功，可以重新啟動後端服務")
    else:
        print("\n資料庫修復失敗，請檢查配置和權限")