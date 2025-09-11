#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
配置文件
"""

import os
from dotenv import load_dotenv

# 載入環境變數
load_dotenv()

class Config:
    """基礎配置"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # MySQL 資料庫配置
    MYSQL_USER = os.environ.get('MYSQL_USER') or 'yen'
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD') or ''
    MYSQL_HOST = os.environ.get('MYSQL_HOST') or 'localhost'
    MYSQL_PORT = os.environ.get('MYSQL_PORT') or '3306'
    MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE') or 'portfolio'
    
    # SQLAlchemy 配置
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@"
        f"{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'echo': False  # 設為 True 可看到 SQL 查詢
    }
    
    # 文件上傳配置
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB 最大文件大小
    
    # CORS 配置 - 包含本地和線上域名
    CORS_ORIGINS = [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:3004',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3004',
        'https://*.zeabur.app',  # Zeabur 域名
        'https://*.vercel.app',  # 如果使用 Vercel
    ]

class DevelopmentConfig(Config):
    """開發環境配置"""
    DEBUG = True
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'echo': True  # 開發模式下顯示 SQL
    }

class ProductionConfig(Config):
    """生產環境配置"""
    DEBUG = False
    MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE') or 'portfolio_prod'

# 配置字典
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': ProductionConfig
}