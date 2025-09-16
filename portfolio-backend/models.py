#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
資料庫模型定義
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json
import uuid

db = SQLAlchemy()

class User(db.Model):
    """用戶模型"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    title = db.Column(db.String(100))
    description = db.Column(db.Text)
    github = db.Column(db.String(255))
    linkedin = db.Column(db.String(255))
    location = db.Column(db.String(100))
    website = db.Column(db.String(255))
    avatar = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 關聯
    competitions = db.relationship('Competition', backref='user', lazy=True)
    projects = db.relationship('Project', backref='user', lazy=True)
    skills = db.relationship('Skill', backref='user', lazy=True)
    news = db.relationship('News', backref='user', lazy=True)
    patents = db.relationship('Patent', backref='user', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'title': self.title,
            'description': self.description,
            'github': self.github,
            'linkedin': self.linkedin,
            'location': self.location,
            'website': self.website,
            'avatar': self.avatar
        }

class Competition(db.Model):
    """競賽模型"""
    __tablename__ = 'competitions'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    name = db.Column(db.String(200), nullable=False)  # 競賽名稱（主要欄位）
    competition_name = db.Column(db.String(200), nullable=False)  # 向下相容欄位，與 name 同步
    result = db.Column(db.String(100))  # 獲獎結果：金牌、銀牌、銅牌等
    description = db.Column(db.Text)
    detailed_description = db.Column(db.Text)  # 詳細競賽過程介紹
    date = db.Column(db.Date)
    certificate_url = db.Column(db.String(255))
    project_images = db.Column(db.Text)  # 作品圖片 URL 列表 (JSON 格式)
    category = db.Column(db.String(100), default='技術創新')
    featured = db.Column(db.Boolean, default=True)
    
    # 新增欄位
    organizer = db.Column(db.String(200))  # 主辦單位
    location = db.Column(db.String(200))   # 舉辦地點
    team_size = db.Column(db.Integer, default=1)  # 團隊人數
    role = db.Column(db.String(100))       # 團隊角色
    project_url = db.Column(db.String(255))  # 專案連結
    technologies = db.Column(db.Text)      # 使用技術 (JSON字符串)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_technologies(self):
        """獲取技術列表"""
        if self.technologies:
            try:
                return json.loads(self.technologies)
            except:
                return []
        return []
    
    def set_technologies(self, tech_list):
        """設置技術列表"""
        self.technologies = json.dumps(tech_list) if tech_list else '[]'

    def get_project_images(self):
        """獲取作品圖片 URL 列表"""
        if self.project_images:
            try:
                return json.loads(self.project_images)
            except:
                return []
        return []

    def set_project_images(self, image_urls):
        """設置作品圖片 URL 列表"""
        self.project_images = json.dumps(image_urls) if image_urls else '[]'

    def to_dict(self, include_file_data=False):
        """轉換為字典格式
        Args:
            include_file_data: 是否包含證書文件數據
        """
        result = {
            'id': str(self.id),
            'name': self.name,
            'result': self.result,
            'description': self.description or '',
            'detailedDescription': self.detailed_description or '',
            'date': self.date.isoformat() if self.date else None,
            'certificateUrl': self.certificate_url or '',
            'projectImages': self.get_project_images(),
            'category': self.category or '技術創新',
            'featured': bool(self.featured),
            'organizer': self.organizer or '',
            'location': self.location or '',
            'teamSize': self.team_size or 1,
            'role': self.role or '',
            'projectUrl': self.project_url or '',
            'technologies': self.get_technologies(),
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
        
        # 證書文件數據暫時設為 None，後續實現文件處理功能
        if include_file_data:
            result['certificateFile'] = None
            
        return result

class Project(db.Model):
    """項目模型"""
    __tablename__ = 'projects'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    technologies = db.Column(db.Text)  # JSON字符串
    image_url = db.Column(db.String(255))
    github_url = db.Column(db.String(255))
    live_url = db.Column(db.String(255))
    featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_technologies(self):
        """獲取技術列表"""
        if self.technologies:
            try:
                return json.loads(self.technologies)
            except:
                return []
        return []
    
    def set_technologies(self, tech_list):
        """設置技術列表"""
        self.technologies = json.dumps(tech_list) if tech_list else '[]'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'technologies': self.get_technologies(),
            'imageUrl': self.image_url,
            'githubUrl': self.github_url,
            'liveUrl': self.live_url,
            'featured': self.featured,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class Skill(db.Model):
    """技能模型"""
    __tablename__ = 'skills'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    level = db.Column(db.Integer, default=50)  # 0-100
    category = db.Column(db.String(100), default='其他')
    icon = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'level': self.level,
            'category': self.category,
            'icon': self.icon
        }

class News(db.Model):
    """新聞模型"""
    __tablename__ = 'news'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    summary = db.Column(db.Text)
    image_url = db.Column(db.String(255))
    published_at = db.Column(db.DateTime)
    featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'summary': self.summary,
            'imageUrl': self.image_url,
            'publishedAt': self.published_at.isoformat() if self.published_at else None,
            'featured': self.featured,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class MediaCoverage(db.Model):
    """媒體報導模型"""
    __tablename__ = 'media_coverage'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    media_name = db.Column(db.String(100), nullable=False)  # 媒體名稱
    media_type = db.Column(db.String(50))  # 報導類型：新聞、專訪、報導等
    publication_date = db.Column(db.Date)  # 發布日期
    author = db.Column(db.String(100))  # 作者/記者
    summary = db.Column(db.Text)  # 摘要
    content = db.Column(db.Text)  # 完整內容
    url = db.Column(db.String(500))  # 原文連結
    image_url = db.Column(db.String(500))  # 封面圖片
    featured = db.Column(db.Boolean, default=False)  # 是否精選
    view_count = db.Column(db.Integer, default=0)  # 瀏覽次數
    tags = db.Column(db.JSON)  # 標籤
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'mediaName': self.media_name,
            'mediaType': self.media_type,
            'publicationDate': self.publication_date.isoformat() if self.publication_date else None,
            'author': self.author,
            'summary': self.summary,
            'content': self.content,
            'url': self.url,
            'imageUrl': self.image_url,
            'featured': self.featured,
            'viewCount': self.view_count,
            'tags': self.tags if self.tags else [],
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

class UploadedFile(db.Model):
    """文件上傳模型"""
    __tablename__ = 'uploaded_files'
    
    id = db.Column(db.String(36), primary_key=True)
    original_name = db.Column(db.String(255), nullable=False)
    stored_name = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(100))
    file_size = db.Column(db.BigInteger)
    file_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.original_name,
            'type': self.file_type,
            'size': self.file_size,
            'path': self.stored_name,
            'uploadedAt': self.created_at.isoformat() if self.created_at else None
        }

class PageView(db.Model):
    """頁面瀏覽記錄模型"""
    __tablename__ = 'page_views'
    
    id = db.Column(db.String(36), primary_key=True)
    path = db.Column(db.String(255), nullable=False)  # 頁面路徑
    title = db.Column(db.String(255))  # 頁面標題
    ip_address = db.Column(db.String(45))  # IP地址 (支援IPv6)
    user_agent = db.Column(db.Text)  # 瀏覽器信息
    referer = db.Column(db.String(500))  # 來源頁面
    session_id = db.Column(db.String(36))  # 會話ID
    visit_time = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    view_duration = db.Column(db.Integer, default=0)  # 頁面停留時間(秒)
    
    def to_dict(self):
        return {
            'id': self.id,
            'path': self.path,
            'title': self.title,
            'ipAddress': self.ip_address,
            'userAgent': self.user_agent,
            'referer': self.referer,
            'sessionId': self.session_id,
            'visitTime': self.visit_time.isoformat() if self.visit_time else None,
            'viewDuration': self.view_duration
        }

class VisitorSession(db.Model):
    """訪客會話記錄模型"""
    __tablename__ = 'visitor_sessions'
    
    id = db.Column(db.String(36), primary_key=True)
    session_id = db.Column(db.String(36), unique=True, nullable=False)
    ip_address = db.Column(db.String(45))  # IP地址
    user_agent = db.Column(db.Text)  # 瀏覽器信息
    browser = db.Column(db.String(100))  # 瀏覽器名稱
    os = db.Column(db.String(100))  # 作業系統
    device = db.Column(db.String(100))  # 設備類型
    country = db.Column(db.String(100))  # 國家
    city = db.Column(db.String(100))  # 城市
    first_visit = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_visit = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    total_page_views = db.Column(db.Integer, default=1)
    total_time_spent = db.Column(db.Integer, default=0)  # 總停留時間(秒)
    is_unique = db.Column(db.Boolean, default=True)  # 是否為唯一訪客
    
    def to_dict(self):
        return {
            'id': self.id,
            'sessionId': self.session_id,
            'ipAddress': self.ip_address,
            'userAgent': self.user_agent,
            'browser': self.browser,
            'os': self.os,
            'device': self.device,
            'country': self.country,
            'city': self.city,
            'firstVisit': self.first_visit.isoformat() if self.first_visit else None,
            'lastVisit': self.last_visit.isoformat() if self.last_visit else None,
            'totalPageViews': self.total_page_views,
            'totalTimeSpent': self.total_time_spent,
            'isUnique': self.is_unique
        }

class Patent(db.Model):
    """專利模型"""
    __tablename__ = 'patents'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    patent_number = db.Column(db.String(100))  # 專利號碼
    description = db.Column(db.Text)
    category = db.Column(db.String(100), default='發明專利')  # 發明專利、新型專利、外觀設計專利
    status = db.Column(db.String(50), default='審查中')  # 審查中、已核准、已公開、已駁回
    filing_date = db.Column(db.Date)  # 申請日期
    grant_date = db.Column(db.Date)   # 核准日期
    publication_date = db.Column(db.Date)  # 公開日期
    inventors = db.Column(db.Text)    # 發明人 (JSON字符串)
    assignee = db.Column(db.String(200))  # 專利權人
    country = db.Column(db.String(50), default='台灣')  # 申請國家
    patent_url = db.Column(db.String(255))  # 專利文件連結
    priority_date = db.Column(db.Date)  # 優先權日期
    classification = db.Column(db.String(100))  # 國際分類號
    featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_inventors(self):
        """獲取發明人列表"""
        if self.inventors:
            try:
                return json.loads(self.inventors)
            except:
                return []
        return []
    
    def set_inventors(self, inventor_list):
        """設置發明人列表"""
        self.inventors = json.dumps(inventor_list) if inventor_list else '[]'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'patentNumber': self.patent_number,
            'description': self.description,
            'category': self.category,
            'status': self.status,
            'filingDate': self.filing_date.isoformat() if self.filing_date else None,
            'grantDate': self.grant_date.isoformat() if self.grant_date else None,
            'publicationDate': self.publication_date.isoformat() if self.publication_date else None,
            'inventors': self.get_inventors(),
            'assignee': self.assignee,
            'country': self.country,
            'patentUrl': self.patent_url,
            'priorityDate': self.priority_date.isoformat() if self.priority_date else None,
            'classification': self.classification,
            'featured': self.featured,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
class AboutValue(db.Model):
    """關於我區塊的翻卡內容模型"""
    __tablename__ = 'about_values'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    icon = db.Column(db.String(50), nullable=False)  # icon 名稱，如 'Lightbulb', 'Code', 'Users', 'Target'
    title = db.Column(db.String(100), nullable=False)  # 中文標題
    subtitle = db.Column(db.String(100))  # 英文副標題
    description = db.Column(db.Text)  # 詳細描述
    details = db.Column(db.JSON)  # 詳細項目列表
    order_index = db.Column(db.Integer, default=0)  # 顯示順序
    is_active = db.Column(db.Boolean, default=True)  # 是否啟用
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'icon': self.icon,
            'title': self.title,
            'subtitle': self.subtitle,
            'description': self.description,
            'details': self.details if self.details else [],
            'orderIndex': self.order_index,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
