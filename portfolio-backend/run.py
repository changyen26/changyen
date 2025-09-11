import uvicorn
import os
from app.main import app

if __name__ == "__main__":
    # Determine if running in production
    is_production = os.getenv("ENVIRONMENT", "development") == "production"
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=not is_production,
        log_level="info" if not is_production else "warning"
    )