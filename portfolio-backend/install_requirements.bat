@echo off
echo Installing Python packages for Portfolio Backend...
pip install fastapi==0.104.1
pip install uvicorn[standard]==0.24.0
pip install sqlalchemy==2.0.23
pip install pymysql==1.1.0
pip install python-multipart==0.0.6
pip install python-jose[cryptography]==3.3.0
pip install passlib[bcrypt]==1.7.4
pip install python-dotenv==1.0.0
pip install pydantic==2.5.0
pip install pydantic-settings==2.1.0
pip install alembic==1.13.1
pip install pytest==7.4.3
pip install httpx==0.25.2
echo Installation completed!
pause