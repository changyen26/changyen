#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修復 competitions 表結構
"""

import pymysql
import os
from dotenv import load_dotenv

# 載入環境變數
load_dotenv()

def fix_competitions_table():
    """修復 competitions 表結構"""
    print("=== 修復 competitions 表結構 ===")
    
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
        
        # 檢查 competitions 表結構
        print("\n檢查 competitions 表結構...")
        cursor.execute("DESCRIBE competitions")
        competitions_columns = [row[0] for row in cursor.fetchall()]
        print(f"現有欄位: {', '.join(competitions_columns)}")
        
        # 需要的欄位
        required_columns = {
            'name': 'ADD COLUMN name VARCHAR(200) NOT NULL',
            'result': 'ADD COLUMN result VARCHAR(100)',
            'description': 'ADD COLUMN description TEXT',
            'date': 'ADD COLUMN date DATE',
            'certificate_url': 'ADD COLUMN certificate_url VARCHAR(255)',
            'category': 'ADD COLUMN category VARCHAR(100) DEFAULT "技術競賽"',
            'featured': 'ADD COLUMN featured BOOLEAN DEFAULT TRUE',
            'organizer': 'ADD COLUMN organizer VARCHAR(200)',
            'location': 'ADD COLUMN location VARCHAR(200)',
            'award': 'ADD COLUMN award VARCHAR(200)',
            'team_size': 'ADD COLUMN team_size INT DEFAULT 1',
            'role': 'ADD COLUMN `role` VARCHAR(100)',
            'project_url': 'ADD COLUMN project_url VARCHAR(255)',
            'technologies': 'ADD COLUMN technologies TEXT',
            'user_id': 'ADD COLUMN user_id INT',
            'created_at': 'ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            'updated_at': 'ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        }
        
        # 如果有 title 欄位但沒有 name，複製並重命名
        if 'title' in competitions_columns and 'name' not in competitions_columns:
            cursor.execute("ALTER TABLE competitions ADD COLUMN name VARCHAR(200)")
            cursor.execute("UPDATE competitions SET name = title WHERE title IS NOT NULL")
            print("成功從 title 複製到 name 欄位")
        
        # 添加缺少的欄位
        for column, sql_part in required_columns.items():
            if column not in competitions_columns:
                try:
                    sql = f"ALTER TABLE competitions {sql_part}"
                    print(f"添加欄位 {column}...")
                    cursor.execute(sql)
                    print(f"成功添加 {column} 欄位")
                except Exception as e:
                    print(f"添加 {column} 欄位失敗: {e}")
        
        # 檢查 ID 欄位類型
        cursor.execute("SHOW COLUMNS FROM competitions WHERE Field = 'id'")
        id_column = cursor.fetchone()
        if id_column:
            print(f"ID 欄位類型: {id_column[1]}")
            # 如果 ID 是 INT，需要改為 VARCHAR(36) 以支援 UUID
            if 'int' in id_column[1].lower():
                print("警告: ID 欄位是 INT 類型，模型期望 VARCHAR(36)")
                # 這裡可以選擇是否要修改 ID 類型
        
        connection.commit()
        print("\ncompetitions 表結構修復完成！")
        
        # 檢查最終結構
        cursor.execute("DESCRIBE competitions")
        final_columns = [row[0] for row in cursor.fetchall()]
        print(f"最終欄位: {', '.join(final_columns)}")
        
        return True
        
    except Exception as e:
        print(f"錯誤: {e}")
        if connection:
            connection.rollback()
        return False
        
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    if fix_competitions_table():
        print("\ncompetitions 表修復成功！")
    else:
        print("\ncompetitions 表修復失敗！")