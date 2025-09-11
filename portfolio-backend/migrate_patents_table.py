#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新 patents 表結構以匹配新的 Patent 模型
"""

import pymysql
import os
from dotenv import load_dotenv

# 載入環境變數
load_dotenv()

def migrate_patents_table():
    """遷移 patents 表結構"""
    print("=== 更新 patents 表結構 ===")
    
    # 連接到線上 MySQL 資料庫
    connection = None
    try:
        connection = pymysql.connect(
            host=os.getenv('DB_HOST'),
            port=int(os.getenv('DB_PORT')),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME'),
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        print(f"成功連接到資料庫: {os.getenv('DB_NAME')}")
        
        # 檢查現有欄位
        cursor.execute("DESCRIBE patents")
        existing_columns = {row[0]: row for row in cursor.fetchall()}
        print(f"現有欄位: {', '.join(existing_columns.keys())}")
        
        # 需要新增的欄位
        new_columns = {
            'publication_date': "ADD COLUMN publication_date DATE",
            'inventors': "ADD COLUMN inventors TEXT",
            'assignee': "ADD COLUMN assignee VARCHAR(200)",
            'country': "ADD COLUMN country VARCHAR(50) DEFAULT '台灣'",
            'patent_url': "ADD COLUMN patent_url VARCHAR(255)",
            'priority_date': "ADD COLUMN priority_date DATE",
            'classification': "ADD COLUMN classification VARCHAR(100)",
            'featured': "ADD COLUMN featured BOOLEAN DEFAULT FALSE"
        }
        
        # 添加缺少的欄位
        for column, sql_part in new_columns.items():
            if column not in existing_columns:
                sql = f"ALTER TABLE patents {sql_part}"
                print(f"添加欄位 {column}...")
                cursor.execute(sql)
                print(f"✓ 成功添加 {column} 欄位")
        
        # 修改現有欄位
        modifications = []
        
        # 修改 id 欄位為 VARCHAR(36)
        if existing_columns['id'][1] != 'varchar(36)':
            modifications.append("MODIFY COLUMN id VARCHAR(36) PRIMARY KEY")
            print("需要修改 id 欄位類型為 VARCHAR(36)")
        
        # 修改 status 欄位的 ENUM 值
        if 'enum' in existing_columns['status'][1].lower():
            modifications.append("MODIFY COLUMN status VARCHAR(50) DEFAULT '審查中'")
            print("需要修改 status 欄位類型")
            
        # 修改 patent_number 長度
        if existing_columns['patent_number'][1] == 'varchar(50)':
            modifications.append("MODIFY COLUMN patent_number VARCHAR(100)")
            print("需要修改 patent_number 欄位長度")
        
        # 修改 title 長度
        if existing_columns['title'][1] == 'varchar(300)':
            modifications.append("MODIFY COLUMN title VARCHAR(200) NOT NULL")
            print("需要修改 title 欄位長度")
        
        # 執行修改
        for mod in modifications:
            try:
                sql = f"ALTER TABLE patents {mod}"
                print(f"執行修改: {mod}")
                cursor.execute(sql)
                print("✓ 修改成功")
            except Exception as e:
                print(f"⚠ 修改失敗 ({mod}): {e}")
                # 某些修改可能因為數據原因失敗，繼續執行其他修改
                pass
        
        # 確保有 updated_at 欄位的觸發器
        try:
            trigger_sql = """
            CREATE TRIGGER patents_updated_at 
            BEFORE UPDATE ON patents 
            FOR EACH ROW 
            SET NEW.updated_at = CURRENT_TIMESTAMP
            """
            cursor.execute("DROP TRIGGER IF EXISTS patents_updated_at")
            cursor.execute(trigger_sql)
            print("✓ 成功創建 updated_at 觸發器")
        except Exception as e:
            print(f"⚠ 創建觸發器失敗: {e}")
        
        connection.commit()
        print("\npatents 表結構更新完成！")
        
        # 顯示更新後的表結構
        cursor.execute("DESCRIBE patents")
        columns = cursor.fetchall()
        print("\n更新後的表結構:")
        for col in columns:
            print(f"  {col[0]} - {col[1]} - {'NOT NULL' if col[2] == 'NO' else 'NULL'}")
        
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
    if migrate_patents_table():
        print("\n✅ patents 表結構更新成功，請重新啟動後端服務")
    else:
        print("\n❌ patents 表結構更新失敗，請檢查配置和權限")