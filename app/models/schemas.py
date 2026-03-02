from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


# ===== User Schemas =====

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: str
    full_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = None


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[str] = None
    full_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    bio: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    count: int


# ===== Product Schemas =====

class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    price: float = Field(gt=0)
    stock: int = Field(default=0, ge=0)
    category: Optional[str] = Field(None, max_length=50)


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    category: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    stock: int
    category: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    count: int


# ===== Shared Schemas =====

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None


class DashboardStats(BaseModel):
    total_users: int
    active_users: int
    total_products: int
    active_products: int
    total_stock: int
