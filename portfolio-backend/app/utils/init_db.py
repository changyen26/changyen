from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import User, Patent, Competition, NewsArticle
from app import crud, schemas
from datetime import date, datetime


def init_db() -> None:
    """
    初始化資料庫並創建示例數據
    """
    # Create tables
    from app.core.database import Base
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if user already exists
        user = crud.user.get_by_email(db, email="zhangzhiqiang@email.com")
        if not user:
            # Create user
            user_in = schemas.UserCreate(
                name="張智強",
                title="創新研發工程師 & 競賽達人",
                email="zhangzhiqiang@email.com",
                phone="+886 912-345-678",
                bio="專精於人工智能與機器學習領域的研發工程師，擁有多項專利發明及國際競賽獲獎經驗。致力於將創新技術應用於實際解決方案中，推動科技進步與社會發展。",
                avatar_url="/images/avatar.jpg"
            )
            user = crud.user.create(db, obj_in=user_in)
            print(f"Created user: {user.name}")

        # Create patents
        patents_data = [
            {
                "title": "基於深度學習的影像辨識系統及其方法",
                "patent_number": "TW-I765432",
                "description": "一種創新的影像辨識系統，結合卷積神經網路與注意力機制，提升辨識準確率達95%以上。",
                "filing_date": date(2022, 3, 15),
                "grant_date": date(2023, 8, 20),
                "status": "granted",
                "category": "人工智能"
            },
            {
                "title": "智慧物聯網感測器網路架構",
                "patent_number": "TW-I789012",
                "description": "創新的物聯網感測器網路設計，具備自適應通訊協定與低功耗特性。",
                "filing_date": date(2022, 7, 10),
                "grant_date": date(2024, 1, 15),
                "status": "granted",
                "category": "物聯網"
            },
            {
                "title": "區塊鏈去中心化身份驗證系統",
                "patent_number": "TW-A123456",
                "description": "基於區塊鏈技術的身份驗證系統，提供安全且高效的去中心化認證機制。",
                "filing_date": date(2023, 2, 20),
                "grant_date": None,
                "status": "pending",
                "category": "區塊鏈"
            }
        ]

        for patent_data in patents_data:
            existing_patent = db.query(Patent).filter(Patent.patent_number == patent_data["patent_number"]).first()
            if not existing_patent:
                patent_in = schemas.PatentCreate(user_id=user.id, **patent_data)
                patent = crud.patent.create(db, obj_in=patent_in)
                print(f"Created patent: {patent.title}")

        # Create competitions
        competitions_data = [
            {
                "competition_name": "國際人工智能創新競賽 IAIC 2023",
                "award_title": "金獎",
                "rank_position": "第1名",
                "date": date(2023, 9, 15),
                "description": "以『智慧醫療診斷輔助系統』獲得國際人工智能創新競賽金獎，該系統能協助醫師提升診斷準確率30%。",
                "certificate_url": "/certificates/iaic-2023.pdf"
            },
            {
                "competition_name": "全球物聯網創新挑戰賽 IoT Challenge",
                "award_title": "最佳創新獎",
                "rank_position": "第2名",
                "date": date(2022, 11, 28),
                "description": "開發智慧農業監控系統，整合多種感測器實現精準農業管理，獲得評審一致好評。",
                "certificate_url": "/certificates/iot-challenge.pdf"
            },
            {
                "competition_name": "亞洲機器學習競賽 AMLC 2024",
                "award_title": "優勝獎",
                "rank_position": "第3名",
                "date": date(2024, 5, 20),
                "description": "運用先進的深度學習技術解決複雜的電腦視覺問題，展現優秀的技術實力。",
                "certificate_url": "/certificates/amlc-2024.pdf"
            }
        ]

        for comp_data in competitions_data:
            existing_comp = db.query(Competition).filter(
                Competition.competition_name == comp_data["competition_name"],
                Competition.user_id == user.id
            ).first()
            if not existing_comp:
                comp_in = schemas.CompetitionCreate(user_id=user.id, **comp_data)
                competition = crud.competition.create(db, obj_in=comp_in)
                print(f"Created competition: {competition.competition_name}")

        # Create news articles
        news_data = [
            {
                "headline": "年輕工程師獲國際AI競賽金獎，創新醫療技術受矚目",
                "media_outlet": "科技新報",
                "publication_date": date(2023, 9, 20),
                "article_url": "https://technews.tw/2023/09/20/young-engineer-ai-award/",
                "summary": "張智強以創新的智慧醫療診斷輔助系統獲得IAIC 2023金獎，該技術有望革新醫療診斷流程...",
                "image_url": "/images/news-1.jpg"
            },
            {
                "headline": "台灣之光！本土研發專利技術領先國際",
                "media_outlet": "經濟日報",
                "publication_date": date(2023, 8, 25),
                "article_url": "https://money.udn.com/money/story/5612/taiwan-patent-innovation",
                "summary": "在人工智能影像辨識領域，台灣年輕研發人員張智強的專利技術獲得國際認可，辨識準確率突破95%...",
                "image_url": "/images/news-2.jpg"
            },
            {
                "headline": "物聯網創新應用，智慧農業系統獲國際獎項",
                "media_outlet": "農業週刊",
                "publication_date": date(2022, 12, 5),
                "article_url": "https://agriweek.com/2022/12/05/iot-smart-farming-award/",
                "summary": "結合物聯網與人工智能技術的智慧農業監控系統，幫助農民提升作物產量20%，獲得國際競賽肯定...",
                "image_url": "/images/news-3.jpg"
            }
        ]

        for news_item in news_data:
            existing_news = db.query(NewsArticle).filter(
                NewsArticle.headline == news_item["headline"],
                NewsArticle.user_id == user.id
            ).first()
            if not existing_news:
                news_in = schemas.NewsArticleCreate(user_id=user.id, **news_item)
                article = crud.news_article.create(db, obj_in=news_in)
                print(f"Created news article: {article.headline}")

        print("Database initialization completed!")

    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    init_db()