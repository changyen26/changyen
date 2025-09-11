#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Portfolio Backend API - Flask + MySQL + SQLAlchemy
個人作品集後端API，整合MySQL資料庫
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate
from datetime import datetime, date, timedelta
import uuid
import os
import base64
import re
from config import config
from models import (
    db, User, Competition, Project, Skill, News, UploadedFile, PageView, VisitorSession
)

def parse_user_agent(user_agent):
    """解析用戶代理字符串"""
    browser = "Unknown"
    os = "Unknown"
    device = "Desktop"
    
    if not user_agent:
        return browser, os, device
    
    # 檢測瀏覽器
    if re.search(r'Chrome', user_agent):
        browser = "Chrome"
    elif re.search(r'Firefox', user_agent):
        browser = "Firefox"
    elif re.search(r'Safari', user_agent) and not re.search(r'Chrome', user_agent):
        browser = "Safari"
    elif re.search(r'Edge', user_agent):
        browser = "Edge"
    elif re.search(r'Opera', user_agent):
        browser = "Opera"
    
    # 檢測作業系統
    if re.search(r'Windows', user_agent):
        os = "Windows"
    elif re.search(r'Mac OS X', user_agent):
        os = "macOS"
    elif re.search(r'Linux', user_agent):
        os = "Linux"
    elif re.search(r'Android', user_agent):
        os = "Android"
        device = "Mobile"
    elif re.search(r'iPhone|iPad', user_agent):
        os = "iOS"
        device = "Mobile"
    
    # 檢測設備類型
    if re.search(r'Mobile|Android|iPhone', user_agent):
        device = "Mobile"
    elif re.search(r'Tablet|iPad', user_agent):
        device = "Tablet"
    
    return browser, os, device

def create_app(config_name=None):
    """應用工廠函數"""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # 設定 JSON 編碼
    app.config['JSON_AS_ASCII'] = False
    app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
    
    # 初始化擴展
    db.init_app(app)
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        },
        r"/auth/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    migrate = Migrate(app, db)
    
    # 確保上傳目錄存在
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    
    # 註冊藍圖和路由
    register_routes(app)
    
    # 創建表格
    with app.app_context():
        try:
            db.create_all()
            print("[OK] 資料庫表格初始化完成")
            # 初始化預設資料
            init_default_data()
        except Exception as e:
            print(f"[ERROR] 資料庫初始化失敗: {e}")
    
    return app

def register_routes(app):
    """註冊路由"""
    
    # ===== 健康檢查 =====
    @app.route('/health', methods=['GET'])
    def health_check():
        """健康檢查端點"""
        try:
            # 檢查資料庫連接
            db.session.execute('SELECT 1')
            db_status = "connected"
        except:
            db_status = "disconnected"
        
        return jsonify({
            "status": "healthy",
            "database": db_status,
            "environment": app.config.get('ENVIRONMENT', 'unknown'),
            "timestamp": datetime.now().isoformat()
        })

    @app.route('/', methods=['GET'])
    def root():
        """根端點"""
        return jsonify({
            "message": "Portfolio Backend API with MySQL", 
            "status": "running",
            "database": "MySQL + SQLAlchemy",
            "timestamp": datetime.now().isoformat()
        })

    # ===== 認證管理 =====
    @app.route('/auth/login', methods=['POST'])
    def auth_login():
        """管理員登入驗證"""
        try:
            data = request.get_json()
            if not data or 'password' not in data:
                return jsonify({"error": "密碼為必填欄位"}), 400
            
            password = data['password']
            # 使用簡單的硬編碼密碼驗證
            if password == 'admin123':
                return jsonify({"success": True, "message": "登入成功"}), 200
            else:
                return jsonify({"error": "密碼錯誤"}), 401
                
        except Exception as e:
            print(f"[ERROR] Auth login error: {e}")
            return jsonify({"error": "登入失敗"}), 500

    # ===== 用戶管理 =====
    @app.route('/api/v1/user', methods=['GET'])
    def get_user():
        """獲取用戶信息"""
        user = User.query.first()
        if user:
            return jsonify(user.to_dict())
        else:
            # 返回預設用戶信息
            return jsonify({
                "name": "Portfolio User",
                "email": "user@example.com",
                "phone": "",
                "title": "軟體工程師",
                "description": "熱愛技術的開發者",
                "github": "",
                "linkedin": "",
                "location": "台灣",
                "website": ""
            })

    @app.route('/api/v1/user/update', methods=['POST'])
    def update_user():
        """更新用戶信息"""
        data = request.get_json()
        if not data:
            return jsonify({"error": "無效的請求資料"}), 400
        
        try:
            user = User.query.first()
            if not user:
                # 創建新用戶
                user = User(
                    name=data.get('name', 'Portfolio User'),
                    email=data.get('email', 'user@example.com')
                )
                db.session.add(user)
            
            # 更新用戶資料
            for key, value in data.items():
                if hasattr(user, key):
                    setattr(user, key, value)
            
            db.session.commit()
            return jsonify(user.to_dict())
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"更新用戶資料失敗: {str(e)}"}), 500

    # ===== 競賽管理 =====
    @app.route('/api/v1/competitions', methods=['GET'])
    @app.route('/api/v1/competitions/', methods=['GET'])
    def get_competitions():
        """獲取所有競賽"""
        try:
            competitions = Competition.query.order_by(Competition.created_at.desc()).all()
            return jsonify([comp.to_dict() for comp in competitions])
        except Exception as e:
            return jsonify({"error": f"獲取競賽資料失敗: {str(e)}"}), 500

    @app.route('/api/v1/competitions', methods=['POST'])
    def create_competition():
        """創建新競賽"""
        try:
            data = request.get_json(force=True)
            if isinstance(data, str):
                import json
                data = json.loads(data)
        except Exception as e:
            return jsonify({"error": f"JSON解析失敗: {str(e)}"}), 400
        
        if not data or not data.get('name'):
            return jsonify({"error": "競賽名稱為必填欄位"}), 400
        
        try:
            # 獲取或創建預設用戶
            user = User.query.first()
            if not user:
                user = User(name="預設用戶", email="default@example.com")
                db.session.add(user)
                db.session.flush()  # 獲取用戶ID
            
            # 處理日期
            competition_date = None
            if data.get('date'):
                try:
                    competition_date = datetime.fromisoformat(data['date']).date()
                except:
                    competition_date = None
            
            # 創建競賽記錄
            competition = Competition(
                id=str(uuid.uuid4()),
                user_id=user.id,
                name=data.get('name'),
                result=data.get('result', '參賽'),
                description=data.get('description', ''),
                date=competition_date,
                certificate_url=data.get('certificateUrl', ''),
                category=data.get('category', '技術競賽'),
                featured=data.get('featured', True),
                organizer=data.get('organizer', ''),
                location=data.get('location', ''),
                award=data.get('award', ''),
                team_size=data.get('teamSize', 1),
                role=data.get('role', ''),
                project_url=data.get('projectUrl', '')
            )
            
            # 設置技術列表
            if data.get('technologies'):
                competition.set_technologies(data['technologies'])
            
            db.session.add(competition)
            db.session.commit()
            
            return jsonify(competition.to_dict()), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"創建競賽失敗: {str(e)}"}), 500

    @app.route('/api/v1/competitions/<competition_id>', methods=['PUT'])
    def update_competition(competition_id):
        """更新競賽"""
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "無效的請求資料"}), 400
        
        try:
            competition = Competition.query.get(competition_id)
            if not competition:
                return jsonify({"error": "競賽不存在"}), 404
            
            # 處理日期
            if data.get('date'):
                try:
                    competition.date = datetime.fromisoformat(data['date']).date()
                except:
                    competition.date = None
            
            # 更新競賽資料
            update_fields = [
                'name', 'result', 'description', 'certificate_url', 
                'category', 'featured', 'organizer', 'location', 
                'award', 'team_size', 'role', 'project_url'
            ]
            
            for field in update_fields:
                api_field = field
                if field == 'certificate_url':
                    api_field = 'certificateUrl'
                elif field == 'team_size':
                    api_field = 'teamSize'
                elif field == 'project_url':
                    api_field = 'projectUrl'
                
                if api_field in data:
                    setattr(competition, field, data[api_field])
            
            # 更新技術列表
            if 'technologies' in data:
                competition.set_technologies(data['technologies'])
            
            db.session.commit()
            return jsonify(competition.to_dict())
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"更新競賽失敗: {str(e)}"}), 500

    @app.route('/api/v1/competitions/<competition_id>', methods=['DELETE'])
    def delete_competition(competition_id):
        """刪除競賽"""
        try:
            competition = Competition.query.get(competition_id)
            if not competition:
                return jsonify({"error": "競賽不存在"}), 404
            
            db.session.delete(competition)
            db.session.commit()
            
            return jsonify({"message": "競賽已刪除"})
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"刪除競賽失敗: {str(e)}"}), 500

    @app.route('/api/v1/competitions/<competition_id>', methods=['GET'])
    def get_competition(competition_id):
        """獲取單個競賽詳情"""
        try:
            competition = Competition.query.get(competition_id)
            if not competition:
                return jsonify({"error": "競賽不存在"}), 404
            
            return jsonify(competition.to_dict())
            
        except Exception as e:
            return jsonify({"error": f"獲取競賽詳情失敗: {str(e)}"}), 500

    # ===== 項目管理 =====
    @app.route('/api/v1/projects', methods=['GET'])
    def get_projects():
        """獲取所有項目"""
        try:
            projects = Project.query.order_by(Project.created_at.desc()).all()
            return jsonify([proj.to_dict() for proj in projects])
        except Exception as e:
            return jsonify({"error": f"獲取項目資料失敗: {str(e)}"}), 500

    @app.route('/api/v1/projects', methods=['POST'])
    def create_project():
        """創建新項目"""
        data = request.get_json()
        
        if not data or not data.get('title'):
            return jsonify({"error": "項目標題為必填欄位"}), 400
        
        try:
            user = User.query.first()
            
            project = Project(
                id=str(uuid.uuid4()),
                user_id=user.id if user else None,
                title=data.get('title'),
                description=data.get('description', ''),
                image_url=data.get('imageUrl', ''),
                github_url=data.get('githubUrl', ''),
                live_url=data.get('liveUrl', ''),
                featured=data.get('featured', False)
            )
            
            if data.get('technologies'):
                project.set_technologies(data['technologies'])
            
            db.session.add(project)
            db.session.commit()
            
            return jsonify(project.to_dict()), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"創建項目失敗: {str(e)}"}), 500

    # ===== 技能管理 =====
    @app.route('/api/v1/skills', methods=['GET'])
    def get_skills():
        """獲取所有技能"""
        try:
            skills = Skill.query.order_by(Skill.category, Skill.name).all()
            return jsonify([skill.to_dict() for skill in skills])
        except Exception as e:
            return jsonify({"error": f"獲取技能資料失敗: {str(e)}"}), 500

    @app.route('/api/v1/skills', methods=['POST'])
    def create_skill():
        """創建新技能"""
        data = request.get_json()
        
        if not data or not data.get('name'):
            return jsonify({"error": "技能名稱為必填欄位"}), 400
        
        try:
            user = User.query.first()
            
            skill = Skill(
                id=str(uuid.uuid4()),
                user_id=user.id if user else None,
                name=data.get('name'),
                level=data.get('level', 50),
                category=data.get('category', '其他'),
                icon=data.get('icon', '')
            )
            
            db.session.add(skill)
            db.session.commit()
            
            return jsonify(skill.to_dict()), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"創建技能失敗: {str(e)}"}), 500

    # ===== 新聞管理 =====
    @app.route('/api/v1/news', methods=['GET'])
    def get_news():
        """獲取所有新聞"""
        try:
            news_list = News.query.order_by(News.created_at.desc()).all()
            return jsonify([news.to_dict() for news in news_list])
        except Exception as e:
            return jsonify({"error": f"獲取新聞資料失敗: {str(e)}"}), 500

    # ===== 測試端點 =====
    @app.route('/api/v1/competitions/test', methods=['POST'])
    def test_competition():
        """測試端點"""
        data = request.get_json()
        print(f"收到測試資料: {data}")
        return jsonify({"received": data, "status": "ok"})

    @app.route('/api/v1/competitions/test-chinese', methods=['POST'])
    def test_chinese():
        """測試中文輸入端點"""
        data = request.get_json()
        print(f"中文測試 - 收到資料: {data}")
        return jsonify({
            "received": data,
            "status": "success",
            "message": "中文處理成功"
        })

    # ===== 文件管理 =====
    @app.route('/api/v1/files', methods=['POST'])
    def upload_file():
        """上傳文件"""
        try:
            data = request.get_json(force=True)
            if isinstance(data, str):
                import json
                data = json.loads(data)
        except Exception as e:
            return jsonify({"error": f"JSON解析失敗: {str(e)}"}), 400
        
        if not data or not data.get('data'):
            return jsonify({"error": "文件資料為必填欄位"}), 400
        
        try:
            # 創建文件記錄
            file_record = UploadedFile(
                id=str(uuid.uuid4()),
                original_name=data.get('name', ''),
                stored_name=data.get('name', ''),
                file_type=data.get('type', ''),
                file_size=data.get('size', 0),
                file_path=f"uploads/{data.get('name', '')}"
            )
            
            db.session.add(file_record)
            db.session.commit()
            
            # 返回文件資訊，包含可用的URL
            response_data = file_record.to_dict()
            response_data['url'] = f"/api/v1/files/{file_record.id}"
            response_data['data'] = data.get('data', '')  # 包含base64資料
            
            return jsonify(response_data), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"上傳文件失敗: {str(e)}"}), 500

    @app.route('/api/v1/files', methods=['GET'])
    def get_files():
        """獲取所有文件"""
        try:
            files = UploadedFile.query.order_by(UploadedFile.created_at.desc()).all()
            return jsonify([file.to_dict() for file in files])
        except Exception as e:
            return jsonify({"error": f"獲取文件列表失敗: {str(e)}"}), 500

    @app.route('/api/v1/files/<file_id>', methods=['GET'])
    def get_file(file_id):
        """獲取特定文件"""
        try:
            file_record = UploadedFile.query.get(file_id)
            if not file_record:
                return jsonify({"error": "文件不存在"}), 404
            
            return jsonify(file_record.to_dict())
        except Exception as e:
            return jsonify({"error": f"獲取文件失敗: {str(e)}"}), 500

    @app.route('/api/v1/files/<file_id>', methods=['DELETE'])
    def delete_file(file_id):
        """刪除文件"""
        try:
            file_record = UploadedFile.query.get(file_id)
            if not file_record:
                return jsonify({"error": "文件不存在"}), 404
            
            db.session.delete(file_record)
            db.session.commit()
            return jsonify({"message": "文件刪除成功"})
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"刪除文件失敗: {str(e)}"}), 500

    # ===== 流量分析 =====
    @app.route('/api/v1/analytics/track', methods=['POST'])
    def track_page_view():
        """記錄頁面瀏覽"""
        try:
            data = request.get_json()
            
            # 獲取請求信息
            ip_address = request.remote_addr
            user_agent = request.headers.get('User-Agent', '')
            referer = request.headers.get('Referer', '')
            
            # 解析用戶代理信息
            browser, os, device = parse_user_agent(user_agent)
            
            # 創建或更新訪客會話
            session_id = data.get('sessionId', str(uuid.uuid4()))
            session = VisitorSession.query.filter_by(session_id=session_id).first()
            
            if not session:
                # 新建會話
                session = VisitorSession(
                    id=str(uuid.uuid4()),
                    session_id=session_id,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    browser=browser,
                    os=os,
                    device=device,
                    first_visit=datetime.now(),
                    last_visit=datetime.now(),
                    total_page_views=1
                )
                db.session.add(session)
            else:
                # 更新現有會話
                session.last_visit = datetime.now()
                session.total_page_views += 1
                session.is_unique = False
            
            # 記錄頁面瀏覽
            page_view = PageView(
                id=str(uuid.uuid4()),
                path=data.get('path', '/'),
                title=data.get('title', ''),
                ip_address=ip_address,
                user_agent=user_agent,
                referer=referer,
                session_id=session_id,
                visit_time=datetime.now()
            )
            
            db.session.add(page_view)
            db.session.commit()
            
            return jsonify({
                'status': 'success',
                'sessionId': session_id,
                'message': '頁面瀏覽記錄成功'
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"記錄頁面瀏覽失敗: {str(e)}"}), 500

    @app.route('/api/v1/analytics/stats', methods=['GET'])
    def get_analytics_stats():
        """獲取分析統計數據"""
        try:
            # 獲取查詢參數
            days = int(request.args.get('days', 30))  # 預設30天
            
            # 計算時間範圍
            end_date = datetime.now()
            start_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=days-1)
            
            # 總頁面瀏覽量
            total_page_views = PageView.query.filter(
                PageView.visit_time >= start_date,
                PageView.visit_time <= end_date
            ).count()
            
            # 唯一訪客數
            unique_visitors = VisitorSession.query.filter(
                VisitorSession.first_visit >= start_date,
                VisitorSession.first_visit <= end_date
            ).count()
            
            # 最受歡迎頁面
            from sqlalchemy import func
            top_pages = db.session.query(
                PageView.path,
                PageView.title,
                func.count(PageView.id).label('views')
            ).filter(
                PageView.visit_time >= start_date,
                PageView.visit_time <= end_date
            ).group_by(PageView.path, PageView.title).order_by(
                func.count(PageView.id).desc()
            ).limit(10).all()
            
            # 訪客來源
            referrers = db.session.query(
                PageView.referer,
                func.count(PageView.id).label('visits')
            ).filter(
                PageView.visit_time >= start_date,
                PageView.visit_time <= end_date,
                PageView.referer != None,
                PageView.referer != ''
            ).group_by(PageView.referer).order_by(
                func.count(PageView.id).desc()
            ).limit(10).all()
            
            # 瀏覽器統計
            browsers = db.session.query(
                VisitorSession.browser,
                func.count(VisitorSession.id).label('count')
            ).filter(
                VisitorSession.first_visit >= start_date,
                VisitorSession.first_visit <= end_date
            ).group_by(VisitorSession.browser).order_by(
                func.count(VisitorSession.id).desc()
            ).limit(10).all()
            
            # 平均停留時間 (模擬數據，實際需要前端支持)
            avg_time_on_site = "2分30秒"
            
            return jsonify({
                'pageViews': total_page_views,
                'uniqueVisitors': unique_visitors,
                'averageTimeOnSite': avg_time_on_site,
                'topPages': [
                    {'path': page.path, 'title': page.title, 'views': page.views}
                    for page in top_pages
                ],
                'referrers': [
                    {'source': ref.referer, 'visits': ref.visits}
                    for ref in referrers
                ],
                'browsers': [
                    {'name': browser.browser, 'count': browser.count}
                    for browser in browsers
                ],
                'dateRange': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat(),
                    'days': days
                }
            })
            
        except Exception as e:
            return jsonify({"error": f"獲取統計數據失敗: {str(e)}"}), 500

    @app.route('/api/v1/analytics/recent', methods=['GET'])
    def get_recent_views():
        """獲取最近的頁面瀏覽記錄"""
        try:
            limit = int(request.args.get('limit', 50))
            
            recent_views = PageView.query.order_by(
                PageView.visit_time.desc()
            ).limit(limit).all()
            
            return jsonify({
                'recentViews': [view.to_dict() for view in recent_views],
                'total': len(recent_views)
            })
            
        except Exception as e:
            return jsonify({"error": f"獲取最近瀏覽記錄失敗: {str(e)}"}), 500

    # ===== 錯誤處理 =====
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "API端點不存在"}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"error": "HTTP方法不被允許"}), 405

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({"error": "內部服務器錯誤"}), 500

def init_default_data():
    """初始化預設資料"""
    try:
        # 檢查是否已有資料
        if User.query.first():
            print("[INFO] 資料庫已有資料，跳過初始化")
            return
            
        print("[INIT] 初始化預設資料...")
        
        # 創建預設用戶
        user = User(
            name="Portfolio User",
            email="user@example.com",
            title="軟體工程師",
            description="熱愛技術的開發者",
            location="台灣"
        )
        db.session.add(user)
        db.session.flush()  # 獲取用戶ID
        
        # 創建初始競賽資料
        competitions_data = [
            {
                "name": "台灣科技創新競賽",
                "result": "冠軍",
                "description": "這是一個很棒的競賽，展現了技術創新的成果",
                "date": "2024-09-11",
                "category": "技術創新",
                "organizer": "科技部",
                "location": "台北市信義區",
                "award": "最佳技術創新獎",
                "team_size": 4,
                "role": "技術負責人",
                "project_url": "https://github.com/example/project",
                "technologies": ["Python", "React", "TensorFlow", "Docker"]
            },
            {
                "name": "全國大學生程式設計競賽",
                "result": "亞軍", 
                "description": "程式設計競賽，解決複雜的演算法問題",
                "date": "2024-08-15",
                "category": "程式設計",
                "organizer": "教育部",
                "location": "台中市",
                "award": "亞軍獎",
                "team_size": 3,
                "role": "隊長",
                "technologies": ["C++", "Python", "Algorithm"]
            }
        ]
        
        for comp_data in competitions_data:
            comp_date = datetime.strptime(comp_data['date'], '%Y-%m-%d').date()
            competition = Competition(
                id=str(uuid.uuid4()),
                user_id=user.id,
                name=comp_data['name'],
                result=comp_data['result'],
                description=comp_data['description'],
                date=comp_date,
                category=comp_data['category'],
                featured=True,
                organizer=comp_data['organizer'],
                location=comp_data['location'],
                award=comp_data['award'],
                team_size=comp_data['team_size'],
                role=comp_data['role'],
                project_url=comp_data.get('project_url', '')
            )
            competition.set_technologies(comp_data.get('technologies', []))
            db.session.add(competition)
        
        # 創建初始技能資料
        skills_data = [
            {"name": "JavaScript", "level": 90, "category": "程式語言"},
            {"name": "Python", "level": 85, "category": "程式語言"},
            {"name": "React", "level": 88, "category": "前端框架"},
            {"name": "Node.js", "level": 80, "category": "後端技術"},
            {"name": "MySQL", "level": 75, "category": "資料庫"},
        ]
        
        for skill_data in skills_data:
            skill = Skill(
                id=str(uuid.uuid4()),
                user_id=user.id,
                name=skill_data['name'],
                level=skill_data['level'],
                category=skill_data['category']
            )
            db.session.add(skill)
        
        # 創建初始項目資料
        project = Project(
            id=str(uuid.uuid4()),
            user_id=user.id,
            title="個人作品集網站",
            description="使用 Next.js 和 Flask 開發的個人作品集網站",
            github_url="https://github.com/example/portfolio",
            live_url="https://portfolio.example.com",
            featured=True
        )
        project.set_technologies(["Next.js", "TypeScript", "Flask", "MySQL", "Tailwind CSS"])
        db.session.add(project)
        
        db.session.commit()
        print("[OK] 預設資料初始化完成")
        
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] 預設資料初始化失敗: {e}")

# 為部署創建全域 app 實例
app = create_app()

if __name__ == '__main__':
    print("=" * 60)
    print("Portfolio Flask + MySQL API 服務器啟動")
    print(f"服務器地址: http://localhost:8000")
    print(f"健康檢查: http://localhost:8000/health")
    print(f"資料庫: MySQL + SQLAlchemy")
    print(f"環境: {app.config.get('ENVIRONMENT', 'unknown')}")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=8000, debug=True)