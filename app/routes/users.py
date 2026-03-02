from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import User
from app.models.schemas import UserCreate, UserListResponse, UserResponse, UserUpdate

router = APIRouter(prefix="/api/users", tags=["api-users"])


@router.get("", response_model=UserListResponse)
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    total = db.query(User).count()
    users = db.query(User).offset(skip).limit(limit).all()
    return UserListResponse(users=users, total=total, count=len(users))


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"ユーザー名 '{user_in.username}' は既に使用されています",
        )
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"メールアドレス '{user_in.email}' は既に使用されています",
        )
    user = User(**user_in.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ユーザー ID {user_id} が見つかりません",
        )
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ユーザー ID {user_id} が見つかりません",
        )
    update_data = user_in.model_dump(exclude_unset=True)
    if "username" in update_data:
        existing = db.query(User).filter(
            User.username == update_data["username"], User.id != user_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"ユーザー名 '{update_data['username']}' は既に使用されています",
            )
    if "email" in update_data:
        existing = db.query(User).filter(
            User.email == update_data["email"], User.id != user_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"メールアドレス '{update_data['email']}' は既に使用されています",
            )
    for field, value in update_data.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ユーザー ID {user_id} が見つかりません",
        )
    db.delete(user)
    db.commit()
