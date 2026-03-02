from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import Product, User

router = APIRouter(tags=["pages"])
templates = Jinja2Templates(directory="app/templates")


@router.get("/")
def root():
    return RedirectResponse(url="/dashboard")


@router.get("/dashboard")
def dashboard_page(request: Request, db: Session = Depends(get_db)):
    stats = {
        "total_users": db.query(User).count(),
        "active_users": db.query(User).filter(User.is_active == True).count(),
        "total_products": db.query(Product).count(),
        "active_products": db.query(Product).filter(Product.is_active == True).count(),
        "total_stock": db.query(func.sum(Product.stock)).scalar() or 0,
    }
    return templates.TemplateResponse(
        "dashboard.html",
        {"request": request, "stats": stats, "active_page": "dashboard"},
    )


@router.get("/users")
def users_page(request: Request):
    return templates.TemplateResponse(
        "users.html",
        {"request": request, "active_page": "users"},
    )


@router.get("/products")
def products_page(request: Request):
    return templates.TemplateResponse(
        "products.html",
        {"request": request, "active_page": "products"},
    )
