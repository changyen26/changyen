#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Portfolio Backend API - Flask + MySQL + SQLAlchemy
個人作品集後端API，整合MySQL資料庫
"""

from flask import Flask, request, jsonify, send_from_directory, current_app
from flask_cors import CORS
from flask_migrate import Migrate
from datetime import datetime, date, timedelta
import uuid
import os
import base64
import re
from config import config
from models import (
    db, User, Competition, Project, Skill, News, Patent, MediaCoverage, UploadedFile, PageView, VisitorSession, AboutValue
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
        config_name = os.environ.get('FLASK_ENV', 'production')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # 設定 JSON 編碼
    app.config['JSON_AS_ASCII'] = False
    app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
    app.config['JSON_SORT_KEYS'] = False
    
    # 強制 UTF-8 編碼
    import sys
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')
    
    # 初始化擴展
    db.init_app(app)

    # 增強 CORS 安全配置 - 開發環境下允許所有局域網 IP
    if app.config.get('DEBUG'):
        # 開發模式：允許所有來源（包括局域網）
        CORS(app, resources={
            r"/*": {
                "origins": "*",  # 開發環境允許所有來源
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization", "Cache-Control", "Pragma"],
                "supports_credentials": True,
                "max_age": 86400
            }
        })
    else:
        # 生產模式：嚴格限制來源
        CORS(app, resources={
            r"/api/*": {
                "origins": app.config['CORS_ORIGINS'],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization", "Cache-Control", "Pragma"],
                "supports_credentials": True,
                "max_age": 86400  # 24小時預檢緩存
            },
            r"/auth/*": {
                "origins": app.config['CORS_ORIGINS'],
                "methods": ["POST", "OPTIONS"],  # 僅允許必要方法
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True,
                "max_age": 86400
            },
            r"/uploads/*": {
                "origins": app.config['CORS_ORIGINS'],
                "methods": ["GET", "POST", "OPTIONS"],
                "allow_headers": ["Content-Type"],
                "max_age": 86400
            }
        })
    migrate = Migrate(app, db)

    # 安全設置 - 隱藏技術資訊
    @app.after_request
    def after_request(response):
        # 移除服務器資訊標頭
        response.headers.pop('Server', None)
        response.headers.pop('X-Powered-By', None)

        # 添加安全標頭
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        return response

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
            # 從環境變數獲取管理員密碼，如果沒有設定則使用預設值
            admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
            if password == admin_password:
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
            
            # 創建競賽記錄 - 使用自動遞增 ID
            competition = Competition(
                user_id=user.id,
                name=data.get('name', ''),
                competition_name=data.get('name', ''),  # 同時設置數據庫中的實際欄位
                result=data.get('result', '參賽'),
                description=data.get('description', ''),
                date=competition_date,
                certificate_url=data.get('certificateUrl', ''),
                category=data.get('category', '技術競賽'),
                featured=data.get('featured', True),
                organizer=data.get('organizer', ''),
                location=data.get('location', ''),
                team_size=data.get('teamSize', 1),
                role=data.get('role', ''),
                project_url=data.get('projectUrl', '')
            )
            
            # 設置技術列表
            if data.get('technologies'):
                competition.set_technologies(data['technologies'])

            # 設置作品圖片
            if data.get('projectImages'):
                competition.set_project_images(data['projectImages'])

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

        # 調試：檢查接收到的數據
        print(f"📝 更新競賽 ID {competition_id}")
        print(f"📝 接收到的數據: {data}")
        if data and 'projectImages' in data:
            print(f"📝 作品圖片數據: {data['projectImages']}")

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
                'name', 'result', 'description', 'detailed_description',
                'certificate_url', 'category', 'featured', 'organizer',
                'location', 'team_size', 'role', 'project_url'
            ]

            for field in update_fields:
                api_field = field
                if field == 'certificate_url':
                    api_field = 'certificateUrl'
                elif field == 'team_size':
                    api_field = 'teamSize'
                elif field == 'project_url':
                    api_field = 'projectUrl'
                elif field == 'detailed_description':
                    api_field = 'detailedDescription'

                if api_field in data:
                    setattr(competition, field, data[api_field])
                    # 特別處理 name 欄位，同時更新 competition_name
                    if field == 'name':
                        competition.competition_name = data[api_field]

            # 更新技術列表
            if 'technologies' in data:
                competition.set_technologies(data['technologies'])

            # 更新作品圖片 URL
            if 'projectImages' in data:
                competition.set_project_images(data['projectImages'])
            
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
    
    @app.route('/api/v1/skills/<skill_id>', methods=['PUT'])
    def update_skill(skill_id):
        """更新技能"""
        try:
            skill = Skill.query.get(skill_id)
            if not skill:
                return jsonify({"error": "技能不存在"}), 404
            
            data = request.get_json()
            
            # 更新技能資料
            if 'name' in data:
                skill.name = data['name']
            if 'level' in data:
                skill.level = data['level']
            if 'category' in data:
                skill.category = data['category']
            if 'icon' in data:
                skill.icon = data['icon']
            
            db.session.commit()
            return jsonify(skill.to_dict())
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"更新技能失敗: {str(e)}"}), 500
    
    @app.route('/api/v1/skills/<skill_id>', methods=['DELETE'])
    def delete_skill(skill_id):
        """刪除技能"""
        try:
            skill = Skill.query.get(skill_id)
            if not skill:
                return jsonify({"error": "技能不存在"}), 404
            
            db.session.delete(skill)
            db.session.commit()
            
            return jsonify({"message": "技能已刪除"})
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"刪除技能失敗: {str(e)}"}), 500

    # ===== 專利管理 =====
    @app.route('/api/v1/patents', methods=['GET'])
    def get_patents():
        """獲取所有專利"""
        try:
            patents = Patent.query.order_by(Patent.created_at.desc()).all()
            return jsonify([patent.to_dict() for patent in patents])
        except Exception as e:
            return jsonify({"error": f"獲取專利失敗: {str(e)}"}), 500

    @app.route('/api/v1/patents', methods=['POST'])
    def create_patent():
        """創建新專利"""
        try:
            data = request.get_json()
            
            # 創建新專利
            patent = Patent()
            patent.id = str(uuid.uuid4())
            patent.user_id = 1  # 默認用戶ID
            patent.title = data.get('title', '')
            patent.patent_number = data.get('patentNumber', '')
            patent.description = data.get('description', '')
            patent.category = data.get('category', '發明專利')
            patent.status = data.get('status', '審查中')
            patent.assignee = data.get('assignee', '')
            patent.country = data.get('country', '台灣')
            patent.patent_url = data.get('patentUrl', '')
            patent.classification = data.get('classification', '')
            patent.featured = data.get('featured', False)
            
            # 處理日期欄位
            if data.get('filingDate'):
                try:
                    patent.filing_date = datetime.strptime(data['filingDate'], '%Y-%m-%d').date()
                except:
                    pass
            
            if data.get('grantDate'):
                try:
                    patent.grant_date = datetime.strptime(data['grantDate'], '%Y-%m-%d').date()
                except:
                    pass
                    
            if data.get('publicationDate'):
                try:
                    patent.publication_date = datetime.strptime(data['publicationDate'], '%Y-%m-%d').date()
                except:
                    pass
                    
            if data.get('priorityDate'):
                try:
                    patent.priority_date = datetime.strptime(data['priorityDate'], '%Y-%m-%d').date()
                except:
                    pass
            
            # 處理發明人列表
            if data.get('inventors'):
                patent.set_inventors(data['inventors'])
            
            db.session.add(patent)
            db.session.commit()
            
            return jsonify(patent.to_dict()), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"創建專利失敗: {str(e)}"}), 500

    @app.route('/api/v1/patents/<patent_id>', methods=['PUT'])
    def update_patent(patent_id):
        """更新專利"""
        try:
            patent = Patent.query.get(patent_id)
            if not patent:
                return jsonify({"error": "專利不存在"}), 404
            
            data = request.get_json()
            
            # 更新專利資料
            if 'title' in data:
                patent.title = data['title']
            if 'patentNumber' in data:
                patent.patent_number = data['patentNumber']
            if 'description' in data:
                patent.description = data['description']
            if 'category' in data:
                patent.category = data['category']
            if 'status' in data:
                patent.status = data['status']
            if 'assignee' in data:
                patent.assignee = data['assignee']
            if 'country' in data:
                patent.country = data['country']
            if 'patentUrl' in data:
                patent.patent_url = data['patentUrl']
            if 'classification' in data:
                patent.classification = data['classification']
            if 'featured' in data:
                patent.featured = data['featured']
            
            # 處理日期欄位
            if 'filingDate' in data:
                if data['filingDate']:
                    try:
                        patent.filing_date = datetime.strptime(data['filingDate'], '%Y-%m-%d').date()
                    except:
                        pass
                else:
                    patent.filing_date = None
            
            if 'grantDate' in data:
                if data['grantDate']:
                    try:
                        patent.grant_date = datetime.strptime(data['grantDate'], '%Y-%m-%d').date()
                    except:
                        pass
                else:
                    patent.grant_date = None
                    
            if 'publicationDate' in data:
                if data['publicationDate']:
                    try:
                        patent.publication_date = datetime.strptime(data['publicationDate'], '%Y-%m-%d').date()
                    except:
                        pass
                else:
                    patent.publication_date = None
                    
            if 'priorityDate' in data:
                if data['priorityDate']:
                    try:
                        patent.priority_date = datetime.strptime(data['priorityDate'], '%Y-%m-%d').date()
                    except:
                        pass
                else:
                    patent.priority_date = None
            
            # 處理發明人列表
            if 'inventors' in data:
                patent.set_inventors(data['inventors'])
            
            db.session.commit()
            return jsonify(patent.to_dict())
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"更新專利失敗: {str(e)}"}), 500

    @app.route('/api/v1/patents/<patent_id>', methods=['DELETE'])
    def delete_patent(patent_id):
        """刪除專利"""
        try:
            patent = Patent.query.get(patent_id)
            if not patent:
                return jsonify({"error": "專利不存在"}), 404
            
            db.session.delete(patent)
            db.session.commit()
            
            return jsonify({"message": "專利已刪除"})
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"刪除專利失敗: {str(e)}"}), 500

    @app.route('/api/v1/patents/<patent_id>', methods=['GET'])
    def get_patent(patent_id):
        """獲取單個專利"""
        try:
            patent = Patent.query.get(patent_id)
            if not patent:
                return jsonify({"error": "專利不存在"}), 404
            return jsonify(patent.to_dict())
        except Exception as e:
            return jsonify({"error": f"獲取專利失敗: {str(e)}"}), 500

    # ===== 媒體報導管理 =====
    @app.route('/api/v1/media-coverage', methods=['GET'])
    def get_media_coverage():
        """獲取所有媒體報導"""
        try:
            media_list = MediaCoverage.query.order_by(MediaCoverage.created_at.desc()).all()
            return jsonify([media.to_dict() for media in media_list])
        except Exception as e:
            return jsonify({"error": f"獲取媒體報導失敗: {str(e)}"}), 500

    @app.route('/api/v1/media-coverage', methods=['POST'])
    def create_media_coverage():
        """創建新媒體報導"""
        try:
            data = request.get_json()
            
            # 創建新媒體報導
            media = MediaCoverage()
            media.id = str(uuid.uuid4())
            media.title = data.get('title', '')
            media.media_name = data.get('mediaName', '')
            media.summary = data.get('summary', '')
            media.url = data.get('url', '')  # 修正為 url
            media.image_url = data.get('imageUrl', '')
            media.media_type = data.get('mediaType', '新聞報導')
            media.author = data.get('author', '')
            media.featured = data.get('featured', False)
            media.content = data.get('content', '')
            media.tags = data.get('tags', [])
            
            # 處理發布日期
            if data.get('publicationDate'):
                try:
                    media.publication_date = datetime.strptime(data['publicationDate'], '%Y-%m-%d').date()
                except:
                    pass
            
            db.session.add(media)
            db.session.commit()
            
            return jsonify(media.to_dict()), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"創建媒體報導失敗: {str(e)}"}), 500

    @app.route('/api/v1/media-coverage/<media_id>', methods=['PUT'])
    def update_media_coverage(media_id):
        """更新媒體報導"""
        try:
            media = MediaCoverage.query.get(media_id)
            if not media:
                return jsonify({"error": "媒體報導不存在"}), 404
            
            data = request.get_json()
            
            # 更新媒體報導資料
            if 'title' in data:
                media.title = data['title']
            if 'mediaName' in data:
                media.media_name = data['mediaName']
            if 'summary' in data:
                media.summary = data['summary']
            if 'url' in data:
                media.url = data['url']  # 修正為 url
            if 'imageUrl' in data:
                media.image_url = data['imageUrl']
            if 'mediaType' in data:
                media.media_type = data['mediaType']
            if 'author' in data:
                media.author = data['author']
            if 'featured' in data:
                media.featured = data['featured']
            if 'content' in data:
                media.content = data['content']
            if 'tags' in data:
                media.tags = data['tags']
            
            # 處理發布日期
            if 'publicationDate' in data:
                if data['publicationDate']:
                    try:
                        media.publication_date = datetime.strptime(data['publicationDate'], '%Y-%m-%d').date()
                    except:
                        pass
                else:
                    media.publication_date = None
            
            db.session.commit()
            return jsonify(media.to_dict())
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"更新媒體報導失敗: {str(e)}"}), 500

    @app.route('/api/v1/media-coverage/<media_id>', methods=['DELETE'])
    def delete_media_coverage(media_id):
        """刪除媒體報導"""
        try:
            media = MediaCoverage.query.get(media_id)
            if not media:
                return jsonify({"error": "媒體報導不存在"}), 404
            
            db.session.delete(media)
            db.session.commit()
            
            return jsonify({"message": "媒體報導已刪除"})
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"刪除媒體報導失敗: {str(e)}"}), 500

    @app.route('/api/v1/media-coverage/<media_id>', methods=['GET'])
    def get_single_media_coverage(media_id):
        """獲取單個媒體報導"""
        try:
            media = MediaCoverage.query.get(media_id)
            if not media:
                return jsonify({"error": "媒體報導不存在"}), 404
            return jsonify(media.to_dict())
        except Exception as e:
            return jsonify({"error": f"獲取媒體報導失敗: {str(e)}"}), 500

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

    # ===== About Values 管理 =====
    @app.route('/api/v1/about-values', methods=['GET'])
    def get_about_values():
        """獲取所有About翻卡內容"""
        try:
            about_values = AboutValue.query.filter_by(is_active=True).order_by(AboutValue.order_index).all()
            return jsonify([value.to_dict() for value in about_values])
        except Exception as e:
            return jsonify({"error": f"獲取About內容失敗: {str(e)}"}), 500

    @app.route('/api/v1/about-values', methods=['POST'])
    def create_about_value():
        """創建新的About翻卡內容"""
        try:
            data = request.get_json()

            about_value = AboutValue()
            about_value.id = str(uuid.uuid4())
            about_value.icon = data.get('icon', 'Code')
            about_value.title = data.get('title', '')
            about_value.subtitle = data.get('subtitle', '')
            about_value.description = data.get('description', '')
            about_value.details = data.get('details', [])
            about_value.order_index = data.get('orderIndex', 0)
            about_value.is_active = data.get('isActive', True)

            db.session.add(about_value)
            db.session.commit()

            return jsonify(about_value.to_dict()), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"創建About內容失敗: {str(e)}"}), 500

    @app.route('/api/v1/about-values/<value_id>', methods=['PUT'])
    def update_about_value(value_id):
        """更新About翻卡內容"""
        try:
            about_value = AboutValue.query.get(value_id)
            if not about_value:
                return jsonify({"error": "找不到該內容"}), 404

            data = request.get_json()

            about_value.icon = data.get('icon', about_value.icon)
            about_value.title = data.get('title', about_value.title)
            about_value.subtitle = data.get('subtitle', about_value.subtitle)
            about_value.description = data.get('description', about_value.description)
            about_value.details = data.get('details', about_value.details)
            about_value.order_index = data.get('orderIndex', about_value.order_index)
            about_value.is_active = data.get('isActive', about_value.is_active)

            db.session.commit()

            return jsonify(about_value.to_dict())

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"更新About內容失敗: {str(e)}"}), 500

    @app.route('/api/v1/about-values/<value_id>', methods=['DELETE'])
    def delete_about_value(value_id):
        """刪除About翻卡內容"""
        try:
            about_value = AboutValue.query.get(value_id)
            if not about_value:
                return jsonify({"error": "找不到該內容"}), 404

            db.session.delete(about_value)
            db.session.commit()

            return jsonify({"message": "About內容已刪除"})

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"刪除About內容失敗: {str(e)}"}), 500

    @app.route('/api/v1/about-values/reorder', methods=['POST'])
    def reorder_about_values():
        """重新排序About翻卡內容"""
        try:
            data = request.get_json()
            ordered_ids = data.get('orderedIds', [])

            for index, value_id in enumerate(ordered_ids):
                about_value = AboutValue.query.get(value_id)
                if about_value:
                    about_value.order_index = index

            db.session.commit()

            return jsonify({"message": "排序已更新"})

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"更新排序失敗: {str(e)}"}), 500    @app.route('/api/v1/files', methods=['POST'])
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

    # ===== 文件上傳端點 =====
    @app.route('/api/v1/upload', methods=['POST'])
    def upload_multipart_file():
        """處理文件上傳"""
        try:
            if 'file' not in request.files:
                return jsonify({"error": "沒有文件"}), 400

            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "沒有選擇文件"}), 400

            if file:
                # 生成安全的文件名
                from werkzeug.utils import secure_filename

                # 獲取文件擴展名
                filename = secure_filename(file.filename)
                ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''

                # 驗證文件類型
                allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
                if ext not in allowed_extensions:
                    return jsonify({"error": f"不支援的文件格式。允許的格式：{', '.join(allowed_extensions)}"}), 400

                # 生成唯一文件名
                unique_filename = f"{uuid.uuid4().hex}.{ext}"

                # 確保上傳目錄存在
                upload_dir = current_app.config['UPLOAD_FOLDER']
                os.makedirs(upload_dir, exist_ok=True)

                # 保存文件
                file_path = os.path.join(upload_dir, unique_filename)
                file.save(file_path)

                # 返回文件 URL
                file_url = f"/uploads/{unique_filename}"
                return jsonify({
                    "success": True,
                    "file_url": file_url,
                    "filename": unique_filename
                })

        except Exception as e:
            return jsonify({"error": f"文件上傳失敗: {str(e)}"}), 500

    # ===== 靜態文件服務 =====
    @app.route('/uploads/<filename>')
    def serve_uploaded_file(filename):
        """提供上傳的文件"""
        try:
            upload_dir = current_app.config['UPLOAD_FOLDER']
            return send_from_directory(upload_dir, filename)
        except Exception as e:
            return jsonify({"error": f"文件不存在: {str(e)}"}), 404

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
                "team_size": 3,
                "role": "隊長",
                "technologies": ["C++", "Python", "Algorithm"]
            }
        ]
        
        for comp_data in competitions_data:
            comp_date = datetime.strptime(comp_data['date'], '%Y-%m-%d').date()
            competition = Competition(
                user_id=user.id,
                name=comp_data['name'],
                competition_name=comp_data['name'],
                result=comp_data['result'],
                description=comp_data['description'],
                date=comp_date,
                category=comp_data['category'],
                featured=True,
                organizer=comp_data['organizer'],
                location=comp_data['location'],
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