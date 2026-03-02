import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.database.database import engine
from app.models.models import Base
from app.routes.pages import router as pages_router
from app.routes.products import router as products_router
from app.routes.users import router as users_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Mock Admin Dashboard",
    description="FastAPI + Jinja2 + SQLite を使用したモック管理画面ダッシュボード",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(pages_router)
app.include_router(users_router)
app.include_router(products_router)


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(status_code=404, content={"detail": "リソースが見つかりません"})


@app.on_event("startup")
async def startup_event():
    logger.info("Admin Dashboard 起動完了")
    logger.info("ダッシュボード: http://localhost:8000/dashboard")
    logger.info("API ドキュメント: http://localhost:8000/api/docs")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Admin Dashboard シャットダウン")
